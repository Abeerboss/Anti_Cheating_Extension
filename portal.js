document.getElementById("btn-teacher").addEventListener("click", () => chrome.tabs.create({ url: chrome.runtime.getURL("teacher.html") }))
document.getElementById("btn-student").addEventListener("click", () => { location.href = "student.html" })
