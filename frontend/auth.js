function login() {
  fetch(`${API_BASE}/api/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("token", data.token);

    if (data.is_student) {
      window.location.href = "student.html";
    } else if (data.is_donor) {
      window.location.href = "donor.html";
    }
  });
}
