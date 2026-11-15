const pluggyService = require("../../services/pluggyService")
const pluggyDashboardService = require("../../services/dashboardService.js")
const conexaoDAO = require("../../../model/DAO/OpenFinance/conexaoOpenFinanceDAO.js")

async function gerarConnectToken(req, res) {
    try {
        const { clientUserId } = req.body

        if (!clientUserId || typeof clientUserId !== 'string') {
            return res.status(400).json({
                erro: 'Informe um clientUserId válido.'
            })
        }

        const accessToken = await pluggyService.criarConnectToken(clientUserId)

        return res.status(200).json({
            accessToken
        })
    } catch (error) {
        console.error('Erro ao gerar Connect Token:', error.message)

        return res.status(500).json({
            erro: 'Não foi possível gerar o Connect Token.'
        })
    }
}

async function obterSaldo(req, res) {
    try {
        const { itemId } = req.params

        if (!itemId) {
            return res.status(400).json({ erro: 'Informe o itemId.' })
        }

        const resultado = await pluggyService.buscarSaldo(itemId)

        if (resultado.atualizando) {
            return res.status(202).json({
                mensagem: 'Conexão ainda sincronizando. Tente novamente em alguns segundos.'
            })
        }

        return res.status(200).json(resultado)
    } catch (error) {
        console.error('Erro ao buscar saldo:', error)
        return res.status(500).json({ erro: 'Não foi possível buscar o saldo.' })
    }
}


async function obterContas(req, res) {
    try {
        const { itemId } = req.params

        if (!itemId) {
            return res.status(400).json({ erro: "Informe o itemId." })
        }

        const resultado = await pluggyService.listarContas(itemId)

        if (resultado.atualizando) {
            return res.status(202).json({
                mensagem: "Conexão ainda sincronizando. Tente novamente em alguns segundos."
            })
        }

        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro ao buscar contas", error)
        return res.status(500).json({ erro: "Não foi possível buscar as contas." })
    }
}

async function obterCartoes(req, res) {
    try {
        const { itemId } = req.params

        if (!itemId) {
            return res.status(400).json({ erro: "Informe o itemId." })
        }

        const resultado = await pluggyService.listarCartoes(itemId)

        if (resultado.atualizando) {
            return res.status(202).json({
                mensagem: "Conexão ainda sincronizando. Tente novamente em alguns segundos."
            })
        }

        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro ao buscar cartões:", error)
        return res.status(500).json({ erro: "Não foi possível buscar os cartões." })
    }
}

async function obterInvestimentos(req, res) {
    try {
        const { itemId } = req.params

        if (!itemId) {
            return res.status(400).json({ erro: "Informe o itemId." })
        }

        const resultado = await pluggyService.listarInvestimentos(itemId)

        if (resultado.atualizando) {
            return res.status(202).json({
                mensagem: "Conexão ainda sincronizando. Tente novamente em alguns segundos."
            })
        }

        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro ao buscar investimentos:", error)
        return res.status(500).json({ erro: "Não foi possível buscar os investimentos." })
    }
}

async function obterEvolucaoInvestimentos(req, res) {
    try {
        const { itemId } = req.params
        const { periodo = "1a" } = req.query

        if (!itemId) {
            return res.status(400).json({ erro: "Informe o itemId." })
        }

        const resultado = await pluggyService.listarEvolucaoInvestimentos(itemId, periodo)
        return res.status(200).json(resultado)
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ erro: error.message })
        }
        console.error("Erro ao buscar evolução de investimentos:", error)
        return res.status(500).json({ erro: "Não foi possível buscar a evolução dos investimentos." })
    }
}

async function obterEmprestimos(req, res) {
    try {
        const { itemId } = req.params

        if (!itemId) {
            return res.status(400).json({ erro: "Informe o itemId." })
        }

        const resultado = await pluggyService.listarEmprestimos(itemId)

        if (resultado.atualizando) {
            return res.status(202).json({
                mensagem: "Conexão ainda sincronizando. Tente novamente em alguns segundos."
            })
        }

        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro ao buscar empréstimos:", error)
        return res.status(500).json({ erro: "Não foi possível buscar os empréstimos." })
    }
}

const obterEmprestimoPorId = async (req, res) => {
    try {
        const { itemId, emprestimoId } = req.params
        const resultado = await pluggyService.buscarEmprestimo(itemId, emprestimoId)
        res.status(200).json(resultado)
    } catch (error) {
        console.error('Erro ao obter empréstimo:', error)
        res.status(error.status ?? 500).json({ mensagem: error.message ?? 'Erro ao obter o empréstimo.' })
    }
}

const obterParcelasEmprestimo = async (req, res) => {
    try {
        const { itemId, emprestimoId } = req.params
        const resultado = await pluggyService.listarParcelasEmprestimo(itemId, emprestimoId)
        res.status(200).json(resultado)
    } catch (error) {
        console.error('Erro ao obter parcelas do empréstimo:', error)
        res.status(error.status ?? 500).json({ mensagem: error.message ?? 'Erro ao obter as parcelas do empréstimo.' })
    }
}

const obterDetalheEmprestimo = async (req, res) => {
    try {
        const { itemId, emprestimoId } = req.params
        const { limitePagas } = req.query
        const resultado = await pluggyService.obterDetalheEmprestimo(itemId, emprestimoId, { limitePagas })
        res.status(200).json(resultado)
    } catch (error) {
        console.error('Erro ao obter detalhe do empréstimo:', error)
        res.status(error.status ?? 500).json({ mensagem: error.message ?? 'Erro ao obter o detalhe do empréstimo.' })
    }
}


async function obterTransacoes(req, res) {
    try {
        const { itemId } = req.params

        if (!itemId) {
            return res.status(400).json({ erro: "Informe o itemId." })
        }

        const resultado = await pluggyService.listarTransacoes(itemId)

        if (resultado.atualizando) {
            return res.status(202).json({
                mensagem: "Conexão ainda sincronizando. Tente novamente em alguns segundos."
            })
        }

        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro ao buscar transações:", error)
        return res.status(500).json({ erro: "Não foi possível buscar as transações." })
    }
}

async function obterResumosBancario(req, res) {
    try {
        const { itemId, periodo = "mes" } = req.query
        console

        if (!itemId) {
            return res.status(400).json({ erro: "Informe o itemId." })
        }

        const periodosPermitidos = ["dia", "semana", "mes"];

        if (!periodosPermitidos.includes(periodo)) {
            return res.status(400).json({ erro: "Período Inválido." })
        }

        const resultado = await pluggyDashboardService.criarResumoBancario(itemId, periodo)

        if (resultado.atualizando) {
            return res.status(202).json({
                mensagem: "Conexão ainda sincronizando. Tente novamente em alguns segundos."
            })
        }

        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro ao buscar transações:", error)
        return res.status(500).json({ erro: "Não foi possível buscar as transações." })
    }
}

async function adicionarConexao(req, res) {
    try {
        const { idUsuario } = req.params
        const { status, consentimento_api, ultima_sincronizacao, provedor, external_connection_id, nome_instituicao } = req.body

        if (!idUsuario) {
            return res.status(400).json({ erro: "Informe o ID do usuário." })
        }

        if (status === undefined || status === null) {
            return res.status(400).json({ erro: "Informe o status da conexão." })
        }

        const conexao = {
            status,
            consentimento_api,
            ultima_sincronizacao,
            provedor,
            external_connection_id,
            nome_instituicao,
            id_usuario: idUsuario
        }

        const resultado = await pluggyService.adicionarConexao(conexao)

        if (!resultado) {
            return res.status(500).json({ erro: "Não foi possível adicionar a conexão." })
        }

        return res.status(201).json({
            mensagem: "Conexão adicionada com sucesso.",
            id: resultado
        })
    } catch (error) {
        console.error("Erro ao adicionar conexão:", error)
        return res.status(500).json({ erro: "Não foi possível adicionar a conexão." })
    }
}

async function listarConexoes(req, res) {
    try {
        const { idUsuario } = req.params

        if (!idUsuario) {
            return res.status(400).json({ erro: "Informe o ID do usuário." })
        }

        const conexoes = await pluggyService.listarConexoesPorUsuario(idUsuario)

        return res.status(200).json({
            total: conexoes.length,
            conexoes
        })
    } catch (error) {
        console.error("Erro ao listar conexões:", error)
        return res.status(500).json({ erro: "Não foi possível listar as conexões." })
    }
}

const deletarConexao = async (req, res) => {
    try {
        const { id_usuario, id } = req.params

        const resultado = await conexaoDAO.DeleteConexao({
            id,
            id_usuario
        })

        if (!resultado) {
            return res.status(404).json({
                sucesso: false,
                codigo: 'CONEXÃO_NÃO_ENCONTRADA',
                mensagem: 'Conexão Não Encontrada.'
            })
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Conexão deletada com sucesso!'
        })

    } catch (error) {
        console.error('Erro ao deletar conexão:', error)
        return res.status(500).json({
            sucesso: false,
            codigo: 'ERRO_INTERNO',
            mensagem: 'Erro interno ao deletar conexão.'
        })
    }
}

function lerParametrosCartao(req) {
    return {
        itemId: req.query.itemId,
        cartaoId: req.params.cartaoId,
    }
}

function responderErroCartao(res, error, contexto, mensagemPadrao) {
    if (error.status) {
        return res.status(error.status).json({ erro: error.message })
    }

    console.error(`Erro ao ${contexto}:`, error)
    return res.status(500).json({ erro: mensagemPadrao })
}

function responderSincronizando(res) {
    return res.status(202).json({
        mensagem: 'Conexão ainda sincronizando. Tente novamente em alguns segundos.'
    })
}

async function obterFaturaCartao(req, res) {
    try {
        const { itemId, cartaoId } = lerParametrosCartao(req)

        if (!itemId) {
            return res.status(400).json({ erro: 'Informe o itemId.' })
        }

        if (!cartaoId) {
            return res.status(400).json({ erro: 'Informe o cartaoId.' })
        }

        const resultado = await pluggyService.obterFaturaCartao(itemId, cartaoId)

        if (resultado.atualizando) {
            return responderSincronizando(res)
        }

        return res.status(200).json(resultado)
    } catch (error) {
        return responderErroCartao(res, error, 'buscar fatura do cartão', 'Não foi possível buscar a fatura do cartão.')
    }
}

async function obterGastosCartao(req, res) {
    try {
        const { itemId, cartaoId } = lerParametrosCartao(req)
        const { periodo = 'fatura-atual' } = req.query

        if (!itemId) {
            return res.status(400).json({ erro: 'Informe o itemId.' })
        }

        if (!cartaoId) {
            return res.status(400).json({ erro: 'Informe o cartaoId.' })
        }

        // Por enquanto só existe a fatura atual (é o que o design mostra).
        if (periodo !== 'fatura-atual') {
            return res.status(400).json({ erro: 'Período inválido. Use "fatura-atual".' })
        }

        const resultado = await pluggyService.obterGastosCartaoPorCategoria(itemId, cartaoId)

        if (resultado.atualizando) {
            return responderSincronizando(res)
        }

        return res.status(200).json(resultado)
    } catch (error) {
        return responderErroCartao(res, error, 'buscar gastos por categoria', 'Não foi possível buscar os gastos por categoria.')
    }
}

async function obterTransacoesCartao(req, res) {
    try {
        const { itemId, cartaoId } = lerParametrosCartao(req)
        const limite = req.query.limite === undefined ? 20 : Number(req.query.limite)

        if (!itemId) {
            return res.status(400).json({ erro: 'Informe o itemId.' })
        }

        if (!cartaoId) {
            return res.status(400).json({ erro: 'Informe o cartaoId.' })
        }

        if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
            return res.status(400).json({ erro: 'O limite deve ser um inteiro entre 1 e 100.' })
        }

        const resultado = await pluggyService.listarTransacoesCartao(itemId, cartaoId, limite)

        if (resultado.atualizando) {
            return responderSincronizando(res)
        }

        return res.status(200).json(resultado)
    } catch (error) {
        return responderErroCartao(res, error, 'buscar transações do cartão', 'Não foi possível buscar as transações do cartão.')
    }
}


module.exports = { 
    gerarConnectToken, 
    obterSaldo,
    obterContas,
    obterCartoes,
    obterInvestimentos,
    obterEmprestimos,
    obterTransacoes,
    obterResumosBancario,
    adicionarConexao,
    listarConexoes,
    obterFaturaCartao,
    obterGastosCartao,
    obterTransacoesCartao,
    obterEvolucaoInvestimentos,
    obterEmprestimoPorId,
    obterParcelasEmprestimo,
    obterDetalheEmprestimo,
    deletarConexao
}

