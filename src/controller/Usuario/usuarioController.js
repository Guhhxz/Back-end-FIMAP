const config_message = require('../modulo/configMensagens.js')

// Importa o DAO (Data Access Object), que é responsável por
// acessar diretamente o banco de dados e executar as operações CRUD.
const filmeDAO = require('../../model/DAO/filme/filme.js')

// Importação do body-parser (não está sendo utilizado diretamente neste arquivo,
// mas geralmente serve para trabalhar com requisições JSON no Node.js)
const { json } = require('body-parser')
