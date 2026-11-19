const { test } = require('node:test')
const assert = require('node:assert/strict')
const { randomUUID, createHash } = require('node:crypto')
const { stack } = require('./helpers/chatStack.js')
const { response } = require('./helpers/chatHarness.js')
const { criarErro } = require('../src/services/chatValidation.js')
const provider = () => ({ calls: 0, obterConfiguracaoPrivada() {}, async gerarResposta(messages, chunk) {
    this.calls++; this.messages = messages; await chunk('Resposta 🌎'); return 'Resposta 🌎'
} })
const req = (body = {}, params = {}) => ({ usuario: { id: 3 }, body, params, query: {} })
const send = (s, uuid = randomUUID(), chat = 7, user = 3, text = 'Olá') =>
    s.service.gerar(user, chat, uuid, text, async () => {})

// Os testes usam consultas SQL reais. Duas instâncias de serviço compartilham o mesmo banco.
test('histórico próprio, vazio, cronologia estável e ausência de limite silencioso', async () => {
    const s = stack()
    assert.deepEqual(Array.from(await s.dao.listarMensagensChat(7, 3)), [])
    for (let id = 1; id <= 105; id++) await s.db('tbl_mensagem').insert({ id, id_chat: 7, papel: id % 2 ? 1 : 2,
        conteudo: 'Mensagem ' + id, data_envio: id === 1 ? '2026-02-01' : '2026-01-01' })
    const res = response()
    await s.controller.listarMensagensChat(req({}, { id_chat: '7' }), res)
    assert.equal(res.statusCode, 200)
    assert.equal(res.body.conteudo.length, 105)
    assert.equal(res.body.conteudo[0].id, 2)
    assert.equal(res.body.conteudo.at(-1).id, 1)
    assert.equal(res.body.conteudo[0].papel, 1)
    assert.equal(res.body.conteudo.at(-1).papel, 0)
})

test('banco indisponível não é interpretado como histórico vazio', async () => {
    const s = stack(), res = response()
    s.state.failRead = true
    await s.controller.listarMensagensChat(req({}, { id_chat: '7' }), res)
    assert.equal(res.statusCode, 500)
    assert.equal(res.body.codigo, 'CHAT_BANCO')
    assert.equal(res.body.conteudo, undefined)
})

test('isolamento de chats e mensagens, mutações e IDs de usuário enviados pelo cliente', async () => {
    const s = stack(provider())
    assert.equal(await s.chat.GetChatById(8, 3), null)
    assert.equal(await s.chat.UpdateChatName(8, 'Ataque', 3), false)
    assert.equal(await s.chat.apagarChat(8, 3), false)
    assert.equal(await s.dao.listarMensagensChat(8, 3), null)
    await assert.rejects(send(s, randomUUID(), 8), { statusCode: 404 })
    for (const method of ['ListaPorId', 'AtualizarNomeChat', 'ApagarChat']) {
        const res = response()
        await s.chatController[method](req({ nome: 'Ataque', id_usuario: 4 }, { id_chat: '8' }), res)
        assert.equal(res.statusCode, 404)
    }
    let res = response()
    await s.chatController.CriarChat(req({ nome: 'Nova', id_usuario: 4 }), res)
    assert.equal(res.statusCode, 201)
    const novo = s.state.chats.find((c) => c.id === res.body.id)
    assert.equal(novo.id_usuario, 3)
    res = response()
    await s.chatController.ListarChatsPorUsuario(req(), res)
    assert.ok(res.body.conteudo.every((c) => c.id_usuario === 3))
    res = response()
    await s.chatController.AtualizarNomeChat(req({ nome: 'Renomeado' }, { id_chat: String(novo.id) }), res)
    assert.equal(res.statusCode, 200)
    assert.equal(s.state.chats.find((c) => c.id === novo.id).nome, 'Renomeado')
    res = response()
    await s.chatController.ApagarChat(req({}, { id_chat: String(novo.id) }), res)
    assert.equal(res.statusCode, 200)
})

test('idempotência durável recupera commit sem fim, sem inferir ou gravar novamente', async () => {
    const ia = provider(), s = stack(ia), uuid = randomUUID()
    const r = await send(s, uuid)
    const outraInstancia = stack(ia, s)
    const consulta = await outraInstancia.service.consultar(3, uuid)
    assert.equal(consulta.estado, 'concluida')
    assert.equal(consulta.resultado.mensagem_assistente.id, r.mensagem_assistente.id)
    const replay = await send(outraInstancia, uuid)
    assert.equal(replay.recuperada, true)
    assert.equal(ia.calls, 1)
    assert.equal(s.state.messages.length, 2)
    assert.equal(s.state.requests.length, 1)
    await assert.rejects(send(s, uuid, 7, 3, 'Outro texto'), { code: 'REQUISICAO_CONFLITO' })
    await assert.rejects(send(s, uuid, 9), { code: 'REQUISICAO_CONFLITO' })
    await assert.rejects(s.service.consultar(4, uuid), { statusCode: 404 })
    await assert.rejects(s.service.cancelar(4, uuid), { statusCode: 404 })
    await assert.rejects(s.service.consultar(3, randomUUID()), { statusCode: 404 })
    assert.equal((await s.service.cancelar(3, uuid)).estado, 'concluida')
})

test('duas instâncias reservam uma única geração por conversa e identificam repetição ativa', async () => {
    let release, ready
    const started = new Promise((r) => { ready = r })
    const ia = provider()
    ia.gerarResposta = async () => { ia.calls++; ready(); return new Promise((r) => { release = r }) }
    const s = stack(ia), uuid = randomUUID(), other = stack(ia, s)
    const first = send(s, uuid)
    await started
    await assert.rejects(send(other, uuid), { code: 'REQUISICAO_EM_ANDAMENTO' })
    await assert.rejects(send(other), { code: 'CHAT_EM_ANDAMENTO' })
    assert.equal((await other.service.consultar(3, uuid)).estado, 'gerando')
    release('Resposta')
    await first
    assert.equal(ia.calls, 1)
    s.state.now += 5001
    ia.gerarResposta = provider().gerarResposta
    await send(other)
    assert.equal(s.state.messages.length, 4)
})

test('pergunta e resposta são atômicas; falha na segunda gravação não envia fim', async () => {
    const s = stack(provider()), res = response(), uuid = randomUUID()
    s.state.failMessageInsert = 2
    await s.controller.enviarMensagemChat(req({ id_chat: 7, pergunta: 'Olá', requisicao_id: uuid }), res)
    assert.equal(res.events().at(-1).tipo, 'erro')
    assert.ok(!res.events().some((e) => e.tipo === 'fim'))
    assert.equal(s.state.messages.length, 0)
    assert.equal((await s.service.consultar(3, uuid)).estado, 'falhou')
    await assert.rejects(send(s, uuid), { code: 'CHAT_BANCO' })
})

test('fim é emitido depois do commit e contém IDs recuperáveis', async () => {
    const s = stack(provider()), res = response(), uuid = randomUUID()
    const write = res.write
    res.write = function (text) {
        if (text.includes('"tipo":"fim"')) {
            assert.equal(s.state.messages.length, 2)
            assert.equal(s.state.requests[0].estado, 'concluida')
            assert.ok(s.state.queries.includes('COMMIT;'))
        }
        return write.call(this, text)
    }
    await s.controller.enviarMensagemChat(req({ id_chat: 7, pergunta: 'Olá', requisicao_id: uuid }), res)
    const fim = res.events().at(-1)
    assert.equal(fim.tipo, 'fim')
    assert.equal(fim.requisicao_id, uuid)
    assert.equal(fim.id_chat, 7)
    assert.equal(res.listenerCount('close'), 0)
})

test('contexto usa até cinco pares completos, preserva legado e ignora perguntas órfãs', async () => {
    const ia = provider(), s = stack(ia)
    for (let id = 0; id < 7; id++) {
        await s.db('tbl_mensagem').insert({ id_chat: 7, papel: 1, conteudo: 'Pergunta ' + id, data_envio: '2026-01-01' })
        await s.db('tbl_mensagem').insert({ id_chat: 7, papel: 2, conteudo: 'Resposta ' + id, data_envio: '2026-01-01' })
    }
    await s.db('tbl_mensagem').insert({ id_chat: 7, papel: 1, conteudo: 'Órfã', data_envio: '2026-01-01' })
    await send(s)
    assert.equal(ia.messages.length, 11)
    assert.equal(ia.messages[0].content, 'Pergunta 2')
    assert.equal(ia.messages.at(-1).content, 'Olá')
    assert.ok(!ia.messages.some((m) => m.content === 'Órfã'))
})

test('contexto fora dos limites do Worker é rejeitado sem inferência', async () => {
    const ia = provider(), s = stack(ia)
    await s.db('tbl_mensagem').insert({ id_chat: 7, papel: 1, conteudo: 'Olá', data_envio: '2026-01-01' })
    await s.db('tbl_mensagem').insert({ id_chat: 7, papel: 2, conteudo: 'x'.repeat(16001), data_envio: '2026-01-01' })
    await assert.rejects(send(s), { code: 'IA_ENTRADA_INVALIDA' })
    assert.equal(ia.calls, 0)
})

test('erros antes/depois do primeiro trecho não concluem e liberam a reserva', async () => {
    for (const parcial of [false, true]) {
        const ia = provider(), s = stack(ia), res = response(), uuid = randomUUID()
        ia.gerarResposta = async (_messages, chunk) => {
            if (parcial) await chunk('Parcial')
            throw criarErro(502, 'Fluxo interrompido.', 'IA_FLUXO_INTERROMPIDO')
        }
        await s.controller.enviarMensagemChat(req({ id_chat: 7, pergunta: 'Olá', requisicao_id: uuid }), res)
        if (parcial) assert.equal(res.events().at(-1).codigo, 'IA_FLUXO_INTERROMPIDO')
        else { assert.equal(res.statusCode, 502); assert.equal(res.body.codigo, 'IA_FLUXO_INTERROMPIDO') }
        assert.equal(s.state.messages.length, 0)
        assert.equal(s.state.requests[0].chat_ativo, null)
        assert.equal(s.state.requests[0].estado, 'falhou')
    }
})

test('desconexão cancela Worker, não salva par incompleto e limpa listeners', async () => {
    const res = response(), ia = provider(), s = stack(ia)
    let received
    ia.gerarResposta = async (_m, chunk, signal) => {
        received = signal
        await chunk('Parcial')
        res.destroyed = true; res.emit('close'); signal.throwIfAborted()
    }
    await s.controller.enviarMensagemChat(req({ id_chat: 7, pergunta: 'Olá' }), res)
    assert.equal(received.aborted, true)
    assert.equal(s.state.requests[0].estado, 'cancelada')
    assert.equal(s.state.messages.length, 0)
    assert.equal(res.listenerCount('close'), 0)
})

test('cancelamento durável entre instâncias aborta o sinal e impede commit', async () => {
    const ia = provider(), s = stack(ia), other = stack(ia, s), uuid = randomUUID()
    let ready
    const started = new Promise((r) => { ready = r })
    ia.gerarResposta = async (_m, _chunk, signal) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true }); ready()
    })
    const generation = send(s, uuid)
    const rejection = assert.rejects(generation, { code: 'REQUISICAO_CANCELADA' })
    await started
    assert.equal((await other.service.cancelar(3, uuid)).estado, 'cancelada')
    await rejection
    assert.equal(s.state.messages.length, 0)
})

test('lease abandonado expira, não repete inferência e impede commit atrasado', async () => {
    const ia = provider(), s = stack(ia), uuid = randomUUID()
    const r = (await s.requests.reservar({ id_usuario: 3, id_chat: 7, requisicao_id: uuid,
        hash_pedido: createHash('sha256').update(JSON.stringify({ chat: 7, pergunta: 'Olá' })).digest('hex'),
        pergunta: 'Olá', dono_lease: randomUUID() })).requisicao
    s.state.now += 150001
    assert.equal((await s.service.consultar(3, uuid)).estado, 'expirada')
    await assert.rejects(s.requests.concluir(r, 'Resposta atrasada'), { statusCode: 409 })
    await assert.rejects(send(s, uuid), { code: 'REQUISICAO_EXPIRADA' })
    assert.equal(ia.calls, 0)
    assert.equal(s.state.messages.length, 0)
    await send(s)
    assert.equal(s.state.requests.length, 2)
})

test('timeout fica registrado e não autoriza repetição automática da solicitação', async () => {
    const s = stack(provider()), uuid = randomUUID()
    const timeout = AbortSignal.timeout
    AbortSignal.timeout = () => AbortSignal.abort(new DOMException('Timeout', 'TimeoutError'))
    try { await assert.rejects(send(s, uuid), { code: 'IA_TIMEOUT', statusCode: 504 }) }
    finally { AbortSignal.timeout = timeout }
    assert.equal((await s.service.consultar(3, uuid)).estado, 'falhou')
    await assert.rejects(send(s, uuid), { code: 'IA_TIMEOUT' })
    assert.equal(s.state.messages.length, 0)
})

test('limites duráveis por usuário, por conversa e por concorrência entre conversas', async () => {
    const s = stack(provider())
    await send(s)
    await assert.rejects(send(s), { code: 'CHAT_LIMITE_CONVERSA', retryAfter: '5' })
    await send(s, randomUUID(), 8, 4)
    // Limite de 12/min: sem depender do IP nem de contadores em memória.
    for (let id = 20; id < 31; id++) {
        await s.db('tbl_chat').insert({ id, nome: 'Chat', id_usuario: 3, data_criacao: '2026-01-01' })
        await send(s, randomUUID(), id)
    }
    await assert.rejects(send(s, randomUUID(), 9), { code: 'CHAT_LIMITE_USUARIO', retryAfter: '60' })
    s.state.now += 60001
    for (const id of [7, 9]) await s.requests.reservar({ id_usuario: 3, id_chat: id, requisicao_id: randomUUID(),
        hash_pedido: 'hash', pergunta: 'Olá', dono_lease: randomUUID() })
    await assert.rejects(send(s, randomUUID(), 10), { code: 'CHAT_LIMITE_USUARIO' })
})

test('controller valida IDs e corpo antes de abrir SSE', async () => {
    const s = stack(provider())
    for (const [body, status] of [[{ id_chat: 7, pergunta: '' }, 400], [{ id_chat: true, pergunta: 'Olá' }, 400],
        [{ id_chat: 7, pergunta: 'x'.repeat(2001) }, 400], [{ id_chat: 999, pergunta: 'Olá' }, 404],
        [{ id_chat: 7, pergunta: 'Olá', requisicao_id: 'inválido' }, 400]]) {
        const res = response()
        await s.controller.enviarMensagemChat(req(body), res)
        assert.equal(res.statusCode, status)
        assert.equal(res.flushed, undefined)
    }
})
