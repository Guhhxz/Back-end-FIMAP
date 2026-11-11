/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('investimento_snapshot', (table) => {
    table.increments('id').primary()
    table.string('item_id', 64).notNullable()
    table.date('data').notNullable()
    table.decimal('valor_total', 14, 2).notNullable()
    table.timestamp('criado_em').defaultTo(knex.fn.now())
    table.unique(['item_id', 'data'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('investimento_snapshot')
}