const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user.admin) {
  window.location.href = "/pages/login.html";
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/pages/login.html";
});
