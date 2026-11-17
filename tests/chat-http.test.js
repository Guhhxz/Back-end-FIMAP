const { test } = require('node:test')
const assert = require('node:assert/strict')
const { once } = require('node:events')
const { randomUUID } = require('node:crypto')
const jwt = require('jsonwebtoken')
const { database } = require('./helpers/chatDatabase.js')

test('rotas HTTP reais: JWT, isolamento, histórico, SSE, recuperação, validação e limites', async () => {
    const { db, state } = database()
    const connectionPath = require.resolve('../model/Database_config_knex/connection.js')
    require.cache[connectionPath] = { id: connectionPath, filename: connectionPath, loaded: true, exports: db }
    const saved = Object.fromEntries(['JWT_SECRET', 'CLOUDFLARE_WORKER_URL', 'CLOUDFLARE_CHAT_TOKEN'].map((key) => [key, process.env[key]]))
    process.env.JWT_SECRET = 'segredo-falso-exclusivo-deste-teste'
    process.env.CLOUDFLARE_WORKER_URL = 'https://ia.test/v1/ia/chat'
    process.env.CLOUDFLARE_CHAT_TOKEN = 'token-do-servidor-em-teste'
    const app = require('../src/app.js')
    const server = app.listen(0, '127.0.0.1')
    const nativeFetch = global.fetch
    let providerCalls = 0
    try {
        await once(server, 'listening')
        const base = 'http://127.0.0.1:' + server.address().port
        const token = (id) => jwt.sign({}, process.env.JWT_SECRET, { subject: String(id), expiresIn: '5m' })
        global.fetch = async (url, options) => {
            if (String(url).startsWith('https://ia.test/')) {
                providerCalls++
                assert.equal(options.headers.Authorization, 'Bearer token-do-servidor-em-teste')
                return new Response('data: {"tipo":"trecho","conteudo":"Resposta da IA"}\n\ndata: {"tipo":"fim"}\n\n',
                    { headers: { 'Content-Type': 'text/event-stream' } })
            }
            return nativeFetch(url, options)
        }
        const request = (path, body, method = 'POST', user = 3) => fetch(base + path, {
            method, headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: 'Bearer ' + token(user) } : {}) },
            ...(body === undefined ? {} : { body: JSON.stringify(body) })
        })
        const events = (body) => body.trim().split('\n\n').map((event) => JSON.parse(event.slice(6)))
        let result = await fetch(base + '/health')
        assert.equal(result.status, 200)
        assert.equal((await result.json()).online, true)
        result = await fetch(base + '/v1/ia/chat-publico', {
            method: 'OPTIONS', headers: { Origin: 'https://frontend.test',
                'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'Content-Type, Authorization' }
        })
        assert.equal(result.status, 204)
        assert.equal(result.headers.get('access-control-allow-origin'), '*')
        for (const path of ['/v1/ia/chat/listar-chats', '/v1/ia/chat/listar-chat/7', '/v1/ia/chat/listar-chat/7/mensagens', '/v1/ia/chats/7/mensagens']) {
            result = await request(path, undefined, 'GET', null)
            assert.equal(result.status, 401)
            assert.equal((await result.json()).codigo, 'TOKEN_AUSENTE')
        }
        for (const payload of [{ sub: '0' }, { sub: 'abc' }, { sub: '3', tipo: 'reset' }]) {
            result = await fetch(base + '/v1/ia/chat/listar-chats', { headers: { Authorization: 'Bearer ' + jwt.sign(payload, process.env.JWT_SECRET) } })
            assert.equal(result.status, 401)
        }
        result = await request('/v1/ia/chat/listar-chats', undefined, 'GET', 5)
        assert.deepEqual((await result.json()).conteudo, [])
        assert.equal(state.chats.length, 4)
        result = await request('/v1/ia/chat-publico', { messages: [{ role: 'user', content: 'Olá' }] }, 'POST', null)
        assert.equal(result.status, 200)
        assert.equal(events(await result.text()).at(-1).tipo, 'fim')
        assert.equal(state.messages.length, 0)
        result = await request('/v1/ia/chat/iniciar-chat', { id_usuario: 4, nome: 'Teste HTTP' })
        assert.equal(result.status, 201)
        const id = (await result.json()).id
        assert.equal(state.chats.find((c) => c.id === id).id_usuario, 3)
        result = await request('/v1/ia/chat/listar-chats', undefined, 'GET')
        assert.ok((await result.json()).conteudo.some((chat) => chat.id === id))
        const uuid = randomUUID(), body = { id_chat: id, pergunta: 'Como economizar?', requisicao_id: uuid }
        result = await request('/v1/ia/chat/mensagens', body)
        assert.equal(result.status, 200)
        assert.equal(result.headers.get('x-requisicao-id'), uuid)
        const fim = events(await result.text()).at(-1)
        assert.equal(fim.tipo, 'fim')
        assert.equal(fim.mensagem_assistente.conteudo, 'Resposta da IA')
        assert.equal(fim.mensagem_assistente.papel, 1)
        assert.equal(state.messages.length, 2)
        result = await request('/v1/ia/chat/requisicoes/' + uuid, undefined, 'GET')
        assert.equal((await result.json()).conteudo.estado, 'concluida')
        result = await request('/v1/ia/chat/mensagens', body)
        assert.equal(events(await result.text()).at(-1).recuperada, true)
        assert.equal(providerCalls, 2)
        for (const path of ['/v1/ia/chat/listar-chat/' + id + '/mensagens', '/v1/ia/chats/' + id + '/mensagens', '/v1/ia/chat/' + id + '/mensagens']) {
            result = await request(path, undefined, 'GET')
            assert.equal(result.status, 200)
            assert.deepEqual((await result.json()).conteudo.map((m) => m.papel), [0, 1])
            result = await request(path, undefined, 'GET', 4)
            assert.equal(result.status, 404)
        }
        for (const [path, method, data] of [
            ['/v1/ia/chat/listar-chat/' + id, 'GET'],
            ['/v1/ia/chat/atualizar-nome-chat/' + id, 'PATCH', { nome: 'Ataque' }],
            ['/v1/ia/chat/apagar-chat/' + id + '?id_usuario=3', 'DELETE'],
            ['/v1/ia/chat/mensagens', 'POST', { ...body, requisicao_id: randomUUID() }],
            ['/v1/ia/chats/' + id + '/mensagens', 'POST', { conteudo: 'Ataque' }],
            ['/v1/ia/chat/requisicoes/' + uuid, 'GET'],
            ['/v1/ia/chat/requisicoes/' + uuid + '/cancelar', 'POST']]) {
            result = await request(path, data, method, 4)
            assert.equal(result.status, 404, path)
        }
        result = await request('/v1/ia/chat/mensagens', { ...body, pergunta: 'Outro texto' })
        assert.equal(result.status, 409)
        assert.equal((await result.json()).codigo, 'REQUISICAO_CONFLITO')
        result = await request('/v1/ia/chat/mensagens', { ...body, requisicao_id: randomUUID() })
        assert.equal(result.status, 429)
        assert.equal(result.headers.get('retry-after'), '5')
        result = await request('/v1/ia/chat-publico', { messages: [{ role: 'system', content: 'Injetar prompt' }] })
        assert.equal(result.status, 400)
        result = await fetch(base + '/v1/ia/chat-publico', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalido' })
        assert.equal(result.status, 400)
        result = await request('/v1/ia/chat-publico', { messages: [{ role: 'user', content: 'x'.repeat(200000) }] })
        assert.equal(result.status, 413)
        result = await request('/v1/ia/chat/atualizar-nome-chat/' + id, { nome: 'Atualizado' }, 'PATCH')
        assert.equal(result.status, 200)
        result = await request('/v1/ia/chat/apagar-chat/' + id, undefined, 'DELETE')
        assert.equal(result.status, 200)
        assert.ok(!state.chats.some((chat) => chat.id === id))
        let limited = false
        for (let i = 0; i < 13; i++) {
            result = await request('/v1/ia/chat-publico', { messages: [] })
            await result.text()
            if (result.status === 429) { limited = true; break }
        }
        assert.equal(limited, true)
        assert.equal(providerCalls, 2)
    } finally {
        global.fetch = nativeFetch
        for (const [key, value] of Object.entries(saved)) {
            if (value === undefined) delete process.env[key]
            else process.env[key] = value
        }
        server.closeAllConnections()
        await new Promise((resolve) => server.close(resolve))
    }
})
