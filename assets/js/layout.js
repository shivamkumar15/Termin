function logout() {
  localStorage.removeItem("termin_logged_in");
  window.location.href = "../auth/login.html";
}

// simple auth guard
if (!localStorage.getItem("termin_logged_in")) {
  window.location.href = "../auth/login.html";
}
