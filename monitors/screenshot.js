var wasFullscreen = false

function mountScreenshotMonitors() {
  document.addEventListener("fullscreenchange", function() {
    var now = !!document.fullscreenElement
    if (wasFullscreen && !now) log("FULLSCREEN_EXIT", "Exited fullscreen")
    wasFullscreen = now
  })

  document.addEventListener("webkitfullscreenchange", function() {
    var now = !!document.webkitFullscreenElement
    if (wasFullscreen && !now) log("FULLSCREEN_EXIT", "Exited fullscreen (webkit)")
    wasFullscreen = now
  })

  document.addEventListener("keydown", function(e) {
    if (e.key === "PrintScreen") {
      e.preventDefault()
      log("SCREENSHOT", "Print Screen key blocked")
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
      e.preventDefault()
      log("SCREENSHOT", "Ctrl+Shift+S (snipping tool) blocked")
    }
    if (e.metaKey && e.shiftKey && ["3","4","5"].includes(e.key)) {
      log("SCREENSHOT", "Mac screenshot shortcut detected (Cmd+Shift+" + e.key + ")")
    }
  })

  document.addEventListener("keyup", function(e) {
    if (e.key === "PrintScreen") log("SCREENSHOT", "Print Screen released — possible screenshot taken")
  })

  var guard = document.createElement("div")
  guard.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;opacity:0"
  guard.id = "_ace_screen_guard"
  document.body && document.body.appendChild(guard)

  try {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) log("SCREENSHOT", "Screen capture or window resize detected")
      })
    }, { threshold: 1.0 })
    obs.observe(guard)
  } catch(e) {}
}
