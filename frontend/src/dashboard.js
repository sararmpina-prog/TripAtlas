async function loadDashboard() {

  try {

    const token =
      localStorage.getItem("token");

    if (!token) {
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(
      "http://localhost:3000/dashboard",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    if (response.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    const data = await response.json();

    console.log(data);

  } catch (error) {

    console.error(error);

    alert(
      "Não foi possível comunicar com o servidor"
    );

  }

}

loadDashboard();