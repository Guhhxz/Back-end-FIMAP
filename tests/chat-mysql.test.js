// Opt-in: usa SOMENTE um schema temporário criado pelo próprio teste.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const knex = require('knex')
const { load } = require('./helpers/chatHarness.js')
const migration = require('../db/migrations/202611170001_chat_requisicoes.js')

test('MySQL/InnoDB: migração, duas conexões, constraints, fencing e rollback real', {
    skip: !process.env.CHAT_TEST_MYSQL_URL && 'Defina CHAT_TEST_MYSQL_URL para um servidor MySQL descartável.'
}, async () => {
    const mysql = require('mysql2/promise')
    const url = new URL(process.env.CHAT_TEST_MYSQL_URL)
    const connection = { host: url.hostname, port: Number(url.port || 3306), user: decodeURIComponent(url.username), password: decodeURIComponent(url.password) }
    const admin = await mysql.createConnection(connection)
    const schema = 'fimap_chat_test_' + randomUUID().replaceAll('-', '')
    let db, other
    try {
        await admin.query('CREATE DATABASE `' + schema + '` CHARACTER SET utf8mb4')
        db = knex({ client: 'mysql2', connection: { ...connection, database: schema } })
        other = knex({ client: 'mysql2', connection: { ...connection, database: schema } })
        await db.raw('CREATE TABLE tbl_usuario(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY) ENGINE=InnoDB')
        await db.raw('CREATE TABLE tbl_chat(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, id_usuario INT NOT NULL, FOREIGN KEY(id_usuario) REFERENCES tbl_usuario(id)) ENGINE=InnoDB')
        await db.schema.createTable('tbl_mensagem', (t) => { t.engine('InnoDB'); t.increments('id'); t.integer('id_chat'); t.text('conteudo'); t.integer('papel'); t.dateTime('data_envio') })
        await migration.up(db)
        await db('tbl_usuario').insert([{ id: 3 }, { id: 4 }])
        await db('tbl_chat').insert([{ id: 7, id_usuario: 3 }, { id: 8, id_usuario: 4 }])
        const dao = (pool) => load('model/DAO/MensagemChat/RequisicaoChatDAO.js', { '../../Database_config_knex/connection.js': pool })
        const a = dao(db), b = dao(other)
        const pedido = { id_usuario: 3, id_chat: 7, requisicao_id: randomUUID(), hash_pedido: 'hash', pergunta: 'Olá', dono_lease: randomUUID() }
        const [r1, r2] = await Promise.all([a.reservar(pedido), b.reservar({ ...pedido, dono_lease: randomUUID() })])
        assert.equal([r1, r2].filter((r) => r.nova).length, 1)
        const r = (r1.nova ? r1 : r2).requisicao
        await assert.rejects(b.reservar({ ...pedido, requisicao_id: randomUUID() }), { code: 'CHAT_EM_ANDAMENTO' })
        await assert.rejects(db('tbl_chat_requisicao').insert({ ...pedido, requisicao_id: randomUUID(), estado: 'gerando', chat_ativo: 7, lease_ate_ms: Date.now() + 150000, criada_ms: Date.now() }), { code: 'ER_DUP_ENTRY' })
        await assert.rejects(db('tbl_chat_requisicao').insert({ ...pedido, estado: 'falhou', lease_ate_ms: Date.now(), criada_ms: Date.now() }), { code: 'ER_DUP_ENTRY' })
        await db.raw("CREATE TRIGGER falhar_resposta BEFORE INSERT ON tbl_mensagem FOR EACH ROW BEGIN IF NEW.papel = 2 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'falha controlada'; END IF; END")
        await assert.rejects(a.concluir(r, 'Resposta'))
        assert.equal(Number((await db('tbl_mensagem').count('* as total'))[0].total), 0)
        assert.equal((await a.consultar(3, pedido.requisicao_id)).estado, 'gerando')
        await db.raw('DROP TRIGGER falhar_resposta')
        const concluida = await b.concluir(r, 'Resposta')
        assert.equal(concluida.estado, 'concluida')
        assert.equal((await a.resultado(concluida)).mensagem_assistente.conteudo, 'Resposta')
        assert.equal((await a.reservar(pedido)).nova, false)
        await assert.rejects(a.consultar(4, pedido.requisicao_id), { statusCode: 404 })
        // Processo abandonado e lease vencido; nunca autoriza o dono antigo a confirmar.
        await db('tbl_chat_requisicao').where('id', r.id).update({ criada_ms: Date.now() - 10000 })
        const abandonada = (await b.reservar({ ...pedido, requisicao_id: randomUUID() })).requisicao
        await db('tbl_chat_requisicao').where('id', abandonada.id).update({ lease_ate_ms: 0 })
        assert.equal((await a.consultar(3, abandonada.requisicao_id)).estado, 'expirada')
        await assert.rejects(b.concluir(abandonada, 'Tardia'), { statusCode: 409 })
    } finally {
        if (db) await db.destroy()
        if (other) await other.destroy()
        await admin.query('DROP DATABASE IF EXISTS `' + schema + '`')
        await admin.end()
    }
})
