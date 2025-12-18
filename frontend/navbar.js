// Insert navbar into a container div
const navbarContainer = document.getElementById("navbar-container");
if (navbarContainer) {
  navbarContainer.innerHTML = `
    <nav class="bg-white shadow p-4 flex justify-between items-center">
      <div class="space-x-4">
        <a href="index.html" class="text-blue-600">Home</a>
        <a href="student.html" class="text-blue-600">Student Dashboard</a>
        <a href="donor.html" class="text-blue-600">Donor Dashboard</a>
      </div>
      <button id="logoutBtn" class="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
    </nav>
  `;

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.onclick = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "index.html";
  };
}
