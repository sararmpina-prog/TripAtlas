import jwt from "jsonwebtoken"; // biblioteca para lidar com JWTs
import { UnauthorizedError, InvalidTokenError } from "../utils/appErrors.js";

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
        if (decoded.exp < Date.now() / 1000) {
          console.log("Token expirado");
        }
        next();
    } catch (error) {
        console.log("JWT ERROR:", error.message);
        // Se o token for inválido ou expirar, responde no padrão JSON (403)
        return res.status(403).json({
            success: false,
            error: {
                message: "Invalid or expired Token.",
                code: "FORBIDDEN"
            }
        });
    }
}

export default auth;