const express = require('express')
const router = express.Router()
const autenticar = require('../middlewares/autorization.js')

const simulacaoInvestimentoController = require('../controller/Simulacoes/SimulacaoInvestimentoController.js')
const simulacaoAmortizacaoController = require('../controller/Simulacoes/SimulacaoAmortizacaoController.js')

router.use(autenticar)

router.get('/simulacoes/investimentos', simulacaoInvestimentoController.listarSimulacoesInvestimento)
router.post('/simulacoes/investimentos', simulacaoInvestimentoController.criarSimulacaoInvestimento)
router.get('/simulacoes/investimentos/:simulacaoId', simulacaoInvestimentoController.consultarSimulacaoInvestimento)
router.patch('/simulacoes/investimentos/:simulacaoId', simulacaoInvestimentoController.atualizarSimulacaoInvestimento)
router.delete('/simulacoes/investimentos/:simulacaoId', simulacaoInvestimentoController.removerSimulacaoInvestimento)

router.get('/simulacoes/amortizacoes', simulacaoAmortizacaoController.listarSimulacoesAmortizacao)
router.post('/simulacoes/amortizacoes', simulacaoAmortizacaoController.criarSimulacaoAmortizacao)
router.get('/simulacoes/amortizacoes/:simulacaoId', simulacaoAmortizacaoController.consultarSimulacaoAmortizacao)
router.patch('/simulacoes/amortizacoes/:simulacaoId', simulacaoAmortizacaoController.atualizarSimulacaoAmortizacao)
router.delete('/simulacoes/amortizacoes/:simulacaoId', simulacaoAmortizacaoController.removerSimulacaoAmortizacao)

module.exports = router
