var monitorsActive = false

function mountMonitors() {
  if (monitorsActive) return
  monitorsActive = true
  mountTabFocusMonitors()
  mountClipboardMonitors()
  mountScreenshotMonitors()
}

chrome.storage.local.get(["student_session"], function(d) {
  if (d.student_session && d.student_session.exam_active) {
    loggerActivate(d.student_session)
    mountMonitors()
   
    wasFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)
  }
})

chrome.runtime.onMessage.addListener(function(msg) {
  if (msg.action === "EXAM_START") {
    loggerActivate(msg.session || {})
    log("LOGIN_LOGOUT", "Exam started")
    mountMonitors()
    wasFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)
  }
  if (msg.action === "ENTER_FULLSCREEN") {
    var el = document.documentElement
    var req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
    if (req) {
      req.call(el).then(function() {
        wasFullscreen = true
      }).catch(function() {
        
        wasFullscreen = false
        log("FULLSCREEN_EXIT", "Fullscreen could not be entered or was denied")
      })
    } else {
     
      wasFullscreen = false
      log("FULLSCREEN_EXIT", "Fullscreen API not supported on this page")
    }
  }
  if (msg.action === "EXAM_END") {
    log("LOGIN_LOGOUT", "Exam ended")
    loggerDeactivate()
    monitorsActive = false
    wasFullscreen = false
  }
})
