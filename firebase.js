var FB_KEY  = "AIzaSyDndLPk14Y0uu2tEQ82CXbbb_duJshBZBI"
var FS_BASE = "https://firestore.googleapis.com/v1/projects/anti-cheating-extension-4f1ad/databases/(default)/documents"
var RQ_BASE = "https://firestore.googleapis.com/v1/projects/anti-cheating-extension-4f1ad/databases/(default):runQuery"

function toFS(obj) {
  var f = {}
  Object.entries(obj).forEach(function([k, v]) {
    if (v === null || v === undefined) f[k] = { nullValue: null }
    else if (typeof v === "boolean")   f[k] = { booleanValue: v }
    else if (typeof v === "number")    f[k] = { doubleValue: v }
    else if (typeof v === "string")    f[k] = { stringValue: v }
    else if (Array.isArray(v))         f[k] = { arrayValue: { values: v.map(x => ({ stringValue: String(x) })) } }
    else if (typeof v === "object")    f[k] = { mapValue: { fields: toFS(v) } }
    else                               f[k] = { stringValue: String(v) }
  })
  return f
}

function fromFS(fields) {
  if (!fields) return {}
  var obj = {}
  Object.entries(fields).forEach(function([k, v]) {
    if      ("stringValue"  in v) obj[k] = v.stringValue
    else if ("integerValue" in v) obj[k] = parseInt(v.integerValue)
    else if ("doubleValue"  in v) obj[k] = v.doubleValue
    else if ("booleanValue" in v) obj[k] = v.booleanValue
    else if ("nullValue"    in v) obj[k] = null
    else if ("arrayValue"   in v) obj[k] = (v.arrayValue.values || []).map(x => Object.values(x)[0])
    else if ("mapValue"     in v) obj[k] = fromFS(v.mapValue.fields)
    else obj[k] = null
  })
  return obj
}

function docToObj(doc) {
  return Object.assign({ _id: doc.name.split("/").pop() }, fromFS(doc.fields))
}

async function fbReq(url, opts) {
  var res  = await fetch(url, Object.assign({ headers: { "x-goog-api-key": FB_KEY, "Content-Type": "application/json" } }, opts))
  var text = await res.text()
  if (!res.ok) { console.warn("[FB]", res.status, text); return null }
  try { return JSON.parse(text) } catch { return {} }
}

async function fbSet(col, id, data) {
  var mask = Object.keys(data).map(k => "updateMask.fieldPaths=" + encodeURIComponent(k)).join("&")
  return fbReq(FS_BASE + "/" + col + "/" + encodeURIComponent(id) + "?" + mask, { method: "PATCH", body: JSON.stringify({ fields: toFS(data) }) })
}

async function fbWrite(col, data) {
  return fbReq(FS_BASE + "/" + col, { method: "POST", body: JSON.stringify({ fields: toFS(data) }) })
}

async function fbReadAll(col) {
  var json = await fbReq(FS_BASE + "/" + col)
  return json && json.documents ? json.documents.map(docToObj) : []
}

async function fbDelete(col, id) {
  var res = await fetch(FS_BASE + "/" + col + "/" + encodeURIComponent(id), { method: "DELETE", headers: { "x-goog-api-key": FB_KEY } })
  return res.ok
}

async function fbQuery(col, field, value) {
  var json = await fbReq(RQ_BASE, {
    method: "POST",
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: col }],
      where: { fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: { stringValue: String(value) } } },
      orderBy: [{ field: { fieldPath: "timestamp" }, direction: "DESCENDING" }]
    }})
  })
  return Array.isArray(json) ? json.filter(r => r.document).map(r => docToObj(r.document)) : []
}

async function fbTestConnection() {
  var fixes = { 403: "Firestore Rules → allow read, write: if true;", 404: "Create Firestore database", 400: "Wrong Project ID", 401: "Wrong API Key" }
  try {
    var res  = await fetch(FS_BASE + "/students?pageSize=1", { headers: { "x-goog-api-key": FB_KEY } })
    var body = {}
    try { body = JSON.parse(await res.text()) } catch {}
    if (res.ok) return { ok: true, message: "Connected ✓" }
    var msg = (body.error && body.error.message) || "HTTP " + res.status
    return { ok: false, message: msg + (fixes[res.status] ? "\nFix: " + fixes[res.status] : "") }
  } catch (e) {
    return { ok: false, message: "Network error: " + e.message }
  }
}

