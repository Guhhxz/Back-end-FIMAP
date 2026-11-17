// Caminho sugerido: src/middleware/autenticar.js
// Protege rotas: exige "Authorization: Bearer <access_token>" válido
const jwt = require('jsonwebtoken')
const config_message = require('../controller/modulo/configMensagens.js')

const autenticar = (req, res, next) => {
    const [tipo, token] = (req.headers.authorization || '').split(' ')

    if (tipo !== 'Bearer' || !token) {
        return res.status(config_message.TOKEN_AUSENTE.status).json({
            sucesso: false,
            codigo: 'TOKEN_AUSENTE',
            mensagem: config_message.TOKEN_AUSENTE.mensagem
        })
    }

    if (!process.env.JWT_SECRET) {
        return res.status(config_message.ERRO_LOGIN.status).json({
            sucesso: false,
            codigo: 'AUTH_CONFIGURACAO',
            mensagem: config_message.ERRO_LOGIN.mensagem
        })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })

        // tokens com "tipo" (ex.: de redefinição de senha) não valem como access token
        if (typeof payload !== 'object' || payload.tipo ||
            (typeof payload.sub !== 'number' && (typeof payload.sub !== 'string' || !/^\d+$/.test(payload.sub))) ||
            !Number.isSafeInteger(Number(payload.sub)) || Number(payload.sub) <= 0) {
            return res.status(config_message.TOKEN_INVALIDO.status).json({
                sucesso: false,
                codigo: 'TOKEN_INVALIDO',
                mensagem: config_message.TOKEN_INVALIDO.mensagem
            })
        }

        req.usuario = { id: Number(payload.sub) }
        next()
    } catch (error) {
        const erro = error.name === 'TokenExpiredError'
            ? config_message.TOKEN_EXPIRADO
            : config_message.TOKEN_INVALIDO

        return res.status(erro.status).json({
            sucesso: false,
            codigo: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRADO' : 'TOKEN_INVALIDO',
            mensagem: erro.mensagem
        })
    }
}

module.exports = autenticar
