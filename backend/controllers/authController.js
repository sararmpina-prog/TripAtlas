/* O controller recebe pedidos HTTP, extrai os dados necessários da request, chama os services apropriados e devolve respostas JSON padronizadas. */

import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as authService from '../services/authService.js';
import { db } from '../infra/db/db.js';

// AUTENTICAÇÃO DE UTILIZADOR
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // O service trata do SQL, bcrypt e geração do Token JWT
  const authData = await authService.authenticateUser(email, password);

  // Devolve a resposta em JSON limpo
  res.json({
    success: true,
    data: authData // Contém o token e dados básicos do user
  });
});


// REGISTO DE NOVO UTILIZADOR
export  const register = asyncHandler(async (req, res) => {
  // O req.body já vem limpo e em snake_case por causa do createUserSchema do Zod
  const authData = await authService.registerUser(req.body || {});

  // Resposta estruturada idêntica ao Login
  res.status(201).json({
    success: true,
    data: authData
  });
});


// async function login(req, res) {

//   try {

//     const { email, password } = req.body;

//     //verifica se email existe
//     const [users] = await pool.execute(
//       "SELECT * FROM users WHERE email = ?",
//       [email]
//     );

//     if (users.length === 0) {
//       return res.status(401).json({
//         message: "Credenciais inválidas"
//       });
//     }

//     const user = users[0];

//     //verifica se pass é correta
//     const isValid =
//       await bcrypt.compare(
//         password,
//         user.password
//       );

//     if (!isValid) {
//       return res.status(401).json({
//         message: "Credenciais inválidas"
//       });
//     }

//     //O método jwt.sign() cria (assina) um JSON Web Token (JWT) que será enviado ao cliente após o login bem-sucedido.
//     const token = jwt.sign(
//       { id: user.id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     return res.json({ token });

//   } catch (error) {

//     return res.status(500).json({
//       message: "Erro interno"
//     });

//   }
// }

// export { login };
