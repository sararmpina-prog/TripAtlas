import jwt from "jsonwebtoken"; // biblioteca para lidar com JWTs

function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    // Se não enviar o header, responde no padrão JSON do vosso projeto (401)
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: {
                message: "Authentication token not provided.",
                code: "UNAUTHORIZED"
            }
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Guarda os dados do token (ex: id) no req.user para os controladores usarem
        req.user = decoded;
        if (decoded.exp < Date.now() / 1000) {
          console.log("Token expirado");
        }
        next();
    } catch (error) {
        console.log("JWT ERROR:", error.message);
        // Se o token for inválido ou expirar, responde no vosso padrão JSON (403)
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