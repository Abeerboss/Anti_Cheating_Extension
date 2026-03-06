var FB_API_KEY = "AIzaSyCmMOIYzOpGOyVHPUvylWA4hcakYa7bu10"
var FB_PROJECT = "anti-cheating-extension"
var FS_BASE    = "https://firestore.googleapis.com/v1/projects/anti-cheating-extension/databases/(default)/documents"

async function fbInit() { return { apiKey: FB_API_KEY, projectId: FB_PROJECT } }
function fbIsConfigured() { return true }

async function fbTestConnection() {
  try {
    var res  = await fetch(FS_BASE + "/students?pageSize=1", {
      headers: { "x-goog-api-key": FB_API_KEY }
    })
    var text = await res.text()
    var body = {}
    try { body = JSON.parse(text) } catch(e) {}

    if (res.ok) return { ok: true, status: 200, message: "Connected to anti-cheating-extension ✓" }

    var msg = (body.error && body.error.message) || text || "HTTP " + res.status
    var fix = ""
    if (res.status === 403) fix = "\nFix: Firestore Rules → allow read, write: if true;"
    if (res.status === 404) fix = "\nFix: Create Firestore database in Firebase Console"
    if (res.status === 400) fix = "\nFix: Wrong Project ID"
    if (res.status === 401) fix = "\nFix: Wrong API Key"
    return { ok: false, status: res.status, message: msg + fix }
  } catch (e) {
    return { ok: false, status: 0, message: "Network error: " + e.message }
  }
}

async function fbSet(collection, docId, data) {
  try {
    var params = Object.keys(data)
      .map(function(k) { return "updateMask.fieldPaths=" + encodeURIComponent(k) })
      .join("&")
    var url = FS_BASE + "/" + collection + "/" + encodeURIComponent(docId) + "?" + params
    var res = await fetch(url, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", "x-goog-api-key": FB_API_KEY },
      body:    JSON.stringify({ fields: toFSFields(data) })
    })
    var text = await res.text()
    if (!res.ok) {
      var errMsg = ""
      try { errMsg = JSON.parse(text).error.message } catch(e) { errMsg = text }
      console.warn("[FB] fbSet failed", res.status, errMsg)
      return null
    }
    try { return JSON.parse(text) } catch(e) { return {} }
  } catch (e) {
    console.warn("[FB] fbSet error:", e.message)
    return null
  }
}

async function fbWrite(collection, data) {
  try {
    var res = await fetch(FS_BASE + "/" + collection, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": FB_API_KEY },
      body:    JSON.stringify({ fields: toFSFields(data) })
    })
    var text = await res.text()
    if (!res.ok) {
      var errMsg = ""
      try { errMsg = JSON.parse(text).error.message } catch(e) { errMsg = text }
      console.warn("[FB] fbWrite failed", res.status, errMsg)
      return null
    }
    try { return JSON.parse(text) } catch(e) { return {} }
  } catch (e) {
    console.warn("[FB] fbWrite error:", e.message)
    return null
  }
}

async function fbReadAll(collection) {
  try {
    var res  = await fetch(FS_BASE + "/" + collection, {
      headers: { "x-goog-api-key": FB_API_KEY }
    })
    var text = await res.text()
    if (!res.ok) { console.warn("[FB] fbReadAll failed", res.status, text); return [] }
    var json = {}
    try { json = JSON.parse(text) } catch(e) { return [] }
    if (!json.documents) return []
    return json.documents.map(function(doc) {
      return Object.assign({ _id: doc.name.split("/").pop() }, fromFSFields(doc.fields))
    })
  } catch (e) {
    console.warn("[FB] fbReadAll error:", e.message)
    return []
  }
}

async function fbDelete(collection, docId) {
  try {
    var res = await fetch(
      FS_BASE + "/" + collection + "/" + encodeURIComponent(docId),
      { method: "DELETE", headers: { "x-goog-api-key": FB_API_KEY } }
    )
    return res.ok
  } catch (e) {
    console.warn("[FB] fbDelete error:", e.message)
    return false
  }
}

async function fbQuery(collection, field, value) {
  try {
    var res = await fetch(
      "https://firestore.googleapis.com/v1/projects/anti-cheating-extension/databases/(default):runQuery",
      {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": FB_API_KEY },
        body:    JSON.stringify({
          structuredQuery: {
            from:    [{ collectionId: collection }],
            where:   { fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: { stringValue: String(value) } } },
            orderBy: [{ field: { fieldPath: "timestamp" }, direction: "DESCENDING" }]
          }
        })
      }
    )
    var text = await res.text()
    if (!res.ok) { console.warn("[FB] fbQuery failed", res.status, text); return [] }
    var results = []
    try { results = JSON.parse(text) } catch(e) { return [] }
    return results
      .filter(function(r) { return r.document })
      .map(function(r) {
        return Object.assign({ _id: r.document.name.split("/").pop() }, fromFSFields(r.document.fields))
      })
  } catch (e) {
    console.warn("[FB] fbQuery error:", e.message)
    return []
  }
}

function toFSFields(obj) {
  var f = {}
  Object.entries(obj).forEach(function(entry) {
    var k = entry[0], v = entry[1]
    if      (v === null || v === undefined) f[k] = { nullValue: null }
    else if (typeof v === "boolean")        f[k] = { booleanValue: v }
    else if (typeof v === "number")         f[k] = { doubleValue: v }
    else if (typeof v === "string")         f[k] = { stringValue: v }
    else if (Array.isArray(v))              f[k] = { arrayValue: { values: v.map(function(x) { return { stringValue: String(x) } }) } }
    else if (typeof v === "object")         f[k] = { mapValue: { fields: toFSFields(v) } }
    else                                    f[k] = { stringValue: String(v) }
  })
  return f
}

function fromFSFields(fields) {
  if (!fields) return {}
  var obj = {}
  Object.entries(fields).forEach(function(entry) {
    var k = entry[0], v = entry[1]
    if      ("stringValue"  in v) obj[k] = v.stringValue
    else if ("integerValue" in v) obj[k] = parseInt(v.integerValue)
    else if ("doubleValue"  in v) obj[k] = v.doubleValue
    else if ("booleanValue" in v) obj[k] = v.booleanValue
    else if ("nullValue"    in v) obj[k] = null
    else if ("arrayValue"   in v) obj[k] = (v.arrayValue.values || []).map(function(x) { return Object.values(x)[0] })
    else if ("mapValue"     in v) obj[k] = fromFSFields(v.mapValue.fields)
    else obj[k] = null
  })
  return obj
}

console.log("[Anti-Cheating Extension Firebase] Loaded — project: anti-cheating-extension")
