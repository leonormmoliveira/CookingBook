const transporter = require("./emailTransporter")

const sendVerificationEmail = async (email, verificationLink) => {
    const mailOptions = {
        from: `"CookingBook" <${process.env.Email_User}>`,
        to: email,
        subject: 'Verifique seu email - CookingBook',
        html: `
            <div style = 'font-family: Arial, sans-serif;'>
                <h2>Bem vindo ao CookingBook </h2>
                <p>Para ativar sua conta, clique no botão abaixo:</p>
                <a href = '${verificationLink}' style = 'display: inline-block; padding: 10px 16px; background: #1424db; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;'>
                    Verificar email
                </a>
                <p style = 'margin-top: 20px;'>
                    Se você não criou esta conta, ignore este email.
                </p>
            </div> ` 
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendVerificationEmail