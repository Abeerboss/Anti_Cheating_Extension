function initExport() {
  $("btn-export-all").addEventListener("click", async function() {
    var logs = await fbReadAll("logs")
    downloadCSV(logs, "ace_all_violations.csv")
  })

  $("btn-export-student").addEventListener("click", async function() {
    if (!currentStudentId) return
    var allLogs = await fbReadAll("logs")
    downloadCSV(allLogs.filter(l => l.student_id === currentStudentId), "ace_" + currentStudentId + ".csv")
  })
}
