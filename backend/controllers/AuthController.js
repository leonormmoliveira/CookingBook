const fs = require('fs');
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const generateInviteToken = require("../utils/generateInviteToken");
const verifyInviteToken = require("../utils/verifyInviteToken");
const pool = require("../config/database");
const admin = require("../config/firebase");

const AuthController = {
    login: async (req, res) => {
        const { idToken } = req.body;

        try {
            // Verificar o token no Firebase
            const decoded = await admin.auth().verifyIdToken(idToken);
            if (!decoded.email_verified) {
                return res.status(403).json({
                    success: false,
                    code: "EMAIL_NOT_VERIFIED",
                    message: "Email não verificado"
                });
            }

            let [rows] = await pool.query( 'SELECT * FROM users WHERE authUid = ?', [decoded.uid] );
            let user = rows[0];

            // Se o usuário existe no Firebase mas não no MySQL, cria um registro básico automaticamente
            if (!user) {
                const email = decoded.email || null;
                const username = email ? email.split('@')[0] : `user_${decoded.uid}`;

                const [insertResult] = await pool.query(
                    'INSERT INTO users (authUid, username, name, email, status, emailVerified) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        decoded.uid,
                        username,
                        username,
                        email,
                        'active',
                        1
                    ]
                );

                const [newRows] = await pool.query(
                    'SELECT * FROM users WHERE id = ?',
                    [insertResult.insertId]
                );

                user = newRows[0];
            }
            return res.json({success: true, user, message: 'Login efetuado com sucesso' });
        } catch (err) {
            return res.status(401).json({success: false, message: 'Token inválido ou expirado'});
        }
    },

    register: async (req, res) => {
        const { username, email, password } = req.body;
        let firebaseUser = null;

        try {
            // Verifica se já existe usuário com o email
            const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({success: false, message: "Já existe um usuário com esse email." });
            }

            // Cria usuário no Firebase
            firebaseUser = await admin.auth().createUser({
                email,
                password,
                displayName: username
            });

            // Insere usuário no MySQL
            const [result] = await pool.query(
                'INSERT INTO users (authUid, username, name, email, status, emailVerified) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    firebaseUser.uid,
                    username,
                    username,
                    email,
                    'pending',
                    0
                ]
            );

            let emailWarning = null;
            try {
                const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
                const verificationToken = generateInviteToken({ uid: firebaseUser.uid, email });
                const serverFallbackLink = `${backendUrl}/api/auth/verify-email-server?token=${verificationToken}`;

                await sendVerificationEmail(email, serverFallbackLink);
            } catch (emailErr) {
                console.error('Verification email failed:', emailErr);
                emailWarning = emailErr.message;
            }

            // Busca o usuário recém-criado
            const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            const newUser = userRows[0];

            const response = {
                success: true,
                message: emailWarning
                    ? "Usuário criado com sucesso, mas não foi possível enviar o email de verificação."
                    : "Usuário criado com sucesso. Verifique seu e-mail.",
                user: newUser
            };

            if (emailWarning) {
                response.emailWarning = emailWarning;
            }

            return res.status(201).json(response);
        } catch (err) {
            if (firebaseUser?.uid) {
                await admin.auth().deleteUser(firebaseUser.uid);
            }
            return res.status(500).json({success: false, message: "Erro ao criar o usuário", error: err.message });
        }
    },

    logout: async (req, res) => {
        res.clearCookie("auth", { httpOnly: true, secure: false, sameSite: "Lax" });
        return res.status(200).send({success: true, message: "Logout efetuado com sucesso" });
    },

    verifyEmailServer: async (req, res) => {
        const { token } = req.query;
        if (!token) return res.status(400).send('Token ausente');

        try {
            const payload = verifyInviteToken(token);
            const { uid } = payload;

            // Marca emailVerified no Firebase
            const updatedUser = await admin.auth().updateUser(uid, { emailVerified: true });

            // Atualiza MySQL
            const [result] = await pool.query('UPDATE users SET emailVerified = ?, status = ? WHERE authUid = ?', [1, 'active', uid]);

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/login?verified=1`);
        } catch (err) {
            console.error('verifyEmailServer error:', err);
            return res.status(400).send('Token inválido ou expirado');
        }
    }
};

module.exports = AuthController;