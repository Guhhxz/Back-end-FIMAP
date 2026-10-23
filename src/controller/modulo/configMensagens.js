module.exports = {
    ERROR_BAD_REQUEST: { sucesso: false, mensagem: 'Parâmetros da solicitação inválidos.' },
    ERROR_INVALID_MESSAGE: { sucesso: false, mensagem: 'A mensagem deve conter entre 1 e 4000 caracteres.' },
    ERROR_CHAT_NOT_FOUND: { sucesso: false, mensagem: 'Chat não encontrado.' },
    ERROR_MODEL_NOT_FOUND: { sucesso: false, mensagem: 'Modelo qwen3:4b não encontrado no Ollama. Verifique se ele foi baixado.' },
    ERROR_AI_TIMEOUT: { sucesso: false, mensagem: 'O Ollama demorou demais para responder. Tente novamente.' },
    ERROR_AI_PROVIDER: { sucesso: false, mensagem: 'O Ollama retornou uma resposta inválida ou falhou ao processar a mensagem.' },
    ERROR_AI_UNAVAILABLE: { sucesso: false, mensagem: 'O Ollama está indisponível. Verifique se está em execução.' },
    ERROR_INTERNAL_SERVER: { sucesso: false, mensagem: 'Erro interno do servidor.' }
}
