// Extensão aditiva: não altera papéis nem apaga o histórico existente.
exports.up = async (knex) => {
    await knex.schema.createTable('tbl_chat_requisicao', (t) => {
        t.engine('InnoDB')
        t.bigIncrements('id')
        t.integer('id_usuario').notNullable().references('id').inTable('tbl_usuario').onDelete('CASCADE')
        t.integer('id_chat').notNullable().references('id').inTable('tbl_chat').onDelete('CASCADE')
        t.string('requisicao_id', 36).notNullable()
        t.string('hash_pedido', 64).notNullable()
        t.text('pergunta').notNullable()
        t.enu('estado', ['gerando', 'concluida', 'falhou', 'cancelada', 'expirada']).notNullable()
        // MySQL admite vários NULLs em UNIQUE; só uma geração pode ocupar cada chat.
        t.integer('chat_ativo').nullable().unique('UQ_CHAT_GERACAO_ATIVA')
        t.string('dono_lease', 36).notNullable()
        t.bigInteger('lease_ate_ms').notNullable()
        t.bigInteger('criada_ms').notNullable()
        t.integer('id_mensagem_usuario').nullable()
        t.integer('id_mensagem_assistente').nullable()
        t.string('codigo_erro', 64).nullable()
        t.integer('status_erro').nullable()
        t.string('retry_after', 80).nullable()
        t.unique(['id_usuario', 'requisicao_id'], 'UQ_USUARIO_REQUISICAO')
        t.index(['id_usuario', 'criada_ms'], 'IDX_REQUISICAO_LIMITE')
        t.index(['id_chat', 'estado', 'id'], 'IDX_REQUISICAO_CONTEXTO')
    })
}

// Rollback não é automático: remove estados de idempotência. Fazer backup antes.
exports.down = async (knex) => {
    await knex.schema.dropTable('tbl_chat_requisicao')
}
