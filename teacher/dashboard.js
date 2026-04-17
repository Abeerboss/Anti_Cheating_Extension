var currentStudentId = null

function enterDashboard(teacher) {
  $("teacher-auth-wrap").classList.add("hidden")
  $("teacher-dashboard").classList.remove("hidden")
  $("btn-teacher-logout").style.display = "block"
  $("teacher-name-tag").textContent = (teacher.name || teacher.username) + " · Logged in"
  loadOverview()
}

async function loadSidebar() {
  try {
    var [students, allLogs] = await Promise.all([fbReadAll("students"), fbReadAll("logs")])
    var el = $("student-sidebar-list")
    if (!students.length) { el.innerHTML = '<div class="empty-state" style="padding:20px;font-size:10px">No students yet.</div>'; return }
    el.innerHTML = students.map(function(s) {
      var count    = allLogs.filter(l => l.student_id === s.student_id).length
      var initials = (s.name||"??").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
      var active   = currentStudentId === s.student_id ? "active" : ""
      var hasAI    = allLogs.some(l => l.student_id === s.student_id && l.violation_type === "AI_SITE_VISIT")
      return '<div class="student-item ' + active + '" data-id="' + s.student_id + '">' +
        '<div class="s-avatar">' + initials + '</div>' +
        '<div class="s-info">' +
          '<div class="s-name">' + s.name + (hasAI ? ' <span style="color:#ff4757;font-size:8px">AI</span>' : "") + '</div>' +
          '<div class="s-id">' + s.student_id + '</div>' +
        '</div>' +
        '<span class="s-badge ' + (count > 0 ? "danger" : "clean") + '">' + count + '</span>' +
      '</div>'
    }).join("")
    el.querySelectorAll(".student-item").forEach(item => item.addEventListener("click", function() { loadStudent(this.dataset.id) }))
  } catch(e) { console.warn("[ACE] Sidebar:", e.message) }
}

async function loadOverview() {
  currentStudentId = null
  $("view-title").textContent = "All Students Overview"
  $("view-sub").textContent   = "Loading..."
  $("btn-export-student").style.display = "none"
  var content = $("main-content"); loading(content)

  try {
    var [students, allLogs] = await Promise.all([fbReadAll("students"), fbReadAll("logs")])
    $("view-sub").textContent = "Click a student to view their logs"

    var flagged    = new Set(allLogs.filter(l => SEV.high.includes(l.violation_type)).map(l => l.student_id))
    var aiVisits   = allLogs.filter(l => l.violation_type === "AI_SITE_VISIT").length
    var screenshots= allLogs.filter(l => l.violation_type === "SCREENSHOT").length

    content.innerHTML =
      liveBar() +
      '<div class="stats-row">' +
        statBox("blue",   students.length, "Students")   +
        statBox("red",    allLogs.length,  "Violations") +
        statBox("yellow", flagged.size,    "Flagged")    +
        statBox("red",    aiVisits,        "AI Visits")  +
      '</div>' +
      '<div class="stats-row" style="margin-top:-8px">' +
        statBox("yellow", screenshots, "Screenshots") +
        statBox("blue",   allLogs.filter(l => l.violation_type === "TAB_SWITCH").length,   "Tab Switches")  +
        statBox("blue",   allLogs.filter(l => l.violation_type === "COPY_ATTEMPT").length, "Copy Attempts") +
        statBox("blue",   allLogs.filter(l => l.violation_type === "FULLSCREEN_EXIT").length, "FS Exits")   +
      '</div>' +
      addExamForm() +
      addStudentForm() +
      panel("Registered Students", students.length + " registered", renderStudentTable(students, allLogs)) +
      panel("All Violations", allLogs.length + " entries", renderLogTable(allLogs)) +
      panel("Violations by Exam Code", Object.keys(allLogs.reduce(function(m,l){m[l.exam_title||"Unknown"]=1;return m},{})).length + " exam(s)", renderExamCodeViolationTables(students, allLogs))

    $("btn-show-exam").onclick = function() {
      var p = $("exam-panel")
      p.style.display = p.style.display === "none" ? "block" : "none"
      $("student-panel").style.display = "none"
    }
    $("btn-show-add").onclick = function() {
      var p = $("student-panel")
      p.style.display = p.style.display === "none" ? "block" : "none"
      $("exam-panel").style.display = "none"
    }

    var addBtn = $("btn-do-add"); if (addBtn) addBtn.addEventListener("click", addStudent)
    var examBtn = $("btn-do-exam"); if (examBtn) examBtn.addEventListener("click", createExam)

    content.querySelectorAll(".student-row").forEach(row => row.addEventListener("click", function(e) {
      if (!e.target.classList.contains("del-btn")) loadStudent(this.dataset.id)
    }))
    content.querySelectorAll(".del-btn").forEach(btn => btn.addEventListener("click", function(e) {
      e.stopPropagation(); deleteStudent(this.dataset.id)
    }))
    content.querySelectorAll(".del-exam-btn").forEach(btn => btn.addEventListener("click", function(e) {
      e.stopPropagation(); deleteExam(this.dataset.code)
    }))
    loadSidebar()
  } catch(e) { $("main-content").innerHTML = '<div class="empty-state">Error: ' + e.message + '</div>'; console.warn("[ACE]", e) }
}

async function loadStudent(studentId) {
  currentStudentId = studentId
  $("btn-export-student").style.display = "block"
  $("view-title").textContent = "Loading..."; $("view-sub").textContent = ""
  var content = $("main-content"); loading(content, "Loading student " + studentId + "...")

  try {
    var [students, allLogs] = await Promise.all([fbReadAll("students"), fbReadAll("logs")])
    var student = students.find(s => s.student_id === studentId)
    if (!student) { content.innerHTML = '<div class="empty-state">Student not found.</div>'; return }

    var sLogs = allLogs.filter(l => l.student_id === studentId).sort((a,b) => (b.timestamp||"").localeCompare(a.timestamp||""))

    $("view-title").textContent = student.name
    $("view-sub").textContent   = studentId + " · " + sLogs.length + " violation" + (sLogs.length !== 1 ? "s" : "")
    content.innerHTML = renderStudentProfile(student, sLogs)
    loadSidebar()
  } catch(e) { $("main-content").innerHTML = '<div class="empty-state">Error: ' + e.message + '</div>'; console.warn("[ACE]", e) }
}

async function createExam() {
  var code = $("exam-code-input").value.trim()
  var name = $("exam-name-input").value.trim()
  if (!code || !name) { showMsg("exam-msg", "✗ Fill in all fields", "red"); return }
  showMsg("exam-msg", "Saving...", "blue")
  try {
    var ok = await fbSet("exams", code, { exam_code: code, exam_name: name, created_at: new Date().toISOString(), created_by: currentTeacherUser ? currentTeacherUser.username : "teacher" })
    if (ok) {
      showMsg("exam-msg", "✓ Exam " + code + " created!", "green")
      ;["exam-code-input","exam-name-input"].forEach(f => $(f).value = "")
    } else { showMsg("exam-msg", "✗ Firebase write failed", "red") }
  } catch(e) { showMsg("exam-msg", "✗ Error: " + e.message, "red") }
}
