// Opt-in explícito. Só consultas públicas sem credenciais e sem inferência paga.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createRegistry } = require('../src/services/financial/financialToolRegistry')
for (const [tool, args] of [
    ['consultarTaxaSelic', {}],
    ['consultarCDI', {}],
    ['consultarInflacao', { indice: 'IPCA' }],
    ['consultarCotacaoAcao', { simbolo: 'PETR4' }],
    ['consultarCotacaoMoeda', { base: 'USD', destino: 'BRL' }],
    ['consultarInstituicaoFinanceira', { codigo: 1 }]
]) {
    test(`API real opcional: ${tool}`, { skip: process.env.FINANCIAL_LIVE_TESTS !== '1' }, async () => {
        const registry = createRegistry({ FINANCIAL_HTTP_RETRIES: '0', FINANCIAL_PROVIDERS_ACOES: 'brapi', FINANCIAL_HTTP_TIMEOUT_MS: '15000' })
        const result = await registry.execute(tool, args)
        assert.ok(result.fonte)
        assert.ok(result.consultadoEm)
        assert.ok(result.dados)
    })
}
