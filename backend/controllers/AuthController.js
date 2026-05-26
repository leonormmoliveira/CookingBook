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
            // Buscar usuário no MySQL
            const [rows] = await pool.query('SELECT * FROM users WHERE authUid = ?', [decoded.uid]);
            const user = rows[0];

            if (!user) {
                return res.status(404).json({success: false, message: 'Usuário não encontrado' });
            }

            if (!decoded.email_verified) {
                return res.status(403).json({success: false, message: 'Email não verificado. Verifique sua caixa de entrada.' });
            }

            if (user.emailVerified) {
                await pool.query('UPDATE users SET emailVerified = ?, status = ? WHERE id = ?', [1, 'active', user.id]);
            }

            res.cookie("auth", idToken, { httpOnly: true, secure: false, sameSite: "Lax" });
            // Você pode criar uma função buildProfileResponse para montar o perfil se necessário
            const userProfile = user; // ou buildProfileResponse(user)
            return res.json({success: true, user: userProfile, message: 'Login efetuado com sucesso' });
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
                const verficationLink = await admin.auth().generateEmailVerificationLink(email);
                await sendVerificationEmail(email, verficationLink);
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
            console.log(err);
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
};

module.exports = AuthController;