var BG_API_KEY = "AIzaSyCmMOIYzOpGOyVHPUvylWA4hcakYa7bu10"
var BG_FS_BASE = "https://firestore.googleapis.com/v1/projects/anti-cheating-extension/databases/(default)/documents"

async function bgWriteLog(log) {
  var fields = {}
  Object.entries(log).forEach(function(pair) {
    fields[pair[0]] = { stringValue: String(pair[1] == null ? "" : pair[1]) }
  })
  try {
    var res  = await fetch(BG_FS_BASE + "/logs", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": BG_API_KEY },
      body:    JSON.stringify({ fields: fields })
    })
    var text = await res.text()
    if (!res.ok) {
      var msg = ""
      try { msg = JSON.parse(text).error.message } catch(e) { msg = text }
      console.warn("[Anti-Cheating Extension BG] Write failed", res.status, msg)
      return false
    }
    return true
  } catch (e) {
    console.warn("[Anti-Cheating Extension BG] Network error:", e.message)
    return false
  }
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({
    all_logs:        [],
    students:        [],
    student_session: null,
    student_login:   null,
    teacher_login:   false,
    teacher_user:    null
  })
  console.log("[Anti-Cheating Extension] Installed — project: anti-cheating-extension")
})

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "FB_WRITE_LOG") {
    bgWriteLog(msg.log)
      .then(function(ok) { sendResponse({ ok: ok }) })
      .catch(function(e) { console.warn("[Anti-Cheating Extension BG] Relay error:", e); sendResponse({ ok: false }) })
    return true
  }
})
