import jwt from "jsonwebtoken"; // biblioteca para lidar com JWTs
import { UnauthorizedError, InvalidTokenError } from "./appErrors.js";

function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    // Caso 1: O utilizador não enviou qualquer cabeçalho de autorização
    if (!authHeader) {
        // Envia o erro diretamente para o errorHandler centralizado
        return next(new UnauthorizedError());
    }

    const token = authHeader.split(" ")[1];

  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Guarda os dados descodificados no pedido para o controlador usar (ex: req.user.id)
        req.user = decoded;
        next();
    } catch (error) {
        // Caso 2: O token expirou ou foi adulterado. 
        // 401 UNAUTHORIZED para o React saber que deve forçar um novo login.
        return next(new InvalidTokenError());
    }
}

export default auth;