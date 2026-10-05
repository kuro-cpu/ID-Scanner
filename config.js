/* =====================================================================
   1) FOR SCHOOL SECTION NAVIGATION
   ===================================================================== */
   const CONFIG = {

    destinations: [
      { label: "View study load", url: "https://example.edu/portal/study-load?student={ID}" },
      { label: "School website",  url: "https://example.edu" }          // no {ID} = plain link
    ],
  
    idPattern: /^[\w-]{4,20}$/,
  
    stripPrefix: "",
  
    autoOpen: false,
  
    formats: ["CODE_128", "CODE_39", "EAN_13", "ITF", "CODABAR", "QR_CODE"]
  };