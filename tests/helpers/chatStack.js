const { load } = require('./chatHarness.js')
const { database } = require('./chatDatabase.js')
const ia = require('../../src/services/aiChatService.js')
const stack = (provider = ia, connection = database()) => {
    const { db } = connection
    const chat = load('model/DAO/Chat/ChatDAO.js', { '../../Database_config_knex/connection.js': db })
    const dao = load('model/DAO/MensagemChat/MensagemChatDAO.js', {
        '../../Database_config_knex/connection.js': db, '../Chat/ChatDAO.js': chat
    })
    const requests = load('model/DAO/MensagemChat/RequisicaoChatDAO.js', { '../../Database_config_knex/connection.js': db })
    const service = load('src/services/chatRequestService.js', {
        '../../model/DAO/MensagemChat/RequisicaoChatDAO.js': requests,
        '../../model/DAO/MensagemChat/MensagemChatDAO.js': dao, './aiChatService.js': provider
    })
    const controller = load('src/controller/MensagemChat/MensagemChatController.js', {
        '../../../model/DAO/MensagemChat/MensagemChatDAO.js': dao, '../../services/chatRequestService.js': service
    })
    const chatController = load('src/controller/Chat/ChatController.js', { '../../../model/DAO/Chat/ChatDAO.js': chat })
    return { ...connection, chat, dao, requests, service, controller, chatController }
}
module.exports = { stack }
