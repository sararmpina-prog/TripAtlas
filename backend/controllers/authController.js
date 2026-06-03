async function login(req, res) {

  try {

    const { email, password } = req.body;

    //verifica se email existe
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Credenciais inválidas"
      });
    }

    const user = users[0];

    //verifica se pass é correta
    const isValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isValid) {
      return res.status(401).json({
        message: "Credenciais inválidas"
      });
    }

    //O método jwt.sign() cria (assina) um JSON Web Token (JWT) que será enviado ao cliente após o login bem-sucedido.
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });

  } catch (error) {

    return res.status(500).json({
      message: "Erro interno"
    });

  }
}

module.exports = {
  login
};