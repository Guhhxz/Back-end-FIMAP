const { createClient, error } = require('./httpClient')
const v = require('./validation')
const { createBancoCentral, SERIES } = require('./providers/bancoCentral')
const { createBrasilApi } = require('./providers/brasilApi')
const { createBrapi } = require('./providers/brapi')
const { createHgBrasil } = require('./providers/hgBrasil')
const { createFrankfurter } = require('./providers/frankfurter')
const { createSelector } = require('./financialProviderSelector')
const calc = require('./calculations')
const str = description => ({ type: 'string', description })
const num = description => ({ type: 'number', description })
const int = description => ({ type: 'integer', description })
const choice = values => ({ type: 'string', enum: values })
const stockArgs = { simbolo: str('Ticker B3, por exemplo PETR4 ou HGLG11'), inicio: str('Opcional YYYY-MM-DD, junto de fim; máximo 366 dias'), fim: str('YYYY-MM-DD') }
function createRegistry(env = {}, options = {}) {
    const client = createClient(env, options)
    const bcb = createBancoCentral(client), brasil = createBrasilApi(client), brapi = createBrapi(client, env), hg = createHgBrasil(client, env), fx = createFrankfurter(client)
    const select = createSelector(env)
    const registry = Object.create(null)
    function add(name, description, properties, required, execute) {
        registry[name] = { definition: { type: 'function', function: { name, description, parameters: { type: 'object', properties, required, additionalProperties: false } } }, execute }
    }
    add('consultarTaxaSelic', 'Meta Selic oficial em % ao ano (SGS 432). Não é Selic efetiva diária.', {}, [], () => bcb.serie({ codigo: 432 }))
    add('consultarCDI', 'CDI oficial diário em % ao dia (SGS 12). Nunca tratar como anual.', {}, [], () => bcb.serie({ codigo: 12 }))
    add('consultarInflacao', 'Variação mensal oficial de IPCA ou IGP-M; não é acumulado em 12 meses.', { indice: choice(['IPCA', 'IGPM']) }, ['indice'], a => bcb.serie({ codigo: a.indice === 'IPCA' ? 433 : 189 }))
    add('consultarSerieEconomica', 'Série SGS permitida. Metadados: ' + JSON.stringify(SERIES), { codigo: int('Código SGS permitido'), inicio: str('YYYY-MM-DD'), fim: str('YYYY-MM-DD') }, ['codigo'], bcb.serie)
    add('consultarTaxasDisponiveis', 'Lista de taxas BrasilAPI; unidade e data podem estar ausentes. Não usar em cálculos sem confirmar unidade.', { sigla: str('Opcional: nome exato da taxa presente na lista') }, [], brasil.taxas)
    add('consultarCotacaoAcao', 'Preço de ação, FII ou ETF brasileiro. Seleção brapi e HG conforme configuração. Sem garantia de tempo real.', { simbolo: stockArgs.simbolo }, ['simbolo'], a => select('acoes', { brapi: () => brapi.acao(a), hgbrasil: () => hg.cotacao({ ticker: 'B3:' + a.simbolo }) }))
    add('consultarHistoricoAcao', 'Histórico diário B3; até 260 pontos e período de 366 dias. Exige chave/plano brapi.', stockArgs, ['simbolo'], a => brapi.acao({ ...a, recurso: 'historical' }))
    add('consultarDividendos', 'Proventos em dinheiro B3; até 60 eventos. Exige chave/plano brapi.', stockArgs, ['simbolo'], a => brapi.acao({ ...a, recurso: 'dividends' }))
    add('consultarFundamentosEmpresa', 'Indicadores numéricos ou demonstrativos B3. Campos indisponíveis permanecem null. Exige chave/plano brapi.', { simbolo: stockArgs.simbolo, recurso: choice(['statistics', 'financial-data', 'balance-sheet', 'income-statement']) }, ['simbolo', 'recurso'], brapi.acao)
    add('consultarCotacaoMoeda', 'Câmbio de referência diário Frankfurter, incluindo históricos. Não é PTAX nem oferta ao consumidor.', { base: str('ISO, como USD'), destino: str('ISO, como BRL'), data: str('Data opcional YYYY-MM-DD'), inicio: str('Início YYYY-MM-DD, junto de fim'), fim: str('Fim YYYY-MM-DD, máximo 366 dias') }, ['base', 'destino'], fx.cambio)
    add('consultarPTAX', 'Boletim oficial de câmbio por moeda/data. Fallback BrasilAPI preserva conceito de boletim. Pode faltar em feriados.', { moeda: str('ISO, como USD'), data: str('YYYY-MM-DD, obrigatório') }, ['moeda', 'data'], a => select('ptax', { bcb: () => bcb.ptax(a), brasilapi: () => brasil.cambio(a) }))
    add('consultarCriptomoeda', 'Cotação de criptomoeda. brapi preferencial; HG complementar apenas BRL. Depende de chave/plano.', { simbolo: str('BTC, ETH etc.'), moeda: str('ISO da cotação; padrão BRL') }, ['simbolo'], a => select('cripto', { brapi: () => brapi.cripto(a), ...(a.moeda && a.moeda !== 'BRL' ? {} : { hgbrasil: () => hg.cotacao({ ticker: 'CRYPTO:' + a.simbolo + 'BRL' }) }) }))
    add('consultarIndices', 'Índice via HG Brasil, sujeito à chave e plano.', { ticker: choice(['INDEXB3:IBOV', 'INDEXB3:IFIX', 'INDEXNASDAQ:IXIC']) }, ['ticker'], hg.cotacao)
    add('consultarPanoramaMercado', 'Visão geral HG Brasil; não presumir data de atualização igual para todos os campos.', {}, [], hg.panorama)
    add('consultarInstituicaoFinanceira', 'Banco por código COMPE ou lista de instituições, via BrasilAPI.', { codigo: int('Código COMPE opcional, 0 a 999') }, [], brasil.bancos)
    add('consultarCadastrosPublicos', 'Lista parcial de moedas, participantes Pix ou ações B3. Cadastro não é cotação.', { recurso: choice(['moedas', 'pix', 'acoes']) }, ['recurso'], brasil.cadastro)
    add('consultarPrecoVeiculo', 'Fluxo FIPE marcas -> modelos -> anos -> detalhes, ou preço por código FIPE. Não inventar códigos; selecionar resultados reais.', { recurso: choice(['marcas', 'modelos', 'anos', 'detalhes', 'preco']), tipo: choice(['carros', 'motos', 'caminhoes']), codigoFipe: str('NNNNNN-N'), marca: int('Código da marca consultada'), modelo: int('Código do modelo consultado'), ano: str('Código de ano/combustível consultado') }, ['recurso'], brasil.fipe)
    add('consultarModalidadesCredito', 'Descobre códigos reais de modalidades PF/PJ e frequência D/M antes de consultar taxas de empréstimo, financiamento ou cartão.', {}, [], bcb.modalidades)
    add('consultarTaxasEmprestimo', 'Taxas médias por instituição para modalidade descoberta. Não são CET ou oferta garantida. Também atende cartão e financiamentos.', { codigoModalidade: str('Código recebido de consultarModalidadesCredito'), segmento: choice(['1', '2']), mensal: { type: 'boolean', description: 'true apenas para modalidade de tipo M (imobiliário)' } }, ['codigoModalidade'], bcb.credito)
    const investmentArgs = { capital: num('Capital inicial BRL'), taxaPercentual: num('Taxa percentual por período, não fração'), periodos: int('Quantidade de períodos na mesma unidade da taxa'), aporte: num('Aporte ao fim de cada período; padrão zero') }
    add('calcularJurosCompostos', 'Projeção bruta com taxa constante explicitamente conhecida; identifica premissas e aportes.', investmentArgs, ['capital', 'taxaPercentual', 'periodos'], calc.investment)
    add('calcularRentabilidade', 'Retorno simples sobre capital único; inflação opcional do mesmo período.', { capital: num('Capital inicial'), valorFinal: num('Valor final'), inflacaoPercentual: num('Inflação acumulada do mesmo período') }, ['capital', 'valorFinal'], calc.returnRate)
    add('calcularRentabilidadeLiquida', 'Aplicação única: IOF sobre ganho, IR após IOF. Informar alíquotas confirmadas; não inferir tributação.', { capital: num('Capital inicial'), valorFinalBruto: num('Valor final bruto'), aliquotaIRPercentual: num('IR explícito, 0 a 100'), aliquotaIOFPercentual: num('IOF explícito, padrão zero'), custos: num('Custos monetários explícitos') }, ['capital', 'valorFinalBruto', 'aliquotaIRPercentual'], calc.netReturn)
    const loanArgs = { principal: num('Valor financiado'), taxaMensalPercentual: num('Taxa mensal percentual conhecida'), meses: int('Número de parcelas'), custosIniciais: num('Custos pagos à vista') }
    add('simularFinanciamentoPrice', 'Parcelas constantes com taxa mensal fixa. Não calcula CET.', loanArgs, ['principal', 'taxaMensalPercentual', 'meses'], a => calc.financing(a, 'Price'))
    add('simularFinanciamentoSAC', 'Amortização constante e parcelas decrescentes. Não calcula CET.', loanArgs, ['principal', 'taxaMensalPercentual', 'meses'], a => calc.financing(a, 'SAC'))
    add('calcularMetaFinanceira', 'Aporte mensal necessário para meta, sem impostos/custos.', { meta: num('Objetivo BRL'), inicial: num('Valor já disponível'), meses: int('Prazo em meses'), taxaMensalPercentual: num('Taxa mensal conhecida, padrão zero') }, ['meta', 'meses'], calc.goal)
    add('compararInvestimentos', 'Comparação bruta de duas taxas mensais explícitas, sem aportes nem impostos.', { capital: num('Capital inicial'), meses: int('Meses'), taxaMensalAPercentual: num('Taxa mensal A'), taxaMensalBPercentual: num('Taxa mensal B') }, ['capital', 'meses', 'taxaMensalAPercentual', 'taxaMensalBPercentual'], calc.compare)
    add('analisarCustoDeEmprestimo', 'Taxa implícita e custo dos fluxos informados, sem substituir CET contratual.', { valorRecebido: num('Valor recebido'), parcela: num('Parcela mensal fixa'), meses: int('Número de parcelas'), custosIniciais: num('Custos pagos à vista') }, ['valorRecebido', 'parcela', 'meses'], calc.loanCost)
    add('simularInvestimentoCDI', 'Busca CDI diário oficial e projeta taxa constante para dias úteis informados, não usa contagem fictícia de dias úteis. Retorno bruto; IR e IOF somente se explicitamente informados.', { capital: num('Capital BRL'), percentualCDI: num('100 para 100% CDI'), diasUteis: int('Dias úteis de rendimento explicitamente informados'), aliquotaIRPercentual: num('IR confirmado para produto/prazo'), aliquotaIOFPercentual: num('IOF confirmado para prazo') }, ['capital', 'percentualCDI', 'diasUteis'], async a => {
        v.number(a.capital, 'capital', 0, 1e10); v.number(a.percentualCDI, 'percentualCDI', 0, 300); v.integer(a.diasUteis, 'diasUteis', 1, 2520)
        const cdi = await bcb.serie({ codigo: 12 })
        const taxa = cdi.dados.pontos.at(-1).valor
        const bruto = calc.investment({ capital: a.capital, taxaPercentual: taxa * a.percentualCDI / 100, periodos: a.diasUteis })
        return { tipo: 'simulacao_cdi', fonte: cdi.fonte, dataReferencia: cdi.dataReferencia, consultadoEm: cdi.consultadoEm, desatualizado: cdi.desatualizado, dados: { taxaDiariaPercentual: taxa, ...bruto, liquido: a.aliquotaIRPercentual === undefined || a.aliquotaIOFPercentual === undefined ? null : calc.netReturn({ capital: a.capital, valorFinalBruto: bruto.valorFinalBruto, aliquotaIRPercentual: a.aliquotaIRPercentual, aliquotaIOFPercentual: a.aliquotaIOFPercentual }) }, observacoes: ['Último CDI diário repetido em todos os dias úteis: projeção hipotética, não previsão da trajetória do CDI. Não representa taxa de um produto contratado.', 'Retorno líquido indisponível sem alíquotas de IR e IOF confirmadas.'] }
    })
    async function execute(name, args) {
        if (!Object.hasOwn(registry, name)) throw error('FERRAMENTA_NAO_PERMITIDA')
        v.objectArgs(args)
        const schema = registry[name].definition.function.parameters
        if (Object.keys(args).some(key => !Object.hasOwn(schema.properties, key))) throw error('ARGUMENTO_NAO_PERMITIDO')
        for (const key of schema.required) if (!Object.hasOwn(args, key)) throw error('ARGUMENTO_OBRIGATORIO:' + key)
        for (const [key, value] of Object.entries(args)) {
            const field = schema.properties[key]
            if (field.type === 'integer' ? !Number.isInteger(value) : typeof value !== field.type) throw error('TIPO_INVALIDO:' + key)
            if (field.type === 'number' && !Number.isFinite(value)) throw error('TIPO_INVALIDO:' + key)
            if (typeof value === 'string' && value.length > 100) throw error('ARGUMENTO_GRANDE')
            if (field.enum && !field.enum.includes(value)) throw error('VALOR_NAO_PERMITIDO:' + key)
        }
        options.signal?.throwIfAborted()
        return registry[name].execute(args)
    }
    return { definitions: Object.values(registry).map(item => item.definition), execute, stats: client.stats }
}
module.exports = { createRegistry }
