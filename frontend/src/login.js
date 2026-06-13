const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

async function handleSubmit(e) {
  e.preventDefault();

  setError("");

  try {
    
    const [error, setError] = useState("");

    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login failed");
    }

    // Guardar token
    localStorage.setItem(
      "token",
      result.data.token
    );

    // Guardar utilizador
    localStorage.setItem(
      "user",
      JSON.stringify(result.data.user)
    );

    console.log("Login successful", result.data);

    // Navegar para onboarding ou dashboard
    navigate("/dashboard");

  } catch (err) {
    setError(err.message);
  }
}