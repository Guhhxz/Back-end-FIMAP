/*
 * PARA QUE SERVE ESTE ARQUIVO
 *
 * Este arquivo faz verificações automáticas da conversa com a IA. A ideia
 * é perceber problemas antes de uma alteração chegar às pessoas que usam
 * o site. Ele usa respostas preparadas para os testes, sem conversar com
 * a IA real e sem consultar contas bancárias.
 *
 * O QUE É VERIFICADO
 * 1. Se o pedido para parar uma resposta também chega ao programa que
 *    estava buscando a resposta.
 * 2. Se o texto continua correto quando chega em vários pedaços.
 * 3. Se a geração é cancelada quando a pessoa fecha a conexão.
 * 4. Se é possível fazer outra pergunta depois de cancelar a anterior.
 * 5. Se a conversa continua quando o modelo envia informações que ainda
 *    não são o texto da resposta para a pessoa.
 * 6. Se a IA funciona sem a página de teste, inclusive para informar que
 *    está ligada e para recusar endereços que não existem.
 * 7. Se o endereço escolhido por padrão é o da IA publicada na nuvem.
 * 8. Se o site entrega o chat sem disponibilizar Pluggy.html na internet.
 *
 * COMO USAR
 * Execute npm test na pasta principal do projeto. O resultado mostra quais
 * verificações passaram e quais encontraram problemas.
 *
 * SE ESTE ARQUIVO FOR APAGADO
 * A IA não depende dele para responder. Porém, estas verificações deixam
 * de ser feitas e o comando de testes pode precisar de ajuste, caso não
 * reste nenhum outro arquivo de teste.
 */

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const service = require('../src/services/publicChatService')

test('serviço propaga abort ao fetch e para o stream', async () => {
  const original = global.fetch
  const abort = new AbortController()
  let receivedSignal
  global.fetch = async (_url, options) => {
    receivedSignal = options.signal
    return new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"response":"Olá"}\n\n'))
        options.signal.addEventListener('abort', () => controller.error(options.signal.reason), { once: true })
      }
    }))
  }
  try {
    await assert.rejects(service.gerarResposta([], () => abort.abort(), abort.signal), { name: 'AbortError' })
    assert.equal(receivedSignal.aborted, true)
  } finally { global.fetch = original }
})

test('serviço preserva conteúdo SSE dividido entre pacotes', async () => {
  const original = global.fetch
  global.fetch = async () => new Response(new ReadableStream({ start(controller) {
    for (const text of ['data: {"res', 'ponse":"Olá"}\n', '\ndata: {"response":" mundo"}\n\ndata: [DONE]\n\n']) controller.enqueue(new TextEncoder().encode(text))
    controller.close()
  } }))
  try { assert.equal(await service.gerarResposta([], () => {}), 'Olá mundo') }
  finally { global.fetch = original }
})

test('controller aborta geração quando navegador desconecta', async () => {
  const geo = require('../src/services/geoapifyPlacesService')
  const oldGeo = geo.respostaLugares
  const oldGenerate = service.gerarResposta
  const res = new EventEmitter()
  Object.assign(res, { status() { return this }, set() { return this }, flushHeaders() {}, write() { throw Error('Não deve escrever após cancelar') }, end() { this.writableEnded = true } })
  geo.respostaLugares = async () => null
  let signal
  service.gerarResposta = async (_messages, _onChunk, supplied) => {
    signal = supplied
    res.destroyed = true
    res.emit('close')
    supplied.throwIfAborted()
  }
  try {
    await require('../src/controller/MensagemChat/PublicChatController').conversarPublicamente({ body: { messages: [{role: 'user', content: 'Oi'}] } }, res)
    assert.equal(signal.aborted, true)
    assert.equal(res.listenerCount('close'), 0)
  } finally { geo.respostaLugares = oldGeo; service.gerarResposta = oldGenerate }
})

test('Worker cancela origem e aceita nova pergunta após cancelamento', async () => {
  const esbuild = require('esbuild')
  const vm = require('node:vm')
  const built = await esbuild.build({ entryPoints: ['src/index.ts'], bundle: true, write: false, format: 'cjs', platform: 'neutral' })
  const context = { module: { exports: {} }, Request, Response, URL, ReadableStream, TextEncoder, TextDecoder, console, Date, Map }
  vm.runInNewContext(built.outputFiles[0].text, context)
  const worker = context.module.exports.default
  let cancelled = false
  const env = { FINANCIAL_TOOLS_ENABLED: 'false', CHAT_RATE_LIMITER: { limit: async () => ({success: true}) }, AI: { run: async () => new ReadableStream({start(c) { c.enqueue(new TextEncoder().encode('data: {"response":"Olá"}\n\n')) }, cancel() { cancelled = true } }) } }
  const request = () => new Request('https://test/v1/ia/chat-publico', {method:'POST', body: JSON.stringify({messages:[{role:'user',content:'Oi'}]}), headers: {'CF-Connecting-IP': 'test'}})
  const response = await worker.fetch(request(), env)
  const reader = response.body.getReader()
  assert.match(new TextDecoder().decode((await reader.read()).value), /Olá/)
  await reader.cancel()
  assert.equal(cancelled, true)
  const next = await worker.fetch(request(), env)
  assert.equal(next.status, 200)
  await next.body.cancel()
})

test('Worker continua lendo eventos de raciocínio até chegar texto visível', { timeout: 3000 }, async () => {
  const esbuild = require('esbuild')
  const vm = require('node:vm')
  const built = await esbuild.build({ entryPoints: ['src/index.ts'], bundle: true, write: false, format: 'cjs', platform: 'neutral' })
  const context = { module: { exports: {} }, Request, Response, URL, ReadableStream, TextEncoder, TextDecoder, console, Date, Map }
  vm.runInNewContext(built.outputFiles[0].text, context)
  const packets = [
    { choices: [{ delta: { reasoning_content: 'intermediário' } }] },
    { choices: [{ delta: { content: 'Olá' } }] }
  ]
  const env = { FINANCIAL_TOOLS_ENABLED: 'false', CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) }, AI: { run: async () => new ReadableStream({ pull(c) {
    if (packets.length) c.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(packets.shift())}\n\n`))
    else c.close()
  } }) } }
  const response = await context.module.exports.default.fetch(new Request('https://test/v1/ia/chat-publico', { method: 'POST', body: JSON.stringify({ messages: [{ role: 'user', content: 'Oi' }] }) }), env)
  let timer
  try {
    const body = await Promise.race([response.text(), new Promise((_, reject) => { timer = setTimeout(() => reject(Error('O streaming parou em um evento sem texto.')), 1000) })])
    assert.match(body, /Olá/)
    assert.match(body, /"tipo":"fim"/)
    assert.doesNotMatch(body, /intermediário/)
  } finally { clearTimeout(timer) }
})

test('Worker da API responde sem binding de frontend', async () => {
  const built = await require('esbuild').build({ entryPoints: ['src/index.ts'], bundle: true, write: false, format: 'cjs', platform: 'neutral' })
  const context = { module: { exports: {} }, Request, Response, URL, ReadableStream, TextEncoder, TextDecoder, console, Date, Map }
  require('node:vm').runInNewContext(built.outputFiles[0].text, context)
  const worker = context.module.exports.default
  const health = await worker.fetch(new Request('https://test/health'), {})
  assert.equal(health.status, 200)
  assert.equal((await health.json()).online, true)
  const page = await worker.fetch(new Request('https://test/'), {})
  assert.equal(page.status, 404)
  assert.match(page.headers.get('Content-Type'), /application\/json/)
})

test('atendimento Node usa a IA publicada por padrão', async () => {
  const originalFetch = global.fetch
  const originalUrl = process.env.CLOUDFLARE_WORKER_URL
  delete process.env.CLOUDFLARE_WORKER_URL
  let requestedUrl
  global.fetch = async (url) => {
    requestedUrl = url
    return new Response('data: {"response":"Olá"}\n\ndata: [DONE]\n\n')
  }
  try {
    assert.equal(await service.gerarResposta([], () => {}), 'Olá')
    assert.equal(requestedUrl, 'https://back-end-fimap.pedroday813.workers.dev/chat')
  } finally {
    global.fetch = originalFetch
    if (originalUrl === undefined) delete process.env.CLOUDFLARE_WORKER_URL
    else process.env.CLOUDFLARE_WORKER_URL = originalUrl
  }
})

test('site na nuvem entrega o chat, mas recusa Pluggy.html', async () => {
  const built = await require('esbuild').build({ entryPoints: ['src/testUiWorker.ts'], bundle: true, write: false, format: 'cjs', platform: 'neutral' })
  const context = { module: { exports: {} }, Request, Response, URL, ReadableStream, TextEncoder, TextDecoder, console, Date, Map }
  require('node:vm').runInNewContext(built.outputFiles[0].text, context)
  const worker = context.module.exports.default
  const env = { FINANCIAL_TOOLS_ENABLED: 'false', ASSETS: { fetch: async () => new Response('Página do chat') } }
  const page = await worker.fetch(new Request('https://test/'), env)
  assert.equal(await page.text(), 'Página do chat')
  const pluggy = await worker.fetch(new Request('https://test/Pluggy.html'), env)
  assert.equal(pluggy.status, 404)
})

test('Worker aceita o prompt FIMAP completo do backend e mantém limites de entrada', async () => {
  const built = await require('esbuild').build({ entryPoints: ['src/index.ts'], bundle: true, write: false, format: 'cjs', platform: 'neutral' })
  const context = { module: { exports: {} }, Request, Response, URL, ReadableStream, TextEncoder, TextDecoder, console, Date, Map }
  require('node:vm').runInNewContext(built.outputFiles[0].text, context)
  const worker = context.module.exports.default
  const systemPrompt = require('../src/ai-system-prompt.js')
  const presentationPrompt = require('../src/ai-presentation-prompt.js')
  const received = []
  const env = { FINANCIAL_TOOLS_ENABLED: 'false',
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    AI: { run: async (_model, options) => {
      received.push(options.messages)
      return new ReadableStream({ start(c) { c.close() } })
    } }
  }
  let requestId = 0
  const send = (messages, path = '/chat') => worker.fetch(new Request(`https://test${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': `prompt-${requestId++}` },
    body: JSON.stringify({ messages })
  }), env)
  assert.ok(systemPrompt.length > 2000)
  for (const prompt of [systemPrompt, systemPrompt + '\n' + presentationPrompt]) {
    const response = await send([{ role: 'system', content: prompt }, { role: 'user', content: 'Oi' }])
    assert.equal(response.status, 200)
    assert.equal(received.at(-1)[0].content, prompt)
    await response.body.cancel()
  }
  for (const [role, content, path] of [
    ['system', 'x'.repeat(2001), '/chat'],
    ['system', systemPrompt + '\nAlteração externa', '/chat'],
    ['user', systemPrompt, '/chat'],
    ['system', systemPrompt, '/v1/ia/chat-publico']
  ]) {
    const response = await send([{ role, content }], path)
    assert.equal(response.status, 400)
  }
  const response = await send([{ role: 'user', content: 'Oi' }], '/v1/ia/chat-publico')
  assert.equal(response.status, 200)
  assert.equal(received.at(-1)[0].content, systemPrompt + '\n' + presentationPrompt)
  await response.body.cancel()
  assert.equal(received.length, 3)
})
