const categoriaDAO = require('../../../model/DAO/CategoriaRecomendacao/CategoriaRecomendacaoDAO.js')

const listarCategoriasRecomendacao = async (req, res) => {
    const usuarioId = Number(req.usuario?.id ?? req.usuario?.id_usuario ?? req.user?.id ?? req.user?.id_usuario)
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.status(401).json({ sucesso: false, mensagem: 'Usuário não autenticado.' })
    }
    try {
        const categorias = await categoriaDAO.listarCategoriasRecomendacao()
        return res.status(200).json(categorias)
    } catch (error) {
        console.error('Erro ao listar categorias de recomendação:', error)
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' })
    }
}

module.exports = { listarCategoriasRecomendacao }
