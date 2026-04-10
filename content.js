function mountMonitors() {
  mountTabFocusMonitors()
  mountClipboardMonitors()
  mountScreenshotMonitors()
}

chrome.storage.local.get(["student_session"], function(d) {
  if (d.student_session && d.student_session.exam_active) {
    loggerActivate(d.student_session)
    mountMonitors()
  }
})

chrome.runtime.onMessage.addListener(function(msg) {
  if (msg.action === "EXAM_START") {
    loggerActivate(msg.session || {})
    log("LOGIN_LOGOUT", "Exam started")
    mountMonitors()
  }
  if (msg.action === "EXAM_END") {
    log("LOGIN_LOGOUT", "Exam ended")
    loggerDeactivate()
  }
})
