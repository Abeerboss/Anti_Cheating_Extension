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
  if (!confirm("Delete student " + studentId + "?")) return
  var ok = await fbDelete("students", studentId)
  if (ok) { if (currentStudentId === studentId) currentStudentId = null; loadOverview() }
  else alert("Failed to delete.")
}
