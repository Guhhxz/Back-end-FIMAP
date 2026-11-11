const extratoCartaoService = require('../../services/extratoCartaoService.js')
const { PluggyError } = require('../../services/extratoCartao/pluggyApi.js')

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MES_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

function responderErro(res, status, codigo, mensagem) {
    return res.status(status).json({ sucesso: false, codigo, mensagem, erro: mensagem })
}

async function obterExtratoCartao(req, res) {
    try {
        const { cartaoId } = req.params
        const { itemId, mes } = req.query

        if (typeof itemId !== 'string' || !UUID_REGEX.test(itemId)) {
            return responderErro(res, 400, 'ITEM_ID_INVALIDO', 'Informe um itemId válido.')
        }
        if (!UUID_REGEX.test(cartaoId ?? '')) {
            return responderErro(res, 400, 'CARTAO_ID_INVALIDO', 'Informe um cartaoId válido.')
        }
        if (mes !== undefined && (typeof mes !== 'string' || !MES_REGEX.test(mes))) {
            return responderErro(res, 400, 'MES_INVALIDO', 'Informe o mês no formato AAAA-MM.')
        }

        const resultado = await extratoCartaoService.obterExtratoCartao(itemId, cartaoId, mes)

        if (resultado.atualizando) {
            return res.status(202).json({
                atualizando: true,
                mensagem: 'Conexão ainda sincronizando. Tente novamente em alguns segundos.',
            })
        }

        return res.status(200).json({ sucesso: true, ...resultado })
    } catch (error) {
        if (error instanceof extratoCartaoService.ErroExtrato) {
            return responderErro(res, error.status, error.codigo, error.message)
        }
        if (error instanceof PluggyError) {
            console.error('Erro do Pluggy ao buscar extrato do cartão:', error.codigo, error.message)
            return responderErro(
                res,
                error.status === 404 ? 404 : 502,
                error.codigo,
                'Não foi possível consultar o banco agora. Tente novamente em instantes.',
            )
        }

        console.error('Erro ao buscar extrato do cartão:', error)
        return responderErro(res, 500, 'EXTRATO_CARTAO_ERRO', 'Não foi possível buscar o extrato do cartão.')
    }
}

module.exports = { obterExtratoCartao }