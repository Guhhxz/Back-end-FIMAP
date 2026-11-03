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

async function obterFaturas(req, res) {
    try {
        const { itemId } = req.params

        if (!itemId) {
            return res.status(400).json({ erro: "Informe o itemId." })
        }

        const resultado = await pluggyService.listarFaturas(itemId)

        if (resultado.atualizando) {
            return res.status(202).json({
                mensagem: "Conexão ainda sincronizando. Tente novamente em alguns segundos."
            })
        }

        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro ao buscar faturas:", error)
        return res.status(500).json({ erro: "Não foi possível buscar as faturas." })
    }
}

async function obterAtivos(req, res) {
    try {
        const { itemId } = req.params

        if (!itemId) {
            return res.status(400).json({ erro: "Informe o itemId." })
        }

        const resultado = await pluggyService.listarAtivos(itemId)

        if (resultado.atualizando) {
            return res.status(202).json({
                mensagem: "Conexão ainda sincronizando. Tente novamente em alguns segundos."
            })
        }

        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro ao buscar ativos:", error)
        return res.status(500).json({ erro: "Não foi possível buscar os ativos." })
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
        const { status, consentimento_api, ultima_sincronizacao, provedor, external_connection_id } = req.body

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
    obterFaturas,
    obterAtivos
}

