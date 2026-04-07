var BG_KEY  = "AIzaSyDndLPk14Y0uu2tEQ82CXbbb_duJshBZBI"
var BG_BASE = "https://firestore.googleapis.com/v1/projects/anti-cheating-extension-4f1ad/databases/(default)/documents"

async function bgWriteLog(log) {
  var fields = {}
  Object.entries(log).forEach(([k, v]) => fields[k] = { stringValue: String(v ?? "") })
  try {
    var res = await fetch(BG_BASE + "/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": BG_KEY },
      body: JSON.stringify({ fields })
    })
    if (!res.ok) { console.warn("[BG] write failed", res.status, await res.text()); return false }
    return true
  } catch (e) { console.warn("[BG] network error:", e.message); return false }
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({
    all_logs:        [],
    student_session: null,
    student_login:   null,
    teacher_login:   false,
    teacher_user:    null
  })
})

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "FB_WRITE_LOG") {
    bgWriteLog(msg.log)
      .then(ok => sendResponse({ ok }))
      .catch(() => sendResponse({ ok: false }))
    return true
  }

  if (msg.action === "GET_ACTIVE_TAB") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
      sendResponse({ url: tabs[0] ? tabs[0].url : "" })
    })
    return true
  }
})
