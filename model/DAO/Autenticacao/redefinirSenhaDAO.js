const knex = require('knex')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const knexConfig = require('../../../model/Database_config_knex/KnexFile.js')
const knexConex = knex(knexConfig.development)

// O token emitido apos validar o OTP usa o formato base64url(payload).assinatura.
const validarTokenRedefinicao = (token) => {
    if (typeof token !== 'string') return null
    const partes = token.split('.')
    if (partes.length !== 2) return null

    const segredo = process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET
    if (!segredo) return null

    const assinaturaEsperada = crypto
        .createHmac('sha256', segredo)
        .update(partes[0])
        .digest('base64url')
    const assinaturaRecebida = Buffer.from(partes[1])
    const assinaturaCalculada = Buffer.from(assinaturaEsperada)

    if (assinaturaRecebida.length !== assinaturaCalculada.length ||
        !crypto.timingSafeEqual(assinaturaRecebida, assinaturaCalculada)) return null

    try {
        const payload = JSON.parse(Buffer.from(partes[0], 'base64url').toString('utf8'))
        if (payload.tipo !== 'redefinicao_senha' || !Number.isInteger(Number(payload.id_usuario))) return null
        if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null
        return { id_usuario: Number(payload.id_usuario), exp: payload.exp }
    } catch {
        return null
    }
}

const redefinirSenha = async (token, novaSenha) => {
    try {
        const payload = validarTokenRedefinicao(token)
        if (!payload) return { sucesso: false, motivo: 'TOKEN_INVALIDO' }

        const [usuario] = await knexConex('tbl_usuario').select('id', 'senha').where({ id: payload.id_usuario }).limit(1)
        if (!usuario) return { sucesso: false, motivo: 'USUARIO_NAO_ENCONTRADO' }

        if (await bcrypt.compare(novaSenha, usuario.senha)) {
            return { sucesso: false, motivo: 'SENHA_IGUAL' }
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10)
        const alterados = await knexConex('tbl_usuario').where({ id: payload.id_usuario }).update({ senha: senhaHash })
        return alterados > 0 ? { sucesso: true } : { sucesso: false, motivo: 'USUARIO_NAO_ENCONTRADO' }
    } catch (error) {
        console.error('Erro ao redefinir senha:', error)
        return { sucesso: false, motivo: 'ERRO_INTERNO' }
    }
}

module.exports = { redefinirSenha, validarTokenRedefinicao }
