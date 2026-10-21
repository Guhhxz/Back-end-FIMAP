
const config_message = {
    // ==========================================
    // SUCESSO - 2XX
    // ==========================================
    OK: {
        status: 200,
        mensagem: 'Requisição realizada com sucesso.'
    },
    CRIADO: {
        status: 201,
        mensagem: 'Registro criado com sucesso.'
    },
    SEM_CONTEUDO: {
        status: 204,
        mensagem: 'Operação realizada com sucesso, sem conteúdo para retornar.'
    },

    // ==========================================
    // ERROS DO CLIENTE - 4XX
    // ==========================================
    REQUISICAO_INVALIDA: {
        status: 400,
        mensagem: 'Os dados enviados são inválidos.'
    },
    NAO_AUTENTICADO: {
        status: 401,
        mensagem: 'Autenticação necessária ou credenciais inválidas.'
    },
    ACESSO_NEGADO: {
        status: 403,
        mensagem: 'Você não tem permissão para realizar esta operação.'
    },
    NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'O recurso solicitado não foi encontrado.'
    },
    METODO_NAO_PERMITIDO: {
        status: 405,
        mensagem: 'O método HTTP utilizado não é permitido.'
    },
    CONFLITO: {
        status: 409,
        mensagem: 'A operação entrou em conflito com os dados existentes.'
    },
    DADOS_INVALIDOS: {
        status: 422,
        mensagem: 'Os dados enviados não passaram pela validação.'
    },
    MUITAS_REQUISICOES: {
        status: 429,
        mensagem: 'Muitas requisições. Tente novamente mais tarde.'
    },

    // ==========================================
    // ERROS DO SERVIDOR - 5XX
    // ==========================================
    ERRO_INTERNO: {
        status: 500,
        mensagem: 'Ocorreu um erro interno no servidor.'
    },
    NAO_IMPLEMENTADO: {
        status: 501,
        mensagem: 'Esta funcionalidade ainda não foi implementada.'
    },
    ERRO_GATEWAY: {
        status: 502,
        mensagem: 'O servidor recebeu uma resposta inválida de outro serviço.'
    },
    SERVICO_INDISPONIVEL: {
        status: 503,
        mensagem: 'O serviço está temporariamente indisponível.'
    },
    TIMEOUT_GATEWAY: {
        status: 504,
        mensagem: 'O tempo limite de resposta de outro serviço foi excedido.'
    },

    // ==========================================
    // USUÁRIO - SUCESSO
    // ==========================================
    USUARIO_CRIADO: {
        status: 201,
        mensagem: 'Usuário cadastrado com sucesso.'
    },
    USUARIO_ENCONTRADO: {
        status: 200,
        mensagem: 'Usuário encontrado com sucesso.'
    },
    USUARIOS_ENCONTRADOS: {
        status: 200,
        mensagem: 'Usuários consultados com sucesso.'
    },
    USUARIO_ATUALIZADO: {
        status: 200,
        mensagem: 'Usuário atualizado com sucesso.'
    },
    USUARIO_DELETADO: {
        status: 200,
        mensagem: 'Usuário excluído com sucesso.'
    },

    // ==========================================
    // USUÁRIO - ERROS
    // ==========================================
    CAMPOS_OBRIGATORIOS: {
        status: 400,
        mensagem: 'Preencha todos os campos obrigatórios.'
    },
    NOME_OBRIGATORIO: {
        status: 400,
        mensagem: 'O nome é obrigatório.'
    },
    CPF_OBRIGATORIO: {
        status: 400,
        mensagem: 'O CPF é obrigatório.'
    },
    EMAIL_OBRIGATORIO: {
        status: 400,
        mensagem: 'O e-mail é obrigatório.'
    },
    USERNAME_OBRIGATORIO: {
        status: 400,
        mensagem: 'O username é obrigatório.'
    },
    SENHA_OBRIGATORIA: {
        status: 400,
        mensagem: 'A senha é obrigatória.'
    },
    EMAIL_INVALIDO: {
        status: 422,
        mensagem: 'O formato do e-mail é inválido.'
    },
    CPF_INVALIDO: {
        status: 422,
        mensagem: 'O CPF informado é inválido.'
    },
    SENHA_INVALIDA: {
        status: 422,
        mensagem: 'A senha não atende aos critérios exigidos.'
    },
    ID_USUARIO_INVALIDO: {
        status: 400,
        mensagem: 'O ID do usuário informado é inválido.'
    },
    USUARIO_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'Usuário não encontrado.'
    },
    EMAIL_EXISTENTE: {
        status: 409,
        mensagem: 'Este e-mail já está cadastrado.'
    },
    CPF_EXISTENTE: {
        status: 409,
        mensagem: 'Este CPF já está cadastrado.'
    },
    USERNAME_EXISTENTE: {
        status: 409,
        mensagem: 'Este username já está cadastrado.'
    },
    DADOS_USUARIO_EXISTENTES: {
        status: 409,
        mensagem: 'E-mail, CPF ou username já cadastrado.'
    },
    NENHUM_CAMPO_ATUALIZAR: {
        status: 400,
        mensagem: 'Informe ao menos um campo para atualizar.'
    },
    ERRO_CRIAR_USUARIO: {
        status: 500,
        mensagem: 'Não foi possível cadastrar o usuário.'
    },
    ERRO_BUSCAR_USUARIO: {
        status: 500,
        mensagem: 'Não foi possível consultar o usuário.'
    },
    ERRO_BUSCAR_USUARIOS: {
        status: 500,
        mensagem: 'Não foi possível consultar os usuários.'
    },
    ERRO_ATUALIZAR_USUARIO: {
        status: 500,
        mensagem: 'Não foi possível atualizar o usuário.'
    },
    ERRO_DELETAR_USUARIO: {
        status: 500,
        mensagem: 'Não foi possível excluir o usuário.'
    },

    // ==========================================
    // AUTENTICAÇÃO
    // ==========================================
    LOGIN_SUCESSO: {
        status: 200,
        mensagem: 'Login realizado com sucesso.'
    },
    LOGOUT_SUCESSO: {
        status: 200,
        mensagem: 'Logout realizado com sucesso.'
    },
    CREDENCIAIS_INVALIDAS: {
        status: 401,
        mensagem: 'E-mail, username ou senha incorretos.'
    },
    TOKEN_AUSENTE: {
        status: 401,
        mensagem: 'O token de autenticação não foi informado.'
    },
    TOKEN_INVALIDO: {
        status: 401,
        mensagem: 'O token de autenticação é inválido.'
    },
    TOKEN_EXPIRADO: {
        status: 401,
        mensagem: 'O token de autenticação expirou.'
    },
    PERMISSAO_NEGADA: {
        status: 403,
        mensagem: 'Você não tem permissão para realizar esta ação.'
    },

    // ==========================================
    // BANCO DE DADOS
    // ==========================================
    ERRO_CONEXAO_BANCO: {
        status: 500,
        mensagem: 'Não foi possível conectar ao banco de dados.'
    },
    ERRO_CONSULTA_BANCO: {
        status: 500,
        mensagem: 'Não foi possível consultar os dados.'
    },
    ERRO_INSERCAO_BANCO: {
        status: 500,
        mensagem: 'Não foi possível inserir os dados.'
    },
    ERRO_ATUALIZACAO_BANCO: {
        status: 500,
        mensagem: 'Não foi possível atualizar os dados.'
    },
    ERRO_EXCLUSAO_BANCO: {
        status: 500,
        mensagem: 'Não foi possível excluir os dados.'
    },
    ERRO_CHAVE_ESTRANGEIRA: {
        status: 400,
        mensagem: 'Um dos registros relacionados não existe.'
    },

    // ==========================================
    // OPEN FINANCE
    // ==========================================
    OPEN_FINANCE_SUCESSO: {
        status: 200,
        mensagem: 'Operação do Open Finance realizada com sucesso.'
    },
    CONNECT_TOKEN_CRIADO: {
        status: 201,
        mensagem: 'Token de conexão gerado com sucesso.'
    },
    CONEXAO_FINANCEIRA_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Conexão financeira não encontrada.'
    },
    ERRO_OPEN_FINANCE: {
        status: 502,
        mensagem: 'Não foi possível concluir a operação com o Open Finance.'
    },
    ERRO_CONNECT_TOKEN: {
        status: 500,
        mensagem: 'Não foi possível gerar o token de conexão.'
    },
    ERRO_SINCRONIZACAO_FINANCEIRA: {
        status: 502,
        mensagem: 'Não foi possível sincronizar os dados financeiros.'
    }
}

module.exports = config_message
