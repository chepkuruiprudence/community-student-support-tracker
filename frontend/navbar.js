// navbar.js
const navbarContainer = document.getElementById("navbar-container");

if (navbarContainer) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    // Determine the dashboard link based on the role
    let dashboardLink = "";
    
    // Priority check: If student, show student. If donor, show donor.
    if (user.is_student) {
      dashboardLink = `<a href="student.html" class="text-gray-700 hover:text-blue-600 transition duration-200 font-medium">Student Dashboard</a>`;
    } else if (user.is_donor) {
      dashboardLink = `<a href="donor.html" class="text-gray-700 hover:text-blue-600 transition duration-200 font-medium">Donor Dashboard</a>`;
    }

    navbarContainer.innerHTML = `
      <nav class="bg-white shadow-md p-4 flex justify-between items-center fixed top-0 w-full z-50">
        <div class="flex items-center space-x-4">
          <div class="text-xl font-bold text-blue-600">EduSupport</div>
          <span class="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">Hi, ${user.username}</span>
        </div>
        
        <div class="space-x-6 flex items-center">
          <a href="index.html" class="text-gray-700 hover:text-blue-600 transition duration-200 font-medium">Home</a>
          ${dashboardLink}
          <button id="logoutBtn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
            Logout
          </button>
        </div>
      </nav>
      <div class="h-20"></div>
    `;

    document.getElementById("logoutBtn").onclick = () => {
      localStorage.clear();
      window.location.href = "login.html";
    };
  }
}