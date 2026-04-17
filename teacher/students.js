async function addStudent() {
  var id   = $("new-sid").value.trim()
  var name = $("new-sname").value.trim()
  var pass = $("new-spass").value.trim()
  if (!id || !name || !pass) { showMsg("add-msg", "✗ Fill in all fields", "red"); return }
  if (pass.length < 6)       { showMsg("add-msg", "✗ Password min 6 chars", "red"); return }
  showMsg("add-msg", "Saving...", "blue")
  try {
    var existing = await fbReadAll("students")
    if (existing.find(s => s.student_id === id)) { showMsg("add-msg", "✗ Student ID exists", "red"); return }
    var ok = await fbSet("students", id, { student_id: id, name, password: pass, role: "student", created_at: new Date().toISOString() })
    if (ok) {
      ;["new-sid","new-sname","new-spass"].forEach(f => $(f).value = "")
      showMsg("add-msg", "✓ " + name + " added", "green")
      setTimeout(loadOverview, 800)
    } else { showMsg("add-msg", "✗ Firebase write failed", "red") }
  } catch (e) { showMsg("add-msg", "✗ Error: " + e.message, "red") }
}

async function deleteStudent(studentId) {
  if (!confirm("Delete student " + studentId + " and all their logs? This cannot be undone.")) return
  var ok = await fbDelete("students", studentId)
  if (ok) { if (currentStudentId === studentId) currentStudentId = null; loadOverview() }
  else console.warn("[ACE] Failed to delete student:", studentId)
}

async function deleteExam(examCode) {
  if (!confirm("Delete exam \"" + examCode + "\" and all its violation logs? This cannot be undone.")) return
  try {

    var logs = await fbQuery("logs", "exam_title", examCode)
    if (logs.length) {
      var results = await Promise.all(logs.map(function(l) { return fbDelete("logs", l._id) }))
      var failed  = results.filter(function(r) { return !r }).length
      if (failed) console.warn("[ACE] deleteExam: " + failed + " log(s) failed to delete")
    }

    await fbDelete("exams", examCode)
    loadOverview()
  } catch(e) { console.warn("[ACE] deleteExam:", e.message); loadOverview() }
}
