const { criarErro } = require('./chatValidation.js')
const falhasWorker = {
    AI_CONFIGURATION: [503, 'A conexão com a IA não está configurada.'],
    AI_PROVIDER_AUTH: [503, 'A credencial do provedor de IA foi recusada.'],
    AI_PROVIDER_ACCESS: [503, 'O modelo de IA não está disponível para este serviço.'],
    AI_QUOTA: [429, 'A cota da IA foi esgotada. Aguarde a renovação.'],
    AI_RATE_LIMIT: [429, 'A IA recebeu muitas solicitações. Aguarde antes de tentar novamente.'],
    AI_PROVIDER_REDIRECT: [503, 'A conexão com o provedor de IA foi recusada.'],
    AI_INVALID_RESPONSE: [502, 'A IA retornou uma resposta inválida.'],
    AI_UNAVAILABLE: [502, 'O serviço de IA está indisponível.']
}
const retrySeguro = (valor) => typeof valor === 'string' &&
    (/^\d{1,8}$/.test(valor) || /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(valor)) ? valor : undefined

const erroWorker = (status, codigo, retry) => {
    const conhecido = falhasWorker[codigo]
    const [http, mensagem, code] = conhecido ? [...conhecido, codigo]
        : [401, 403].includes(status) ? [503, 'A autenticação entre os serviços de IA falhou.', 'IA_AUTENTICACAO']
        : status === 429 ? [429, 'Limite temporário da IA atingido.', 'IA_LIMITE']
        : status === 503 ? [503, 'O serviço de IA não está disponível ou configurado.', 'IA_SERVICO_INDISPONIVEL']
        : [502, 'A IA não conseguiu concluir a resposta.', 'IA_PROVEDOR']
    return Object.assign(criarErro(http, mensagem, code), { retryAfter: retrySeguro(retry) })
}
const publico = (error) => ({ sucesso: false, codigo: error.statusCode ? error.code || 'CHAT_ERRO' : 'CHAT_BANCO',
    mensagem: error.statusCode ? error.message : 'Não foi possível concluir a solicitação.' })
module.exports = { erroWorker, retrySeguro, publico }
