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
  try {
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: (w) => ({ width: Math.floor(w * 0.9), height: Math.floor(w * 0.4) }) },
      (text) => {
        const now = Date.now();
        if (text === lastScan && now - lastTime < 3000) return; // ignore repeat reads
        lastScan = text; lastTime = now;
        handleId(text);
      },
      () => {} // per-frame "no barcode found" noise, ignore
    );
    running = true;
    $("startBtn").hidden = true; $("stopBtn").hidden = false;
    setStatus("Point the camera at the barcode.");
  } catch (err) {
    setStatus("Could not open the camera. Allow camera access and make sure the page uses https://", true);
  }
}

async function stopScanner() {
  if (!running) return;
  await scanner.stop(); scanner.clear();
  running = false;
  $("startBtn").hidden = false; $("stopBtn").hidden = true;
  setStatus("Camera stopped.");
}

$("startBtn").onclick = startScanner;
$("stopBtn").onclick = stopScanner;
$("manualBtn").onclick = () => handleId($("manual").value);
$("manual").addEventListener("keydown", e => { if (e.key === "Enter") handleId(e.target.value); });
$("auto").checked = CONFIG.autoOpen;