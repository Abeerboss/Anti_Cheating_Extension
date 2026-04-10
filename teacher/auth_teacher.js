var ADMIN_CODE    = "ACE-ADMIN-2025"
var currentTeacherUser = null

function initTeacherAuth() {
  $("t-pass").addEventListener("keydown", e => e.key === "Enter" && $("btn-t-login").click())
  $("btn-close").addEventListener("click", () => window.close())
  $("btn-t-login").addEventListener("click", onTeacherLogin)
  $("btn-teacher-logout").addEventListener("click", onTeacherLogout)
  $("lnk-admin-setup").addEventListener("click", function(e) {
    e.preventDefault()
    $("admin-setup-wrap").classList.toggle("hidden")
  })
  $("btn-admin-register").addEventListener("click", onAdminRegister)
}

async function onTeacherLogin() {
  var user = $("t-user").value.trim(), pass = $("t-pass").value.trim()
  if (!user || !pass) { showMsg("t-login-msg", "✗ Fill in all fields", "red"); return }
  showMsg("t-login-msg", "Checking Firebase...", "blue")
  try {
    var teachers = await fbReadAll("teachers")
    var match    = teachers.find(t => t.username === user && t.password === pass)
    if (!match) { showMsg("t-login-msg", "✗ Wrong username or password", "red"); $("t-pass").value = ""; return }
    currentTeacherUser = match
    chrome.storage.local.set({ teacher_login: true, teacher_user: match })
    enterDashboard(match)
  } catch (e) { showMsg("t-login-msg", "✗ Firebase error: " + e.message, "red") }
}

async function onAdminRegister() {
  var code  = $("admin-code").value.trim()
  var name  = $("admin-name").value.trim()
  var user  = $("admin-user").value.trim()
  var pass  = $("admin-pass").value.trim()
  var pass2 = $("admin-pass2").value.trim()

  if (code !== ADMIN_CODE)              { showMsg("admin-msg", "✗ Invalid admin code", "red"); return }
  if (!name || !user || !pass || !pass2){ showMsg("admin-msg", "✗ Fill in all fields", "red"); return }
  if (pass.length < 6)                  { showMsg("admin-msg", "✗ Password min 6 chars", "red"); return }
  if (pass !== pass2)                   { showMsg("admin-msg", "✗ Passwords do not match", "red"); $("admin-pass2").value = ""; return }

  showMsg("admin-msg", "Saving...", "blue")
  try {
    var teachers = await fbReadAll("teachers")
    if (teachers.find(t => t.username === user)) { showMsg("admin-msg", "✗ Username already taken", "red"); return }
    var ok = await fbSet("teachers", user, { name, username: user, password: pass, role: "teacher", created_at: new Date().toISOString() })
    if (ok) {
      showMsg("admin-msg", "✓ Teacher account created!", "green")
      ;["admin-code","admin-name","admin-user","admin-pass","admin-pass2"].forEach(f => $(f).value = "")
      setTimeout(() => {
        $("admin-setup-wrap").classList.add("hidden")
        $("t-user").value = user
        $("t-pass").focus()
      }, 1500)
    } else { showMsg("admin-msg", "✗ Firebase write failed", "red") }
  } catch (e) { showMsg("admin-msg", "✗ Firebase error: " + e.message, "red") }
}

function onTeacherLogout() {
  chrome.storage.local.set({ teacher_login: false, teacher_user: null })
  currentTeacherUser = null
  currentStudentId   = null
  $("teacher-auth-wrap").classList.remove("hidden")
  $("teacher-dashboard").classList.add("hidden")
  $("btn-teacher-logout").style.display = "none"
  $("teacher-name-tag").textContent = ""
  ;["t-user","t-pass"].forEach(f => $(f).value = "")
}
