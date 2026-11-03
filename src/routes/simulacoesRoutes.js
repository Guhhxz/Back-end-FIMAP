const express = require('express')
const router = express.Router()

const simulacaoInvestimentoController = require('../controller/Simulacoes/SimulacaoInvestimentoController.js')

router.get('/simulacoes/investimentos', simulacaoInvestimentoController.listarSimulacoesInvestimento)
router.post('/simulacoes/investimentos', simulacaoInvestimentoController.criarSimulacaoInvestimento)
router.get('/simulacoes/investimentos/:simulacaoId', simulacaoInvestimentoController.consultarSimulacaoInvestimento)
router.patch('/simulacoes/investimentos/:simulacaoId', simulacaoInvestimentoController.atualizarSimulacaoInvestimento)
router.delete('/simulacoes/investimentos/:simulacaoId', simulacaoInvestimentoController.removerSimulacaoInvestimento)

module.exports = router