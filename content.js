var examActive  = false
var sessionInfo = {}

chrome.runtime.onMessage.addListener(function(msg) {
  if (msg.action === "EXAM_START") {
    examActive  = true
    sessionInfo = msg.session || {}
    addLog("LOGIN_LOGOUT", "Exam started")
  }
  if (msg.action === "EXAM_END") {
    addLog("LOGIN_LOGOUT", "Exam ended")
    examActive  = false
    sessionInfo = {}
  }
})

chrome.storage.local.get(["student_session"], function(data) {
  if (data.student_session && data.student_session.exam_active) {
    examActive  = true
    sessionInfo = data.student_session
  }
})

function addLog(type, detail) {
  if (!examActive) return

  var log = {
    violation_type: type,
    detail:         detail || "",
    student_id:     sessionInfo.student_id   || "Unknown",
    student_name:   sessionInfo.student_name || "Unknown",
    exam_title:     sessionInfo.exam_title   || "Unknown",
    timestamp:      new Date().toISOString(),
    url:            window.location.href
  }

  chrome.storage.local.get(["all_logs"], function(data) {
    var all = data.all_logs || []
    all.push(log)
    chrome.storage.local.set({ all_logs: all })
  })

  chrome.runtime.sendMessage({ action: "FB_WRITE_LOG", log: log }, function(res) {
    if (chrome.runtime.lastError) {
      console.warn("[ACE] Firebase relay error:", chrome.runtime.lastError.message)
    }
  })
}


document.addEventListener("visibilitychange", function() {
  if (document.hidden) addLog("TAB_SWITCH", "Student switched tab or minimized window")
})

document.addEventListener("fullscreenchange", function() {
  if (!document.fullscreenElement) addLog("FULLSCREEN_EXIT", "Exited fullscreen mode")
})
document.addEventListener("webkitfullscreenchange", function() {
  if (!document.webkitFullscreenElement) addLog("FULLSCREEN_EXIT", "Exited fullscreen mode (webkit)")
})

document.addEventListener("copy", function(e) {
  e.preventDefault()
  var sel = window.getSelection() ? window.getSelection().toString().slice(0, 60) : ""
  addLog("COPY_ATTEMPT", 'Copy blocked — selected: "' + sel + '"')
})

document.addEventListener("cut", function(e) {
  e.preventDefault()
  addLog("COPY_ATTEMPT", "Cut attempt blocked")
})

document.addEventListener("paste", function(e) {
  e.preventDefault()
  addLog("PASTE_ATTEMPT", "Paste attempt blocked")
})


document.addEventListener("contextmenu", function(e) {
  e.preventDefault()
  addLog("RIGHT_CLICK", "Right-click blocked at (" + e.clientX + "," + e.clientY + ")")
})


document.addEventListener("keydown", function(e) {
  var ctrl = e.ctrlKey || e.metaKey
  if (ctrl && ["c","v","x"].indexOf(e.key.toLowerCase()) >= 0) {
    e.preventDefault()
  }
  if (ctrl && ["p","s","u"].indexOf(e.key.toLowerCase()) >= 0) {
    e.preventDefault()
    addLog("COPY_ATTEMPT", "Blocked: Ctrl+" + e.key.toUpperCase())
  }
  if (e.key === "F12") {
    e.preventDefault()
    addLog("COPY_ATTEMPT", "F12 DevTools blocked")
  }
})
