const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const enviarOTP = async (email, codigo) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                background-color: #ffffff;
                color: #24292e;
                margin: 0;
                padding: 40px;
            }
            .container {
                max-width: 540px;
                margin: 0 auto;
                border: 1px solid #eaeaea;
                border-radius: 6px;
                padding: 40px;
                background-color: #ffffff;
            }
            .header {
                text-align: center;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 24px;
                color: #111;
            }
            .title {
                text-align: center;
                font-size: 20px;
                font-weight: 600;
                margin: 0 0 24px;
            }
            .code-box {
                font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 6px;
                text-align: center;
                background-color: #f6f8fa;
                border: 1px solid #d1d5da;
                border-radius: 6px;
                padding: 16px;
                margin: 24px 0;
                color: #24292e;
                -webkit-user-select: all;
                user-select: all;
            }
            .footer {
                font-size: 12px;
                color: #586069;
                margin-top: 24px;
                border-top: 1px solid #eaeaea;
                padding-top: 16px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <strong>FIMAP</strong>
            </div>
            <p>Este é o seu código de verificação da FIMAP:</p>

            <div class="code-box">${codigo}</div>

            <p>Este código é válido por <strong>5 minutos</strong> e só pode ser usado uma vez.</p>
            <p><strong>Não compartilhe este código com ninguém.</strong> A equipe FIMAP nunca pedirá esse código por telefone ou mensagem.</p>

            <div class="footer">
                <p>Se você não solicitou este código, ignore este e-mail.</p>
                <p>Atenciosamente,<br>Equipe FIMAP</p>
            </div>
        </div>
    </body>
    </html>
    `

    return await transporter.sendMail({
        from: `"FIMAP" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '[FIMAP] Código de verificação',
        html: htmlTemplate,
        text: `Seu código de verificação da FIMAP é: ${codigo}\n\nEle é válido por 5 minutos e só pode ser usado uma vez. Não compartilhe este código com ninguém.\n\nSe você não solicitou este código, ignore este e-mail.`
    })
}


module.exports = { enviarOTP }