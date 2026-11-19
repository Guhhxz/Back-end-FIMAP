require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })

module.exports = {
    development: {
      // ALTERAÇÃO: Define o cliente como 'mysql2'
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'db_fimap_2026',
        port: Number(process.env.DB_PORT || 3306), // Porta padrão do MySQL
       
        // Opcional: Define charset (recomendado para UTF8)
        charset: 'utf8mb4'
      },
     
      // Configurações de Migração
      migrations: {
        tableName: 'knex_migrations', // Nome da tabela de migrações
        directory: require('path').resolve(__dirname, '../../db/migrations')
      },
      seeds: {
        directory: './db/seeds'
      }
    },
   
    // Você pode adicionar configurações para produção, testes, etc.
  };
