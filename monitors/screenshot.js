var wasFullscreen = false

function mountScreenshotMonitors() {

  function checkFullscreenExit() {
    var now = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
    if (examActive && wasFullscreen && !now) log("FULLSCREEN_EXIT", "Exited fullscreen mode")
    wasFullscreen = now
  }

  document.addEventListener("fullscreenchange",       checkFullscreenExit)
  document.addEventListener("webkitfullscreenchange", checkFullscreenExit)
  document.addEventListener("mozfullscreenchange",    checkFullscreenExit)
  document.addEventListener("MSFullscreenChange",     checkFullscreenExit)


  document.addEventListener("visibilitychange", function() {
    if (!examActive) return
    if (document.hidden && wasFullscreen) {
  
      log("FULLSCREEN_EXIT", "Window minimized or hidden during fullscreen")
      wasFullscreen = false
    }
  })

  window.addEventListener("resize", function() {
    if (!examActive || !wasFullscreen) return
    var inFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
    if (!inFS) {
      log("FULLSCREEN_EXIT", "Window resized out of fullscreen (minimize or window resize)")
      wasFullscreen = false
    }
  })


  document.addEventListener("keydown", function(e) {
    if (!examActive) return
    if (e.key === "Escape" || e.key === "Esc") {
      var inFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)
 
      if (wasFullscreen || inFS) {
        setTimeout(function() {
          var stillFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)
          if (!stillFS) {
            log("FULLSCREEN_EXIT", "Exited fullscreen via ESC key")
            wasFullscreen = false
          }
        }, 200)
      }
    }


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
    if (!examActive) return
    if (e.key === "PrintScreen") log("SCREENSHOT", "Print Screen released — possible screenshot taken")
  })

  var guard = document.createElement("div")
  guard.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;opacity:0"
  guard.id = "_ace_screen_guard"
  if (document.body) document.body.appendChild(guard)

  try {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!examActive) return
        if (!entry.isIntersecting) log("SCREENSHOT", "Screen capture or window resize detected")
      })
    }, { threshold: 1.0 })
    obs.observe(guard)
  } catch(e) {}
}

