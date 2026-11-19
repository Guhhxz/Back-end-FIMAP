// SQL real e transações SQLite isoladas, com o compilador MySQL do Knex.
// Não simula locks InnoDB: a prova desses locks é o teste MySQL opcional.
const { DatabaseSync } = require('node:sqlite')
const knex = require('knex')
const database = () => {
    const sqlite = new DatabaseSync(':memory:')
    sqlite.exec(`PRAGMA foreign_keys=ON;
        CREATE TABLE tbl_usuario(id INTEGER PRIMARY KEY);
        CREATE TABLE tbl_chat(id INTEGER PRIMARY KEY, nome TEXT, data_criacao TEXT, id_usuario INTEGER REFERENCES tbl_usuario(id));
        CREATE TABLE tbl_mensagem(id INTEGER PRIMARY KEY, conteudo TEXT NOT NULL, data_envio TEXT, papel INTEGER, id_chat INTEGER REFERENCES tbl_chat(id) ON DELETE CASCADE);
        CREATE TABLE tbl_chat_requisicao(id INTEGER PRIMARY KEY, id_usuario INTEGER REFERENCES tbl_usuario(id), id_chat INTEGER REFERENCES tbl_chat(id) ON DELETE CASCADE,
            requisicao_id TEXT, hash_pedido TEXT, pergunta TEXT, estado TEXT, chat_ativo INTEGER UNIQUE,
            dono_lease TEXT, lease_ate_ms INTEGER, criada_ms INTEGER, id_mensagem_usuario INTEGER, id_mensagem_assistente INTEGER,
            codigo_erro TEXT, status_erro INTEGER, retry_after TEXT, UNIQUE(id_usuario,requisicao_id));
        INSERT INTO tbl_usuario VALUES(3),(4);
        INSERT INTO tbl_chat VALUES(7,'Orçamento','2026-01-01',3),(8,'Outro usuário','2026-01-01',4),(9,'Outra conversa','2026-01-01',3),(10,'Terceira conversa','2026-01-01',3);`)
    const state = { now: Date.now(), queries: [], failMessageInsert: 0, inserts: 0, failRead: false }
    const db = knex({ client: 'mysql2' })
    const conn = { __knexUid: 'test' }
    db.client.acquireConnection = async () => conn
    db.client.releaseConnection = async () => {}
    conn.query = (q, values, callback) => {
      try {
        state.queries.push(q.sql)
        let sql = q.sql.replace(/ for update$/i, '').replace(/now\(\)/gi, 'CURRENT_TIMESTAMP')
        const bindings = (values || []).map((v) => v instanceof Date ? v.toISOString() : v)
        let rows
        if (sql.includes('as agora_ms')) rows = [{ agora_ms: state.now }]
        else if (/^(BEGIN|COMMIT|ROLLBACK)/i.test(sql)) { sqlite.exec(sql); rows = [] }
        else if (/^select/i.test(sql)) {
            if (state.failRead) throw Error('Banco indisponível')
            rows = sqlite.prepare(sql).all(...bindings)
        } else {
            if (/insert into `tbl_mensagem`/i.test(sql) && ++state.inserts === state.failMessageInsert) throw Error('Falha ao gravar resposta')
            const info = sqlite.prepare(sql).run(...bindings)
            rows = { insertId: Number(info.lastInsertRowid), affectedRows: Number(info.changes) }
        }
        callback(null, rows, [])
      } catch (error) { callback(error) }
    }
    // Uma conexão SQLite; serializa transações do teste, sem alegar simular locks por linha.
    const transaction = db.transaction.bind(db)
    let fila = Promise.resolve()
    db.transaction = (callback) => {
        const run = fila.then(() => transaction(callback))
        fila = run.catch(() => {})
        return run
    }
    Object.defineProperties(state, {
        chats: { get: () => sqlite.prepare('select * from tbl_chat').all() },
        messages: { get: () => sqlite.prepare('select * from tbl_mensagem').all() },
        requests: { get: () => sqlite.prepare('select * from tbl_chat_requisicao').all() }
    })
    return { db, state, sqlite }
}
module.exports = { database }
