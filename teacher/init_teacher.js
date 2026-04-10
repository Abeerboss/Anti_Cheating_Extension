function initTeacher() {
  initTeacherAuth()
  initExport()

  $("btn-refresh").addEventListener("click", () => currentStudentId ? loadStudent(currentStudentId) : loadOverview())

  chrome.storage.local.get(["teacher_login","teacher_user"], function(d) {
    if (d.teacher_login) { currentTeacherUser = d.teacher_user || {}; enterDashboard(currentTeacherUser) }
  })

  setInterval(function() {
    if (!$("teacher-dashboard").classList.contains("hidden"))
      currentStudentId ? loadStudent(currentStudentId) : loadOverview()
  }, 10000)
}

initTeacher()
