function statBox(color, val, label) {
  return '<div class="stat-box ' + color + '"><div class="stat-val">' + val + '</div><div class="stat-lbl">' + label + '</div></div>'
}

function panel(title, sub, body) {
  return '<div class="panel" style="margin-bottom:16px">' +
    '<div class="panel-header"><span class="panel-title">' + title + '</span>' +
    '<span style="font-size:9px;color:#6e7681">' + sub + '</span></div>' +
    '<div class="panel-body">' + body + '</div></div>'
}

function kv(label, val) {
  return '<div><span style="color:#6e7681">' + label + ': </span><span style="color:#e6edf3">' + val + '</span></div>'
}

function liveBar() {
  return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:10px 14px;background:#161b22;border:1px solid #21262d;border-left:3px solid #d2ff47">' +
    '<span style="font-size:18px">🔥</span>' +
    '<div><div style="font-size:10px;color:#e6edf3;font-weight:600">Firebase Firestore Connected</div>' +
    '<div style="font-size:9px;color:#6e7681">anti-cheating-extension-4f1ad · Real-time</div></div>' +
    '<span style="margin-left:auto;font-size:9px;color:#00e676;border:1px solid rgba(0,230,118,0.3);padding:2px 8px">● LIVE</span></div>'
}

function addExamForm() {
  return '<div class="panel" id="exam-panel" style="display:none;margin-bottom:16px">' +
    '<div class="panel-header"><span class="panel-title">Create New Exam</span></div>' +
    '<div class="add-form">' +
      '<div class="field"><label>Exam Code</label><input id="exam-code-input" type="text" placeholder="e.g. CS101-2025"></div>' +
      '<div class="field"><label>Exam Name</label><input id="exam-name-input" type="text" placeholder="e.g. CS101 Final Exam"></div>' +
      '<button id="btn-do-exam" class="btn btn-accent" style="height:34px;margin-bottom:9px">Create</button>' +
    '</div>' +
    '<div id="exam-msg" class="msg-box" style="margin:0 14px 12px"></div></div>'
}

function addStudentForm() {
  return '<div class="panel" id="student-panel" style="display:none;margin-bottom:16px">' +
    '<div class="panel-header"><span class="panel-title">Register New Student</span></div>' +
    '<div class="add-form">' +
      '<div class="field"><label>Student ID</label><input id="new-sid" type="text" placeholder="ST-2041"></div>' +
      '<div class="field"><label>Full Name</label><input id="new-sname" type="text" placeholder="Ahmed Raza"></div>' +
      '<div class="field"><label>Password</label><input id="new-spass" type="password" placeholder="Min 6 chars"></div>' +
      '<button id="btn-do-add" class="btn btn-accent" style="height:34px;margin-bottom:9px">Add</button>' +
    '</div>' +
    '<div id="add-msg" class="msg-box" style="margin:0 14px 12px"></div></div>'
}

function renderStudentTable(students, allLogs) {
  if (!students.length) return '<div class="empty-state">No students registered.</div>'
  return '<table class="log-table"><thead>' +
    '<tr><th>ID</th><th>Name</th><th>Last Violation</th><th>Last Seen</th><th>Count</th><th>Status</th><th></th></tr>' +
    '</thead><tbody>' +
    students.map(function(s) {
      var sLogs    = allLogs.filter(l => l.student_id === s.student_id)
      var count    = sLogs.length
      var lastLog  = sLogs.slice().sort((a,b) => (b.timestamp||"").localeCompare(a.timestamp||""))[0]
      var lastSeen = lastLog ? lastLog.timestamp.slice(0,19).replace("T"," ") : "—"
      var lastType = lastLog ? violationLabel(lastLog.violation_type) : "—"
      var color    = lastLog ? (COLOURS[lastLog.violation_type] || "#6e7681") : "#6e7681"
      return '<tr class="student-row" data-id="' + s.student_id + '" style="cursor:pointer">' +
        '<td style="color:#47c8ff;font-weight:700">' + s.student_id + '</td>' +
        '<td style="color:#e6edf3;font-weight:600">' + s.name + '</td>' +
        '<td style="color:' + color + ';font-size:9px">' + lastType + '</td>' +
        '<td style="color:#6e7681;font-size:9px;white-space:nowrap">' + lastSeen + '</td>' +
        '<td><span style="color:' + (count > 0 ? "#ff4757" : "#00e676") + ';font-weight:800;font-size:13px">' + count + '</span></td>' +
        '<td><span class="tag ' + (count > 0 ? "tag-ended" : "tag-active") + '">' + (count > 0 ? "Flagged" : "Clean") + '</span></td>' +
        '<td><button class="btn btn-danger del-btn" data-id="' + s.student_id + '" style="padding:3px 8px;font-size:9px">✕</button></td>' +
        '</tr>'
    }).join("") + '</tbody></table>'
}

function renderLogTable(logs, hideStudent) {
  if (!logs.length) return '<div class="empty-state">No violations recorded.</div>'
  var head = hideStudent
    ? "<tr><th>Time</th><th>Event</th><th>Severity</th><th>Detail</th></tr>"
    : "<tr><th>Time</th><th>Student</th><th>Event</th><th>Severity</th><th>Detail</th></tr>"
  return '<table class="log-table"><thead>' + head + '</thead><tbody>' +
    logs.map(function(l) {
      var sc    = sevClass(l.violation_type)
      var color = COLOURS[l.violation_type] || "#6e7681"
      return '<tr>' +
        '<td style="color:#47c8ff;font-size:9px;white-space:nowrap">' + (l.timestamp||"").slice(0,19).replace("T"," ") + '</td>' +
        (!hideStudent ? '<td style="color:#e6edf3">' + (l.student_name||l.student_id||"—") + '</td>' : "") +
        '<td style="font-weight:600;color:' + color + '">' + violationLabel(l.violation_type) + '</td>' +
        '<td><span class="sev-pill ' + sc + '">' + sc.toUpperCase() + '</span></td>' +
        '<td style="color:#6e7681;font-size:9px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (l.detail||"—") + '</td>' +
        '</tr>'
    }).join("") + '</tbody></table>'
}

function renderStudentProfile(student, sLogs) {
  var byType      = sLogs.reduce((acc,l) => { acc[l.violation_type]=(acc[l.violation_type]||0)+1; return acc }, {})
  var aiVisits    = byType["AI_SITE_VISIT"] || 0
  var screenshots = byType["SCREENSHOT"]    || 0

  var statsRows =
    '<div class="stats-row">' +
      statBox("red",    sLogs.length,                                               "Total")     +
      statBox("yellow", byType["TAB_SWITCH"]||0,                                   "Tab Switch") +
      statBox("red",    byType["FULLSCREEN_EXIT"]||0,                              "FS Exit")   +
      statBox("blue",   (byType["COPY_ATTEMPT"]||0)+(byType["PASTE_ATTEMPT"]||0), "Copy/Paste") +
    '</div>' +
    '<div class="stats-row" style="margin-top:-8px">' +
      statBox("red",    aiVisits,                  "AI Visits")    +
      statBox("yellow", screenshots,               "Screenshots")  +
      statBox("blue",   byType["RIGHT_CLICK"]||0,  "Right Clicks") +
      statBox("green",  byType["LOGIN_LOGOUT"]||0, "Login Events") +
    '</div>'

  var profileRow = renderStudentAsTableRow(student, sLogs)

  return statsRows +
    '<div class="panel" style="margin-bottom:16px">' +
      '<div class="panel-header"><span class="panel-title">Student Profile</span></div>' +
      '<div class="panel-body">' +
        '<table class="log-table"><thead>' +
          '<tr><th>ID</th><th>Name</th><th>Last Violation</th><th>Last Seen</th><th>Count</th><th>Status</th></tr>' +
        '</thead><tbody>' + profileRow + '</tbody></table>' +
      '</div>' +
    '</div>' +
    panel("Violation Log — " + student.name, sLogs.length + " entries", renderLogTable(sLogs, true))
}

function renderStudentAsTableRow(student, sLogs) {
  var count    = sLogs.length
  var lastLog  = sLogs.length ? sLogs[0] : null
  var lastSeen = lastLog ? lastLog.timestamp.slice(0,19).replace("T"," ") : "—"
  var lastType = lastLog ? violationLabel(lastLog.violation_type) : "—"
  var color    = lastLog ? (COLOURS[lastLog.violation_type] || "#6e7681") : "#6e7681"
  return '<tr>' +
    '<td style="color:#47c8ff;font-weight:700">' + student.student_id + '</td>' +
    '<td style="color:#e6edf3;font-weight:600">' + student.name + '</td>' +
    '<td style="color:' + color + ';font-size:9px">' + lastType + '</td>' +
    '<td style="color:#6e7681;font-size:9px;white-space:nowrap">' + lastSeen + '</td>' +
    '<td><span style="color:' + (count > 0 ? "#ff4757" : "#00e676") + ';font-weight:800;font-size:13px">' + count + '</span></td>' +
    '<td><span class="tag ' + (count > 0 ? "tag-ended" : "tag-active") + '">' + (count > 0 ? "Flagged" : "Clean") + '</span></td>' +
    '</tr>'
}

function renderExamCodeViolationTables(students, allLogs) {

  var examMap = {}
  allLogs.forEach(function(l) {
    var code = l.exam_title || "Unknown"
    if (!examMap[code]) examMap[code] = []
    examMap[code].push(l)
  })

  var codes = Object.keys(examMap).sort()
  if (!codes.length) return '<div class="empty-state">No exam violations recorded.</div>'

  return codes.map(function(code) {
    var examLogs = examMap[code]

  
    var studentIds = Array.from(new Set(examLogs.map(l => l.student_id)))

    var rows = studentIds.map(function(sid) {
      var student  = students.find(s => s.student_id === sid) || { student_id: sid, name: examLogs.find(l => l.student_id === sid).student_name || sid }
      var sLogs    = examLogs.filter(l => l.student_id === sid)
      var count    = sLogs.length
      var lastLog  = sLogs.slice().sort((a,b) => (b.timestamp||"").localeCompare(a.timestamp||""))[0]
      var lastSeen = lastLog ? lastLog.timestamp.slice(0,19).replace("T"," ") : "—"
      var lastType = lastLog ? violationLabel(lastLog.violation_type) : "—"
      var color    = lastLog ? (COLOURS[lastLog.violation_type] || "#6e7681") : "#6e7681"
      return '<tr class="student-row" data-id="' + student.student_id + '" style="cursor:pointer">' +
        '<td style="color:#47c8ff;font-weight:700">' + student.student_id + '</td>' +
        '<td style="color:#e6edf3;font-weight:600">' + student.name + '</td>' +
        '<td style="color:' + color + ';font-size:9px">' + lastType + '</td>' +
        '<td style="color:#6e7681;font-size:9px;white-space:nowrap">' + lastSeen + '</td>' +
        '<td><span style="color:' + (count > 0 ? "#ff4757" : "#00e676") + ';font-weight:800;font-size:13px">' + count + '</span></td>' +
        '<td><span class="tag ' + (count > 0 ? "tag-ended" : "tag-active") + '">' + (count > 0 ? "Flagged" : "Clean") + '</span></td>' +
        '</tr>'
    }).join("")

    var table = '<table class="log-table"><thead>' +
      '<tr><th>ID</th><th>Name</th><th>Last Violation</th><th>Last Seen</th><th>Count</th><th>Status</th></tr>' +
      '</thead><tbody>' + rows + '</tbody></table>'

    return '<div class="panel" style="margin-bottom:16px">' +
      '<div class="panel-header" style="display:flex;align-items:center;justify-content:space-between">' +
        '<span class="panel-title">📋 Exam: ' + code + '</span>' +
        '<span style="display:flex;align-items:center;gap:10px">' +
          '<span style="font-size:9px;color:#6e7681">' + studentIds.length + ' student' + (studentIds.length !== 1 ? 's' : '') + ' · ' + examLogs.length + ' violation' + (examLogs.length !== 1 ? 's' : '') + '</span>' +
          '<button class="btn btn-danger del-exam-btn" data-code="' + code + '" style="padding:3px 10px;font-size:9px;line-height:1.4">✕ Delete</button>' +
        '</span>' +
      '</div>' +
      '<div class="panel-body">' + table + '</div>' +
    '</div>'
  }).join("")
}
