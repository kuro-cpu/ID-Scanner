const $ = id => document.getElementById(id);
const statusEl = $("status");
let scanner = null, running = false, lastScan = "", lastTime = 0;

function setStatus(msg, bad) { statusEl.textContent = msg; statusEl.className = bad ? "bad" : ""; }

function cleanId(raw) {
  let id = String(raw).trim();
  if (CONFIG.stripPrefix && id.startsWith(CONFIG.stripPrefix)) id = id.slice(CONFIG.stripPrefix.length);
  return id;
}

function buildUrl(template, id) {
  return template.replace("{ID}", encodeURIComponent(id));
}

function handleId(raw) {
  const id = cleanId(raw);
  if (!CONFIG.idPattern.test(id)) {
    setStatus("That doesn't look like a valid school ID: " + id, true);
    return;
  }
  setStatus("ID read successfully.");
  showResult(id);
  if ($("auto").checked) {
    window.location.href = buildUrl(CONFIG.destinations[0].url, id);
  }
}

function showResult(id) {
  $("idValue").textContent = id;
  const box = $("links");
  box.innerHTML = "";
  CONFIG.destinations.forEach((d, i) => {
    const a = document.createElement("a");
    a.className = "btn " + (i === 0 ? "primary" : "ghost");
    a.href = buildUrl(d.url, id);
    a.textContent = d.label;
    // Remove target/rel below if you prefer opening in the same tab.
    a.target = "_blank"; a.rel = "noopener";
    box.appendChild(a);
  });
  $("result").hidden = false;
}

async function startScanner() {
  if (running) return;
  const F = Html5QrcodeSupportedFormats;
  scanner = new Html5Qrcode("reader", {
    formatsToSupport: CONFIG.formats.map(f => F[f]).filter(v => v !== undefined),
    useBarCodeDetectorIfSupported: true,
    verbose: false
  });

  const onScan = (text) => {
    const now = Date.now();
    if (text === lastScan && now - lastTime < 3000) return;
    lastScan = text; lastTime = now;
    handleId(text);
  };

  // Try high quality first, then fall back to a simple setup
  const attempts = [
    { fps: 15, videoConstraints: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } },
    { fps: 10 }
  ];

  let started = false, lastErr = null;
  for (const cfg of attempts) {
    try {
      await scanner.start({ facingMode: "environment" }, cfg, onScan, () => {});
      started = true;
      break;
    } catch (e) {
      lastErr = e;
      console.error("Camera start failed:", e);
    }
  }

  if (!started) {
    const name = (lastErr && (lastErr.name || lastErr.message || String(lastErr))) || "Unknown error";
    setStatus("Could not open the camera (" + name + "). Allow camera access, use https://, and open this page in Chrome or Safari.", true);
    return;
  }

  running = true;
  $("startBtn").hidden = true; $("stopBtn").hidden = false;
  setStatus("Point the camera at the barcode.");

  // Try continuous autofocus (ignored if the phone doesn't support it)
  try { await scanner.applyVideoConstraints({ advanced: [{ focusMode: "continuous" }] }); } catch (e) {}

  // Zoom slider (shows only where supported)
  try {
    const caps = scanner.getRunningTrackCapabilities();
    if (caps.zoom) {
      const z = $("zoom");
      z.min = caps.zoom.min; z.max = caps.zoom.max; z.step = caps.zoom.step || 0.1;
      z.value = scanner.getRunningTrackSettings().zoom || caps.zoom.min;
      $("zoomWrap").hidden = false;
      z.oninput = () => scanner.applyVideoConstraints({ advanced: [{ zoom: Number(z.value) }] });
    }
  } catch (e) {}
}
