const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createRegistry } = require('../src/services/financial/financialToolRegistry')
const { createClient } = require('../src/services/financial/httpClient')
const { prepareFinancialMessages } = require('../src/services/financial/financialChatOrchestrator')
const calc = require('../src/services/financial/calculations')
const json = (body, status = 200, headers) => new Response(JSON.stringify(body), { status, headers })
const args = (name, values) => ({ id: 'call_test', type: 'function', function: { name, arguments: JSON.stringify(values) } })
const plan = (...calls) => ({ choices: [{ message: { content: null, tool_calls: calls } }] })
const messages = [{ role: 'system', content: 'FIMAP' }, { role: 'user', content: 'Minha pergunta' }]
const fixtureDate = new Date().toISOString().slice(0, 10)
const brDate = fixtureDate.split('-').reverse().join('/')
const registry = (respond, env = {}) => createRegistry(env, { fetchImpl: async (url, options) => respond(new URL(url), options) })

for (const [tool, input, code, unit] of [
    ['consultarTaxaSelic', {}, 432, '% ao ano'],
    ['consultarCDI', {}, 12, '% ao dia'],
    ['consultarInflacao', { indice: 'IPCA' }, 433, '% no mês'],
    ['consultarInflacao', { indice: 'IGPM' }, 189, '% no mês']
]) {
    test(`${tool} ${code} preserva unidade, data e fonte oficiais (mock)`, async () => {
        const tools = registry(url => {
            assert.match(url.pathname, new RegExp(`bcdata.sgs.${code}/dados$`))
            assert.ok(url.searchParams.get('dataInicial'))
            assert.ok(url.searchParams.get('dataFinal'))
            return json([{ data: brDate, valor: '0.05' }])
        })
        const result = await tools.execute(tool, input)
        assert.equal(result.unidade, unit)
        assert.equal(result.dataReferencia, fixtureDate)
        assert.equal(result.dados.pontos[0].valor, 0.05)
        assert.equal(result.fonte, 'Banco Central / SGS')
    })
}

test('PETR4 usa brapi v2, valida results[].data e mantém ausência como null', async () => {
    const tools = registry((url, options) => {
        assert.equal(url.pathname, '/api/v2/stocks/quote')
        assert.equal(url.searchParams.get('symbols'), 'PETR4')
        assert.equal(options.headers.Authorization, 'Bearer chave-teste')
        return json({ results: [{ requestedSymbol: 'PETR4', symbol: 'PETR4', data: { regularMarketPrice: 30.12, currency: 'BRL', regularMarketTime: fixtureDate } }] })
    }, { BRAPI_TOKEN: 'chave-teste' })
    const result = await tools.execute('consultarCotacaoAcao', { simbolo: 'PETR4' })
    assert.equal(result.dados.valor, 30.12)
    assert.equal(result.dados.variacaoPercentual, null)
    assert.equal(result.atrasoEstimadoMinutos, null)
    assert.ok(!JSON.stringify(result).includes('chave-teste'))
})

test('USD/BRL usa referência Frankfurter com data real do retorno', async () => {
    const tools = registry(url => {
        assert.equal(url.pathname, '/v2/rate/USD/BRL')
        return json({ base: 'USD', quote: 'BRL', date: fixtureDate, rate: 5.12 })
    })
    const result = await tools.execute('consultarCotacaoMoeda', { base: 'USD', destino: 'BRL' })
    assert.equal(result.dados.pontos[0].valor, 5.12)
    assert.match(result.unidade, /BRL por USD/)
})

test('consulta banco por COMPE sem confundir com saldo ou dados privados', async () => {
    const tools = registry(url => {
        assert.equal(url.pathname, '/api/banks/v1/1')
        return json({ code: 1, name: 'Banco de teste', fullName: 'Banco de teste S.A.', ispb: '00000000' })
    })
    assert.equal((await tools.execute('consultarInstituicaoFinanceira', { codigo: 1 })).dados[0].codigo, 1)
})

test('cálculos financeiros verificam compostos, taxa zero, Price, SAC, meta e retorno líquido', () => {
    assert.equal(calc.investment({ capital: 1000, taxaPercentual: 10, periodos: 2 }).valorFinalBruto, 1210)
    assert.equal(calc.investment({ capital: 1000, taxaPercentual: 0, periodos: 12, aporte: 100 }).valorFinalBruto, 2200)
    const price = calc.financing({ principal: 10000, taxaMensalPercentual: 1, meses: 12 }, 'Price')
    assert.equal(price.primeiraPrestacao, 888.49)
    assert.equal(price.ultimaPrestacao, price.primeiraPrestacao)
    assert.equal(price.cronograma.at(-1).saldo, 0)
    const sac = calc.financing({ principal: 12000, taxaMensalPercentual: 1, meses: 12 }, 'SAC')
    assert.equal(sac.primeiraPrestacao, 1120)
    assert.equal(sac.ultimaPrestacao, 1010)
    assert.equal(sac.totalJuros, 780)
    assert.equal(calc.goal({ meta: 12000, meses: 12 }).aporteMensal, 1000)
    const net = calc.netReturn({ capital: 1000, valorFinalBruto: 1100, aliquotaIRPercentual: 20, aliquotaIOFPercentual: 50 })
    assert.equal(net.iof, 50); assert.equal(net.impostoRenda, 10); assert.equal(net.valorFinalLiquido, 1040)
    assert.ok(Math.abs(calc.loanCost({ valorRecebido: 10000, parcela: 888.487886783416, meses: 12 }).taxaEfetivaMensalPercentual - 1) < 1e-8)
    assert.throws(() => calc.investment({ capital: 1000, taxaPercentual: NaN, periodos: 12 }))
    assert.throws(() => calc.financing({ principal: 1000, taxaMensalPercentual: 1, meses: 1e9 }, 'SAC'))
})

for (const [status, code] of [[400, 'PARAMETROS_PROVEDOR'], [401, 'AUTENTICACAO'], [403, 'PLANO_OU_PERMISSAO'], [404, 'NAO_ENCONTRADO'], [429, 'COTA_EXCEDIDA'], [503, 'PROVEDOR_INDISPONIVEL']]) {
    test(`trata HTTP ${status} sem vazar chave ou corpo do provedor`, async () => {
        const tools = registry(() => json({ message: 'segredo-que-nao-deve-vazar' }, status), { BRAPI_TOKEN: 'segredo', FINANCIAL_HTTP_RETRIES: '0', FINANCIAL_PROVIDERS_ACOES: 'brapi' })
        await assert.rejects(tools.execute('consultarCotacaoAcao', { simbolo: 'PETR4' }), cause => cause.code === code && !cause.message.includes('segredo'))
    })
}

test('chave ausente desabilita integração correspondente sem chamar HTTP', async () => {
    const tools = registry(() => { throw Error('Não deveria consultar') })
    await assert.rejects(tools.execute('consultarCotacaoAcao', { simbolo: 'WEGE3' }), { code: 'CHAVE_AUSENTE' })
    await assert.rejects(tools.execute('consultarPanoramaMercado', {}), { code: 'CHAVE_AUSENTE' })
})

test('cache preserva horário original e orçamento limita consultas', async () => {
    let count = 0
    const env = { FINANCIAL_MAX_HTTP_CALLS: '1' }
    const client = createClient(env, { fetchImpl: async () => { count++; return json({ ok: true }) } })
    const first = await client.get('brasilapi', '/api/banks/v1/1', {}, { kind: 'banks' })
    const second = await client.get('brasilapi', '/api/banks/v1/1', {}, { kind: 'banks' })
    assert.equal(count, 1); assert.equal(second.cache, true); assert.equal(first.consultadoEm, second.consultadoEm)
    await assert.rejects(client.get('brasilapi', '/api/banks/v1/2'), { code: 'LIMITE_CONSULTAS' })
})

test('bloqueia URL livre, série arbitrária, parâmetros extras e períodos excessivos', async () => {
    const tools = registry(() => { throw Error('Não deveria consultar') })
    await assert.rejects(tools.execute('fetch', { url: 'http://127.0.0.1' }), { code: 'FERRAMENTA_NAO_PERMITIDA' })
    await assert.rejects(tools.execute('consultarSerieEconomica', { codigo: 999999 }), { code: 'SERIE_NAO_PERMITIDA' })
    await assert.rejects(tools.execute('consultarCDI', { url: 'http://127.0.0.1' }), { code: 'ARGUMENTO_NAO_PERMITIDO' })
    await assert.rejects(tools.execute('consultarSerieEconomica', { codigo: 12, inicio: '2000-01-01', fim: '2026-01-01' }), { code: 'PERIODO_INVALIDO' })
    const client = createClient({})
    await assert.rejects(client.get('brasilapi', '//evil.test/api'), { code: 'URL_NAO_PERMITIDA' })
})

test('IA escolhe ferramenta, recebe resultado e continua com cálculo sem perder histórico', async () => {
    const history = [...messages, { role: 'assistant', content: 'Você informou R$ 1.000.' }, { role: 'user', content: 'Quanto rende em um período?' }]
    let round = 0
    const result = await prepareFinancialMessages(history, {}, async input => {
        assert.ok(input.tools.some(tool => tool.function.name === 'consultarCDI'))
        assert.equal(input.stream, false)
        if (round++ === 0) return plan(args('consultarCDI', {}))
        const tool = JSON.parse(input.messages.find(item => item.role === 'tool').content)
        assert.equal(tool.resultado.dados.pontos[0].valor, 0.05)
        if (round === 2) return plan(args('calcularJurosCompostos', { capital: 1000, taxaPercentual: 0.05, periodos: 1 }))
        return plan()
    }, { fetchImpl: async () => json([{ data: brDate, valor: '0.05' }]) })
    assert.ok(result.some(item => item.content === 'Você informou R$ 1.000.'))
    const outputs = result.filter(item => item.role === 'tool').map(item => JSON.parse(item.content))
    assert.equal(outputs.length, 2)
    assert.equal(outputs[1].resultado.valorFinalBruto, 1000.5)
    assert.equal(round, 3)
})

test('pergunta conceitual não consulta APIs quando modelo não solicita ferramentas', async () => {
    let requests = 0
    const result = await prepareFinancialMessages(messages, {}, async () => plan(), { fetchImpl: async () => { requests++; throw Error('Não deveria consultar') } })
    assert.equal(requests, 0)
    assert.ok(!result.some(item => item.role === 'tool'))
})

test('limita chamadas e reaproveita repetições solicitadas pela IA', async () => {
    let requests = 0
    const result = await prepareFinancialMessages(messages, { FINANCIAL_MAX_TOOL_CALLS: '1' }, async () => plan(args('consultarCDI', {}), args('consultarCDI', {}), args('consultarTaxaSelic', {})), { fetchImpl: async () => { requests++; return json([{ data: brDate, valor: '0.05' }]) } })
    assert.equal(requests, 1)
    const outputs = result.filter(row => row.role === 'tool').map(row => JSON.parse(row.content))
    assert.equal(outputs[0].ok, true)
    assert.deepEqual(outputs[1], outputs[0])
    assert.equal(outputs[2].erro, 'LIMITE_FERRAMENTAS')
})

test('falha no planejamento mantém conversa e informa indisponibilidade', async () => {
    const result = await prepareFinancialMessages(messages, {}, async () => { throw Error('falha com segredo') })
    assert.ok(result.some(row => /seleção automática.*indisponível/.test(row.content)))
    assert.ok(!JSON.stringify(result).includes('segredo'))
    assert.ok(result.some(row => row.content === 'Minha pergunta'))
})

test('falha de consulta retorna erro estruturado ao modelo sem inventar dados', async () => {
    let round = 0
    const result = await prepareFinancialMessages(messages, { FINANCIAL_HTTP_RETRIES: '0', FINANCIAL_PROVIDERS_ACOES: 'brapi' }, async () => round++ === 0 ? plan(args('consultarCotacaoAcao', { simbolo: 'WEGE3' })) : plan())
    const output = JSON.parse(result.find(row => row.role === 'tool').content)
    assert.equal(output.ok, false)
    assert.equal(output.erro, 'CHAVE_AUSENTE')
    assert.equal(output.resultado, undefined)
})

test('simulação CDI consulta taxa diária e não presume alíquotas nem prazo', async () => {
    const tools = registry(() => json([{ data: brDate, valor: '0.05' }]))
    const result = await tools.execute('simularInvestimentoCDI', { capital: 1000, percentualCDI: 100, diasUteis: 1 })
    assert.equal(result.dados.valorFinalBruto, 1000.5)
    assert.equal(result.dados.liquido, null)
    await assert.rejects(tools.execute('simularInvestimentoCDI', { capital: 1000, percentualCDI: 100 }))
})

test('fallback de ações HG valida chave e usa metadados reais sem vazar credencial', async () => {
    const tools = registry(url => {
        if (url.hostname === 'brapi.dev') return json({}, 503)
        assert.equal(url.searchParams.get('tickers'), 'B3:PETR4')
        assert.equal(url.searchParams.get('key'), 'chave-hg-teste')
        return json({ metadata: { key_status: 'valid' }, results: [{ ticker: 'B3:PETR4', symbol: 'PETR4', unit: 'currency', currency: 'BRL', quote: { value: 35.5, change_percent: 1, updated_at: fixtureDate } }] })
    }, { HG_BRASIL_API_KEY: 'chave-hg-teste', FINANCIAL_HTTP_RETRIES: '0' })
    const result = await tools.execute('consultarCotacaoAcao', { simbolo: 'PETR4' })
    assert.equal(result.fonte, 'HG Brasil')
    assert.equal(result.dados.valor, 35.5)
    assert.match(result.observacoes.join(' '), /alternativa/)
    assert.ok(!JSON.stringify(result).includes('chave-hg-teste'))
})

test('HG sinaliza chave inválida mesmo com HTTP 200', async () => {
    const tools = registry(() => json({ metadata: { key_status: 'invalid' }, results: [] }), { HG_BRASIL_API_KEY: 'chave-teste' })
    await assert.rejects(tools.execute('consultarIndices', { ticker: 'INDEXB3:IBOV' }), { code: 'AUTENTICACAO' })
})

test('PTAX usa operação Swagger, data dinâmica e boletim identificado', async () => {
    const tools = registry(url => {
        assert.match(url.pathname, /CotacaoMoedaDia/)
        assert.equal(url.searchParams.get('@moeda'), "'USD'")
        assert.equal(url.searchParams.get('@dataCotacao'), "'10-30-2026'")
        return json({ value: [{ cotacaoCompra: 5.1, cotacaoVenda: 5.11, tipoBoletim: 'Fechamento', dataHoraCotacao: '2026-10-30 13:00:00' }] })
    })
    const result = await tools.execute('consultarPTAX', { moeda: 'USD', data: '2026-10-30' })
    assert.equal(result.dados.venda, 5.11)
    assert.equal(result.dataReferencia, '2026-10-30')
})

test('modalidades e taxas de crédito distinguem média e oferta individual', async () => {
    const tools = registry(url => {
        if (url.pathname.endsWith('/ParametrosConsulta')) return json({ value: [{ codigoModalidade: '123', codigoSegmento: '1', modalidade: 'Crédito pessoal (mock)', tipoModalidade: 'D' }] })
        assert.match(url.searchParams.get('$filter'), /codigoModalidade eq '123'/)
        return json({ value: [{ InicioPeriodo: fixtureDate, FimPeriodo: fixtureDate, InstituicaoFinanceira: 'Banco mock', TaxaJurosAoMes: 2, TaxaJurosAoAno: 26.82 }] })
    })
    const result = await tools.execute('consultarTaxasEmprestimo', { codigoModalidade: '123' })
    assert.equal(result.dados.instituicoes[0].taxaMensalPercentual, 2)
    assert.match(result.observacoes[0], /Não são ofertas personalizadas/)
})

test('FIPE exige código real e não transforma preço de referência em oferta', async () => {
    const tools = registry(url => {
        assert.equal(url.pathname, '/api/fipe/preco/v1/001004-9')
        return json([{ valor: 'R$ 10.000,00', anoModelo: 2000, mesReferencia: 'outubro de 2026', codigoFipe: '001004-9' }])
    })
    const result = await tools.execute('consultarPrecoVeiculo', { recurso: 'preco', codigoFipe: '001004-9' })
    assert.equal(result.dados[0].valor, 'R$ 10.000,00')
    assert.match(result.observacoes[0], /referência/)
    await assert.rejects(tools.execute('consultarPrecoVeiculo', { recurso: 'preco', codigoFipe: '../segredo' }))
})

test('cancelamento aborta HTTP e impede ferramentas seguintes', async () => {
    const controller = new AbortController()
    const result = prepareFinancialMessages(messages, {}, async () => plan(args('consultarCDI', {})), {
        signal: controller.signal,
        fetchImpl: async (_url, options) => {
            controller.abort()
            options.signal.throwIfAborted()
        }
    })
    await assert.rejects(result, { name: 'AbortError' })
})

test('resposta inválida ou antiga nunca vira valor zero atual', async () => {
    const invalid = registry(() => json([{ data: brDate, valor: '' }]))
    await assert.rejects(invalid.execute('consultarCDI', {}), { code: 'RESPOSTA_INVALIDA' })
    const old = registry(() => json([{ data: '01/01/2020', valor: '0.05' }]))
    const result = await old.execute('consultarCDI', {})
    assert.equal(result.desatualizado, true)
    assert.equal(result.dataReferencia, '2020-01-01')
})

test('Worker integra seleção nativa, consulta e resposta SSE nas duas rotas de chat', async () => {
    const built = await require('esbuild').build({ entryPoints: ['src/index.ts'], bundle: true, write: false, format: 'cjs', platform: 'neutral' })
    for (const path of ['/chat', '/v1/ia/chat-publico']) {
        let queried = 0, planning = 0, final = 0
        const context = {
            module: { exports: {} }, Request, Response, URL, ReadableStream, TextEncoder, TextDecoder, AbortSignal,
            console: { info() {}, error() {} }, Date, Map, setTimeout, clearTimeout,
            fetch: async url => {
                queried++
                assert.match(url, /bcdata.sgs.432/)
                return json([{ data: brDate, valor: '10.00' }])
            }
        }
        require('node:vm').runInNewContext(built.outputFiles[0].text, context)
        const env = {
            CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
            AI: { run: async (_model, input) => {
                if (input.stream === false) {
                    if (planning++ === 0) return plan(args('consultarTaxaSelic', {}))
                    const output = input.messages.find(row => row.role === 'tool')
                    assert.equal(JSON.parse(output.content).resultado.unidade, '% ao ano')
                    return plan()
                }
                final++
                assert.ok(input.messages.some(row => row.role === 'tool'))
                assert.ok(input.messages.some(row => row.content === 'E a Selic hoje?'))
                return new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('data: {"response":"Taxa consultada no Banco Central."}\n\n')); c.close() } })
            } }
        }
        const response = await context.module.exports.default.fetch(new Request('https://test' + path, { method: 'POST', body: JSON.stringify({ messages: [{ role: 'assistant', content: 'Falamos sobre juros.' }, { role: 'user', content: 'E a Selic hoje?' }] }) }), env)
        assert.equal(response.status, 200)
        const body = await response.text()
        assert.match(body, /Taxa consultada no Banco Central/)
        if (path !== '/chat') assert.match(body, /"tipo":"fim"/)
        assert.equal(queried, 1); assert.equal(planning, 2); assert.equal(final, 1)
    }
})

test('brapi histórico, dividendos e demonstrativos respeitam formatos distintos do schema', async () => {
    const fixtures = {
        historical: { usedInterval: '1d', historicalDataPrice: [{ date: 1704067200, close: 30.1, adjustedClose: 29.8, volume: 100 }] },
        dividends: { cashDividends: [{ paymentDate: fixtureDate, rate: 1.5, label: 'DIVIDENDO' }] },
        statistics: { mostRecentQuarter: fixtureDate, priceToBook: 2.1, profitMargins: null },
        'financial-data': { totalCash: 1000000, returnOnEquity: 0.15 },
        'balance-sheet': [{ endDate: fixtureDate, totalAssets: 10000000, totalLiab: null }],
        'income-statement': [{ endDate: fixtureDate, netIncome: 100000 }]
    }
    const tools = registry(url => json({ results: [{ requestedSymbol: 'PETR4', symbol: 'PETR4', data: fixtures[url.pathname.split('/').at(-1)] }] }), { BRAPI_TOKEN: 'teste' })
    assert.equal((await tools.execute('consultarHistoricoAcao', { simbolo: 'PETR4' })).dados.pontos[0].fechamento, 30.1)
    assert.equal((await tools.execute('consultarDividendos', { simbolo: 'PETR4' })).dados.eventos[0].valorPorAcao, 1.5)
    for (const recurso of ['statistics', 'financial-data', 'balance-sheet', 'income-statement']) {
        const result = await tools.execute('consultarFundamentosEmpresa', { simbolo: 'PETR4', recurso })
        assert.ok(Object.keys(result.dados.demonstrativos[0].indicadores).length)
    }
})

test('timeout, retry limitado e Retry-After longo são respeitados', async () => {
    let requests = 0
    const client = createClient({ FINANCIAL_HTTP_RETRIES: '1' }, { fetchImpl: async () => ++requests === 1 ? json({}, 503) : json({ ok: true }) })
    assert.equal((await client.get('brasilapi', '/api/banks/v1/1')).data.ok, true)
    assert.equal(requests, 2)
    let limitedRequests = 0
    const limited = createClient({}, { fetchImpl: async () => { limitedRequests++; return json({}, 429, { 'Retry-After': '60' }) } })
    await assert.rejects(limited.get('brasilapi', '/api/banks/v1/1'), { code: 'COTA_EXCEDIDA' })
    assert.equal(limitedRequests, 1)
    const slow = createClient({ FINANCIAL_HTTP_TIMEOUT_MS: '100', FINANCIAL_HTTP_RETRIES: '0' }, { fetchImpl: (_url, options) => new Promise((_, reject) => { options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true }) }) })
    // Mantém o processo vivo para observar o timer unref do AbortSignal.timeout do Node.
    const alive = setTimeout(() => {}, 1000)
    try { await assert.rejects(slow.get('brasilapi', '/api/banks/v1/1'), { code: 'PROVEDOR_INDISPONIVEL' }) }
    finally { clearTimeout(alive) }
})

test('limita concorrência por ambiente e consumo diário por isolate', async () => {
    let release
    const env = { FINANCIAL_MAX_CONCURRENT: '1', FINANCIAL_MAX_DAILY_HTTP: '1' }
    const options = { fetchImpl: async () => new Promise(resolve => { release = () => resolve(json({ ok: true })) }) }
    const first = createClient(env, options).get('brasilapi', '/api/banks/v1/1')
    await assert.rejects(createClient(env, options).get('brasilapi', '/api/banks/v1/2'), { code: 'CONCORRENCIA_EXCEDIDA' })
    release(); await first
    await assert.rejects(createClient(env, options).get('brasilapi', '/api/banks/v1/3'), { code: 'ORCAMENTO_DIARIO_EXCEDIDO' })
})

test('respostas malformadas e instruções de URL no plano não executam consultas', async () => {
    let calls = 0
    const outputs = await prepareFinancialMessages(messages, {}, async () => plan(args('consultarCDI', { url: 'http://127.0.0.1' })), { fetchImpl: async () => { calls++; throw Error('Não deveria consultar') } })
    assert.equal(calls, 0)
    assert.equal(JSON.parse(outputs.find(row => row.role === 'tool').content).erro, 'ARGUMENTO_NAO_PERMITIDO')
    const client = createClient({ FINANCIAL_HTTP_RETRIES: '0' }, { fetchImpl: async () => new Response('x'.repeat(1000001)) })
    await assert.rejects(client.get('brasilapi', '/api/banks/v1/1'), { code: 'RESPOSTA_GRANDE' })
})
