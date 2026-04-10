var COLOURS = {
  TAB_SWITCH:     "#ffaa00",
  FULLSCREEN_EXIT:"#ff4757",
  COPY_ATTEMPT:   "#47c8ff",
  PASTE_ATTEMPT:  "#47c8ff",
  RIGHT_CLICK:    "#a78bfa",
  LOGIN_LOGOUT:   "#6e7681",
  SCREENSHOT:     "#ff6b35",
  AI_SITE_VISIT:  "#ff4757"
}

var SEV = {
  high: ["TAB_SWITCH","FULLSCREEN_EXIT","COPY_ATTEMPT","PASTE_ATTEMPT","SCREENSHOT","AI_SITE_VISIT"],
  med:  ["RIGHT_CLICK"]
}

function sevClass(type) {
  return SEV.high.includes(type) ? "high" : SEV.med.includes(type) ? "med" : "low"
}

function violationLabel(type) {
  return (type || "").replace(/_/g, " ")
}
