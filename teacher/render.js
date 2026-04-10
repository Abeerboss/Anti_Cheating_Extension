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

function addStudentForm() {
  return '<div class="panel" id="add-panel" style="display:none;margin-bottom:16px">' +
    '<div class="panel-header"><span class="panel-title">Register New Student</span></div>' +
    '<div class="add-form">' +
      '<div class="field"><label>Student ID</label><input id="new-sid" type="text" placeholder="ST-2041"></div>' +
      '<div class="field"><label>Full Name</label><input id="new-sname" type="text" placeholder="Ahmed Raza"></div>' +
      '<div class="field"><label>Password</label><input id="new-spass" type="password" placeholder="Min 6 chars"></div>' +
      '<button id="btn-do-add" class="btn btn-accent" style="height:34px;margin-bottom:9px">Add</button>' +
    '</div>' +
    '<div id="add-msg" class="msg-box" style="margin:0 14px 12px"></div></div>'
}

function renderStudentTable(students, allLogs, session) {
  if (!students.length) return '<div class="empty-state">No students registered.</div>'
  return '<table class="log-table"><thead>' +
    '<tr><th>ID</th><th>Name</th><th>Violations</th><th>Last Seen</th><th>Count</th><th>Status</th><th></th></tr>' +
    '</thead><tbody>' +
    students.map(function(s) {
      var sLogs    = allLogs.filter(l => l.student_id === s.student_id)
      var count    = sLogs.length
      var isActive = session && session.exam_active && session.student_id === s.student_id
      var lastLog  = sLogs.length ? sLogs.slice().sort((a,b) => (b.timestamp||"").localeCompare(a.timestamp||""))[0] : null
      var lastSeen = lastLog ? lastLog.timestamp.slice(0,19).replace("T"," ") : "—"
      var topViol  = ""
      if (sLogs.length) {
        var freq = sLogs.reduce((acc,l) => { acc[l.violation_type]=(acc[l.violation_type]||0)+1; return acc }, {})
        topViol  = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0].replace(/_/g," ")
      }
      return '<tr class="student-row" data-id="' + s.student_id + '" style="cursor:pointer">' +
        '<td style="color:#47c8ff;font-weight:700">'                                                        + s.student_id + '</td>' +
        '<td style="color:#e6edf3;font-weight:600">'                                                        + s.name       + '</td>' +
        '<td style="color:' + (topViol ? (COLOURS[topViol.replace(/ /g,"_")]||"#ffaa00") : "#6e7681") + ';font-size:9px">' + (topViol||"—") + '</td>' +
        '<td style="color:#6e7681;font-size:9px;white-space:nowrap">'                                       + lastSeen     + '</td>' +
        '<td><span style="color:' + (count>0?"#ff4757":"#00e676") + ';font-weight:700;font-size:13px">'    + count        + '</span></td>' +
        '<td><span class="tag ' + (isActive?"tag-active":"tag-ended") + '">' + (isActive?"● Active":"Idle") + '</span></td>' +
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

function renderStudentProfile(student, sLogs, isActive) {
  var byType      = sLogs.reduce((acc,l) => { acc[l.violation_type]=(acc[l.violation_type]||0)+1; return acc }, {})
  var aiVisits    = byType["AI_SITE_VISIT"] || 0
  var screenshots = byType["SCREENSHOT"]    || 0
  return '<div class="stats-row">' +
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
    '</div>' +
    '<div class="panel" style="margin-bottom:16px">' +
      '<div class="panel-header"><span class="panel-title">Student Profile</span>' +
        '<span class="tag ' + (isActive?"tag-active":"tag-ended") + '">' + (isActive?"● Active":"Idle") + '</span>' +
      '</div>' +
      '<div class="panel-body" style="padding:14px 16px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11px">' +
          kv("ID",    '<span style="color:#47c8ff">' + student.student_id + '</span>') +
          kv("Name",  student.name) +
          kv("Email", student.email || "—") +
          kv("Registered", (student.created_at||"").slice(0,10)||"—") +
        '</div>' +
      '</div>' +
    '</div>' +
    panel("Violation Log — " + student.name, sLogs.length + " entries", renderLogTable(sLogs, true))
}
