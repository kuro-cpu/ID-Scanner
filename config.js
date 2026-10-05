/* =====================================================================
   1) FOR SCHOOL SECTION NAVIGATION
   ===================================================================== */
   const CONFIG = {

    destinations: [
      { label: "View study load", url: "https://serp.uv.edu.ph/SERP/Student/Main.aspx?_sid=25210043" },
      { label: "UV Blackboard",  url: "https://uv.blackboard.com/ultra/course" }          // no {ID} = plain link
    ],
  
    idPattern: /^[\w-]{4,20}$/,
  
    stripPrefix: "",
  
    autoOpen: false,
  
    formats: ["CODE_128", "CODE_39", "EAN_13", "ITF", "CODABAR", "QR_CODE"]
  };
