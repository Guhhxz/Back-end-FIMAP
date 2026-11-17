/*
 * PARA QUE SERVE: Cria peças de mentirinha, como banco e resposta HTTP, para usar nos testes.
 * QUANDO ENTRA EM AÇÃO: Entra quando os testes precisam verificar um DAO ou controller isoladamente.
 * QUANDO FAZ DIFERENÇA: Faz diferença para testar sem gravar no MySQL real nem consultar a IA real.
 */

const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const { EventEmitter } = require('node:events')

// Carrega o arquivo trocando dependências reais pelas peças simuladas escolhidas pelo teste.
const load = (file, mocks = {}) => {
    const absolute = path.resolve(__dirname, '../..', file)
    const localRequire = createRequire(absolute)
    const module = { exports: {} }
    vm.runInNewContext(fs.readFileSync(absolute, 'utf8'), {
        module, exports: module.exports,
        require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : localRequire(name),
        console: { error() {}, log() {} }, AbortController, AbortSignal, Date, Set, Map, setTimeout, clearTimeout
    }, { filename: absolute })
    return module.exports
}

// Guarda registros só na memória; tudo desaparece quando o teste termina.
const database = () => {
    const state = { chats: [{ id: 7, nome: 'Orçamento', id_usuario: 3, data_criacao: new Date() }], messages: [], queries: [] }
    const db = (table) => {
        if (table !== 'tbl_mensagem') throw Error('Tabela inesperada: ' + table)
        const predicates = []
        let direction = 'asc', maximum = Infinity
        const query = {
            select() { return this },
            where(field, operator, value) {
                if (value === undefined) { value = operator; operator = '=' }
                predicates.push((row) => operator === '<' ? row[field] < value : row[field] === value)
                return this
            },
            orderBy(_field, order) { direction = order; return this },
            limit(value) { maximum = value; return this },
            async insert(row) {
                const id = Math.max(0, ...state.messages.map((item) => item.id)) + 1
                state.messages.push({ ...row, id })
                return [id]
            },
            then(resolve, reject) {
                const rows = state.messages.filter((row) => predicates.every((predicate) => predicate(row)))
                    .sort((a, b) => direction === 'desc' ? b.id - a.id : a.id - b.id).slice(0, maximum)
                    .map((row) => ({ ...row }))
                return Promise.resolve(rows).then(resolve, reject)
            }
        }
        return query
    }
    db.raw = async (sql, values) => {
        state.queries.push({ sql, values })
        if (sql.startsWith('select')) {
            const rows = state.chats.filter((row) => sql.includes('where id_usuario') ? row.id_usuario === values[0] : row.id === values[0])
            return [rows.map((row) => {
                const copy = { ...row }
                if (!/^select id,/.test(sql)) delete copy.id
                return copy
            })]
        }
        if (sql.startsWith('insert')) {
            const id = Math.max(0, ...state.chats.map((item) => item.id)) + 1
            state.chats.push({ id, nome: values[0], id_usuario: values[1], data_criacao: new Date() })
            return [{ insertId: id }]
        }
        if (sql.startsWith('delete')) {
            const index = state.chats.findIndex((row) => row.id === values[0] && row.id_usuario === values[1])
            if (index >= 0) state.chats.splice(index, 1)
            return [{ affectedRows: index >= 0 ? 1 : 0 }]
        }
        if (sql.startsWith('update')) {
            const row = state.chats.find((item) => item.id === values[1])
            if (row) row.nome = values[0]
            return [{ affectedRows: row ? 1 : 0 }]
        }
        throw Error('SQL inesperado')
    }
    return { db, state }
}

const response = () => Object.assign(new EventEmitter(), {
    statusCode: 200, headers: {}, chunks: [], writableEnded: false, destroyed: false,
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; this.writableEnded = true; return this },
    set(headers) { Object.assign(this.headers, headers); return this },
    flushHeaders() { this.flushed = true },
    write(chunk) { this.chunks.push(chunk); return true },
    end() { this.writableEnded = true },
    events() { return this.chunks.flatMap((chunk) => chunk.trim().split('\n\n')).map((chunk) => JSON.parse(chunk.slice(6))) }
})
const sse = (body) => new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })

module.exports = { load, database, response, sse }
