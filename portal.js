
document.getElementById("btn-teacher").addEventListener("click", function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("teacher.html") })
})
document.getElementById("btn-student").addEventListener("click", function() {
  window.location.href = "student.html"
})
