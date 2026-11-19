const tabela = 'tbl_conexao_open_finance'

exports.up = async (knex) => {
    const temNomeInstituicao = await knex.schema.hasColumn(tabela, 'nome_instituicao')
    const temPercentualCdi = await knex.schema.hasColumn(tabela, 'percentual_cdi_manual')

    if (!temNomeInstituicao || !temPercentualCdi) {
        await knex.schema.alterTable(tabela, (colunas) => {
            if (!temNomeInstituicao) {
                colunas.string('nome_instituicao', 255).nullable()
            }
            if (!temPercentualCdi) {
                colunas.decimal('percentual_cdi_manual', 10, 4).nullable()
            }
        })
    }
}

exports.down = async () => {
    throw new Error('A reversão exige revisão manual para preservar as colunas e os dados de Open Finance.')
}
