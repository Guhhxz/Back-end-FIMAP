const { error } = require('./httpClient')
// Alternativas devem preservar o conceito: PTAX e câmbio médio não são intercambiáveis.
function createSelector(env) {
    return async function select(kind, providers) {
        const configured = env[`FINANCIAL_PROVIDERS_${kind.toUpperCase()}`]
        const order = configured ? String(configured).split(',').map(item => item.trim()) : Object.keys(providers)
        let lastError
        const tentativas = []
        for (const name of [...new Set(order)].slice(0, 3)) {
            if (!Object.hasOwn(providers, name)) continue
            try {
                const result = await providers[name]()
                if (tentativas.length) result.observacoes.push(`Fonte alternativa utilizada após indisponibilidade de: ${tentativas.join(', ')}.`)
                return result
            } catch (cause) {
                lastError = cause
                tentativas.push(name)
                if (!['CHAVE_AUSENTE', 'AUTENTICACAO', 'PLANO_OU_PERMISSAO', 'NAO_ENCONTRADO', 'DADOS_INDISPONIVEIS', 'PROVEDOR_INDISPONIVEL', 'RESPOSTA_INVALIDA', 'COTA_EXCEDIDA'].includes(cause.code)) throw cause
            }
        }
        throw lastError || error('PROVEDOR_NAO_CONFIGURADO')
    }
}
module.exports = { createSelector }
