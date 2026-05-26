const admin = require("firebase-admin")
const pool = require("../config/database")

if (!admin.apps.length) {
    const serviceAccount = require("../config/firebase-service-account.json")
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
}

const verifyToken = async (req, res, next) => {
    try {
        let token = null

        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1]
        }

        if (!token) {
            return res.status(401).json({ message: "Não autorizado" })
        }

        const decoded = await admin.auth().verifyIdToken(token)
        const [rows] = await pool.query('SELECT * FROM users WHERE authUid = ?', [decoded.uid])
        const user = rows[0]

        if (!user) {
            return res.status(401).json({ message: "Usuário não encontrado" })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ message: "Token inválido" })
    }
}

module.exports = verifyToken