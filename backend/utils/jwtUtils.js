import jwt from "jsonwebtoken"; // biblioteca para lidar com JWTs

/*O ficheiro jsonWebToken é apenas a execução isolada de jwt.sign(...);
Deve ser transformado num utilitário de geração de tokens (ex: generateToken(userId)) para que o controller de login/registo o possa invocar de forma simples.
*/

// Gera um Token JWT para o utilizador autenticado
// @param {number} userId - ID do utilizador vindo da base de dados
// @returns {string} Token JWT assinado

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};