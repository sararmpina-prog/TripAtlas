function Header() {
  const user = JSON.parse(
    localStorage.getItem("user") ||
    sessionStorage.getItem("user")
  );

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    window.location.href = "/login";
  }

  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 20px",
      borderBottom: "1px solid #ddd"
    }}>
      <h2>TRIPATLAS</h2>

      <div>
        <span style={{ marginRight: "10px" }}>
          Olá, {user?.first_name}
        </span>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;