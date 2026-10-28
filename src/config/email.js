const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const enviarOTP = async (email, codigo) => {
    return await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verificação de e-mail - FIMAP',
        text: `Seu código de verificação é ${codigo}. Ele expira em 5 minutos.`
    })
}

module.exports = { enviarOTP }