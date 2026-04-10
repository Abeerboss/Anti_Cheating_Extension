function mountClipboardMonitors() {
  document.addEventListener("copy", function(e) {
    e.preventDefault()
    log("COPY_ATTEMPT", 'Copy blocked — "' + (getSelection()?.toString().slice(0, 60) || "") + '"')
  })

  document.addEventListener("cut", function(e) {
    e.preventDefault()
    log("COPY_ATTEMPT", "Cut blocked")
  })

  document.addEventListener("paste", function(e) {
    e.preventDefault()
    log("PASTE_ATTEMPT", "Paste blocked")
  })

  document.addEventListener("contextmenu", function(e) {
    e.preventDefault()
    log("RIGHT_CLICK", "Right-click at (" + e.clientX + "," + e.clientY + ")")
  })

  document.addEventListener("keydown", function(e) {
    var ctrl = e.ctrlKey || e.metaKey
    if (ctrl && e.key.toLowerCase() === "c") { e.preventDefault(); log("COPY_ATTEMPT",  'Ctrl+C — "' + (getSelection()?.toString().slice(0, 60) || "") + '"') }
    if (ctrl && e.key.toLowerCase() === "x") { e.preventDefault(); log("COPY_ATTEMPT",  "Ctrl+X blocked") }
    if (ctrl && e.key.toLowerCase() === "v") { e.preventDefault(); log("PASTE_ATTEMPT", "Ctrl+V blocked") }
    if (ctrl && "psu".includes(e.key.toLowerCase())) { e.preventDefault(); log("COPY_ATTEMPT", "Ctrl+" + e.key.toUpperCase() + " blocked") }
    if (e.key === "F12") { e.preventDefault(); log("COPY_ATTEMPT", "F12 blocked") }
  })
}
