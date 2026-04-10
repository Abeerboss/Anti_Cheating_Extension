var $ = id => document.getElementById(id)

function showMsg(boxId, text, type) {
  var el = $(boxId); if (!el) return
  el.textContent = text
  el.className   = "msg-box show " + type
  clearTimeout(el._t)
  el._t = setTimeout(() => { el.textContent = ""; el.className = "msg-box" }, 5000)
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"))
  $(id).classList.remove("hidden")
}

function loading(el, text) {
  el.innerHTML =
    '<div style="padding:60px;text-align:center;color:#6e7681;font-size:11px">' +
    '<div style="font-size:24px;margin-bottom:12px">⏳</div>' +
    (text || "Loading...") + "</div>"
}

function switchAuthTab(showTab, hideTab, showPanel, hidePanel) {
  $(showTab).classList.add("active");      $(hideTab).classList.remove("active")
  $(showPanel).classList.remove("hidden"); $(hidePanel).classList.add("hidden")
}
