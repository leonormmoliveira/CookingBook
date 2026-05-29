const { transporter, emailFrom } = require('./emailTransporter');

async function sendPasswordResetEmail(email, resetLink) {
    await transporter.sendMail({
        from: emailFrom,
        to: email,
        subject: 'Redefinir palavra-passe',
        html: `
            <h2>Redefinir palavra-passe</h2>
            <p>Clique no link abaixo para criar uma nova palavra-passe:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Este link expira em 1 hora.</p>
        `,
    });
}

module.exports = sendPasswordResetEmail;