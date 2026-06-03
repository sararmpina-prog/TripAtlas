const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    message.textContent = "A autenticar...";

    const response = await fetch(
      "http://localhost:3000/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: document.getElementById("email").value,
          password: document.getElementById("password").value
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Erro ao efetuar login"
      );
    }

    localStorage.setItem(
      "token",
      data.token
    );

    message.textContent =
      "Login efetuado com sucesso";

    window.location.href = "dashboard.html";

  } catch (error) {

    console.error(error);

    message.textContent =
      error.message;

  }

});