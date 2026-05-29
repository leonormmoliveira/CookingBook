const admin = require("../config/firebase")
const pool = require("../config/database")

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                code: "NO_AUTH_HEADER",
                message: "Não autorizado"
            });
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                code: "INVALID_AUTH_FORMAT",
                message: "Formato de token inválido"
            });
        }

        const token = parts[1];
        let decoded;
        try {
            decoded = await admin.auth().verifyIdToken(token);
        } catch (err) {
            return res.status(401).json({
                success: false,
                code: "INVALID_FIREBASE_TOKEN",
                message: "Token inválido ou expirado"
            });
        }

        const [rows] = await pool.query(
            'SELECT * FROM users WHERE authUid = ?',
            [decoded.uid]
        );

        const user = rows[0];
        if (!user) {
            return res.status(401).json({
                success: false,
                code: "USER_NOT_FOUND",
                message: "Usuário não encontrado"
            });
        }

        req.user = user;
        req.firebaseUser = decoded;
        return next();
    } catch (error) {
        console.error("verifyToken unexpected error:", error);
        return res.status(500).json({
            success: false,
            code: "AUTH_MIDDLEWARE_ERROR",
            message: "Erro interno de autenticação"
        });
    }
}

module.exports = verifyToken