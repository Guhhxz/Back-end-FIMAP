const express = require('express')
const router = express.Router()

const simulacaoInvestimentoController = require('../controller/Simulacoes/SimulacaoInvestimentoController.js')
const simulacaoAmortizacaoController = require('../controller/Simulacoes/SimulacaoAmortizacaoController.js')
const indicadoresController = require('../controller/Simulacoes/indicadoresController.js')

// Sem JWT por enquanto: as rotas de simulação recebem o dono em ?id_usuario=

router.get('/indicadores', indicadoresController.consultarIndicadores)

router.get('/investimentos', simulacaoInvestimentoController.listarSimulacoesInvestimento)
router.post('/investimentos', simulacaoInvestimentoController.criarSimulacaoInvestimento)
router.get('/investimentos/:simulacaoId', simulacaoInvestimentoController.consultarSimulacaoInvestimento)
router.patch('/investimentos/:simulacaoId', simulacaoInvestimentoController.atualizarSimulacaoInvestimento)
router.delete('/investimentos/:simulacaoId', simulacaoInvestimentoController.removerSimulacaoInvestimento)

router.get('/amortizacoes', simulacaoAmortizacaoController.listarSimulacoesAmortizacao)
router.post('/amortizacoes', simulacaoAmortizacaoController.criarSimulacaoAmortizacao)
router.get('/amortizacoes/:simulacaoId', simulacaoAmortizacaoController.consultarSimulacaoAmortizacao)
router.patch('/amortizacoes/:simulacaoId', simulacaoAmortizacaoController.atualizarSimulacaoAmortizacao)
router.delete('/amortizacoes/:simulacaoId', simulacaoAmortizacaoController.removerSimulacaoAmortizacao)

module.exports = router