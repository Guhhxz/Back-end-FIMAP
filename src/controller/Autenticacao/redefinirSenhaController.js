const redefinirSenhaDAO = require('../../../model/DAO/Autenticacao/redefinirSenhaDAO.js')

const validarPoliticaSenha = (senha) =>
    typeof senha === 'string' &&
    senha.length >= 8 &&
    /[a-z]/.test(senha) &&
    /[A-Z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z0-9]/.test(senha)

const redefinirSenha = async (req, res) => {
    try {
        const { token_redefinicao, nova_senha, confirmar_nova_senha } = req.body || {}
        if (typeof nova_senha !== 'string' || typeof confirmar_nova_senha !== 'string' || nova_senha !== confirmar_nova_senha) {
            return res.status(400).json({ sucesso: false, mensagem: 'A confirmação deve ser exatamente igual à nova senha.' })
        }
        if (typeof token_redefinicao !== 'string' || !token_redefinicao.trim() || !validarPoliticaSenha(nova_senha)) {
            return res.status(400).json({ sucesso: false, mensagem: 'Token inválido ou senha fora da política de segurança.' })
        }

        const resultado = await redefinirSenhaDAO.redefinirSenha(token_redefinicao, nova_senha)
        if (!resultado.sucesso) {
            const status = resultado.motivo === 'ERRO_INTERNO' ? 500 : 400
            return res.status(status).json({ sucesso: false, mensagem: status === 500 ? 'Não foi possível redefinir a senha.' : 'Token inválido/expirado ou senha fora da política.' })
        }

        return res.status(200).json({ sucesso: true, mensagem: 'Senha redefinida com sucesso.' })
    } catch (error) {
        console.error('Erro no controller de redefinição de senha:', error)
        return res.status(500).json({ sucesso: false, mensagem: 'Não foi possível redefinir a senha.' })
    }
}

module.exports = { redefinirSenha }
