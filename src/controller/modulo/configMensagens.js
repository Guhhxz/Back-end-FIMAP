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
    // GENÉRICOS (ID / PAGINAÇÃO / CAMPOS)
    // ==========================================
    ID_INVALIDO: {
        status: 400,
        mensagem: 'O ID informado é inválido.'
    },
    ID_OBRIGATORIO: {
        status: 400,
        mensagem: 'O ID é obrigatório.'
    },
    PARAMETRO_INVALIDO: {
        status: 400,
        mensagem: 'Um ou mais parâmetros da requisição são inválidos.'
    },
    PAGINACAO_INVALIDA: {
        status: 400,
        mensagem: 'Os parâmetros de paginação são inválidos.'
    },
    NENHUM_REGISTRO_ENCONTRADO: {
        status: 404,
        mensagem: 'Nenhum registro encontrado.'
    },
    FORMATO_DATA_INVALIDO: {
        status: 422,
        mensagem: 'O formato da data informada é inválido.'
    },
    VALOR_NUMERICO_INVALIDO: {
        status: 422,
        mensagem: 'O valor numérico informado é inválido.'
    },
    STATUS_INVALIDO: {
        status: 422,
        mensagem: 'O status informado é inválido.'
    },

    // ==========================================
    // USUÁRIO - SUCESSO (tbl_usuario)
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
    PERFIL_ATUALIZADO: {
        status: 200,
        mensagem: 'Perfil atualizado com sucesso.'
    },
    FOTO_PERFIL_ATUALIZADA: {
        status: 200,
        mensagem: 'Foto de perfil atualizada com sucesso.'
    },
    SENHA_ALTERADA: {
        status: 200,
        mensagem: 'Senha alterada com sucesso.'
    },

    // ==========================================
    // USUÁRIO - ERROS (tbl_usuario)
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
    NOME_INVALIDO: {
        status: 422,
        mensagem: 'O nome deve ter no máximo 80 caracteres.'
    },
    EMAIL_INVALIDO: {
        status: 422,
        mensagem: 'O formato do e-mail é inválido.'
    },
    CPF_INVALIDO: {
        status: 422,
        mensagem: 'O CPF informado é inválido.'
    },
    USERNAME_INVALIDO: {
        status: 422,
        mensagem: 'O username informado é inválido ou excede 80 caracteres.'
    },
    SENHA_INVALIDA: {
        status: 422,
        mensagem: 'A senha não atende aos critérios exigidos.'
    },
    SENHA_ATUAL_INCORRETA: {
        status: 401,
        mensagem: 'A senha atual informada está incorreta.'
    },
    NOME_EXIBICAO_INVALIDO: {
        status: 422,
        mensagem: 'O nome de exibição deve ter no máximo 80 caracteres.'
    },
    USERNAME_SOCIAL_INVALIDO: {
        status: 422,
        mensagem: 'O username social deve ter no máximo 80 caracteres.'
    },
    BIOGRAFIA_INVALIDA: {
        status: 422,
        mensagem: 'A biografia deve ter no máximo 250 caracteres.'
    },
    LOCALIZACAO_INVALIDA: {
        status: 422,
        mensagem: 'A localização deve ter no máximo 100 caracteres.'
    },
    FOTO_PERFIL_INVALIDA: {
        status: 422,
        mensagem: 'A foto de perfil informada é inválida.'
    },
    VISIBILIDADE_INVALIDA: {
        status: 422,
        mensagem: 'O valor de visibilidade do perfil é inválido.'
    },
    ID_USUARIO_INVALIDO: {
        status: 400,
        mensagem: 'O ID do usuário informado é inválido.'
    },
    ID_USUARIO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O ID do usuário é obrigatório.'
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
    PERFIL_PRIVADO: {
        status: 403,
        mensagem: 'Este perfil é privado.'
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
    ERRO_ALTERAR_SENHA: {
        status: 500,
        mensagem: 'Não foi possível alterar a senha.'
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
    ERRO_LOGIN: {
        status: 500,
        mensagem: 'Não foi possível realizar o login.'
    },
    ERRO_LOGOUT: {
        status: 500,
        mensagem: 'Não foi possível realizar o logout.'
    },

    // ==========================================
    // CÓDIGO OTP (tbl_codigo_otp)
    // ==========================================
    OTP_GERADO: {
        status: 201,
        mensagem: 'Código de verificação gerado com sucesso.'
    },
    OTP_ENVIADO: {
        status: 200,
        mensagem: 'Código de verificação enviado com sucesso.'
    },
    OTP_VALIDADO: {
        status: 200,
        mensagem: 'Código de verificação validado com sucesso.'
    },
    CODIGO_OTP_OBRIGATORIO: {
        status: 400,
        mensagem: 'O código de verificação é obrigatório.'
    },
    CODIGO_OTP_INVALIDO: {
        status: 422,
        mensagem: 'O código de verificação informado é inválido.'
    },
    CODIGO_OTP_INCORRETO: {
        status: 401,
        mensagem: 'O código de verificação está incorreto.'
    },
    CODIGO_OTP_EXPIRADO: {
        status: 401,
        mensagem: 'O código de verificação expirou.'
    },
    CODIGO_OTP_JA_UTILIZADO: {
        status: 409,
        mensagem: 'Este código de verificação já foi utilizado ou está inativo.'
    },
    OTP_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'Código de verificação não encontrado.'
    },
    LIMITE_OTP_EXCEDIDO: {
        status: 429,
        mensagem: 'Limite de solicitações de código excedido. Tente novamente mais tarde.'
    },
    ERRO_GERAR_OTP: {
        status: 500,
        mensagem: 'Não foi possível gerar o código de verificação.'
    },
    ERRO_ENVIAR_OTP: {
        status: 502,
        mensagem: 'Não foi possível enviar o código de verificação.'
    },
    ERRO_VALIDAR_OTP: {
        status: 500,
        mensagem: 'Não foi possível validar o código de verificação.'
    },

    // ==========================================
    // SESSÃO (tbl_sessao)
    // ==========================================
    SESSAO_CRIADA: {
        status: 201,
        mensagem: 'Sessão iniciada com sucesso.'
    },
    SESSAO_ENCONTRADA: {
        status: 200,
        mensagem: 'Sessão encontrada com sucesso.'
    },
    SESSOES_ENCONTRADAS: {
        status: 200,
        mensagem: 'Sessões consultadas com sucesso.'
    },
    SESSAO_ENCERRADA: {
        status: 200,
        mensagem: 'Sessão encerrada com sucesso.'
    },
    SESSOES_ENCERRADAS: {
        status: 200,
        mensagem: 'Todas as sessões foram encerradas com sucesso.'
    },
    TOKEN_RENOVADO: {
        status: 200,
        mensagem: 'Token renovado com sucesso.'
    },
    SESSAO_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Sessão não encontrada.'
    },
    SESSAO_EXPIRADA: {
        status: 401,
        mensagem: 'A sessão expirou. Faça login novamente.'
    },
    SESSAO_REVOGADA: {
        status: 401,
        mensagem: 'A sessão foi encerrada. Faça login novamente.'
    },
    REFRESH_TOKEN_OBRIGATORIO: {
        status: 400,
        mensagem: 'O refresh token é obrigatório.'
    },
    REFRESH_TOKEN_INVALIDO: {
        status: 401,
        mensagem: 'O refresh token é inválido.'
    },
    REFRESH_TOKEN_EXPIRADO: {
        status: 401,
        mensagem: 'O refresh token expirou.'
    },
    ID_SESSAO_INVALIDO: {
        status: 400,
        mensagem: 'O ID da sessão informado é inválido.'
    },
    ERRO_CRIAR_SESSAO: {
        status: 500,
        mensagem: 'Não foi possível iniciar a sessão.'
    },
    ERRO_BUSCAR_SESSAO: {
        status: 500,
        mensagem: 'Não foi possível consultar a sessão.'
    },
    ERRO_ENCERRAR_SESSAO: {
        status: 500,
        mensagem: 'Não foi possível encerrar a sessão.'
    },
    ERRO_RENOVAR_TOKEN: {
        status: 500,
        mensagem: 'Não foi possível renovar o token.'
    },

    // ==========================================
    // DISPOSITIVO (tbl_dispositivo)
    // ==========================================
    DISPOSITIVO_CRIADO: {
        status: 201,
        mensagem: 'Dispositivo cadastrado com sucesso.'
    },
    DISPOSITIVO_ENCONTRADO: {
        status: 200,
        mensagem: 'Dispositivo encontrado com sucesso.'
    },
    DISPOSITIVOS_ENCONTRADOS: {
        status: 200,
        mensagem: 'Dispositivos consultados com sucesso.'
    },
    DISPOSITIVO_ATUALIZADO: {
        status: 200,
        mensagem: 'Dispositivo atualizado com sucesso.'
    },
    DISPOSITIVO_DELETADO: {
        status: 200,
        mensagem: 'Dispositivo removido com sucesso.'
    },
    NOME_DISPOSITIVO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O nome do dispositivo é obrigatório.'
    },
    SISTEMA_OPERACIONAL_OBRIGATORIO: {
        status: 400,
        mensagem: 'O sistema operacional é obrigatório.'
    },
    IDENTIFICADOR_DISPOSITIVO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O identificador do dispositivo é obrigatório.'
    },
    SISTEMA_OPERACIONAL_INVALIDO: {
        status: 422,
        mensagem: 'O sistema operacional informado é inválido.'
    },
    IDENTIFICADOR_DISPOSITIVO_INVALIDO: {
        status: 422,
        mensagem: 'O identificador do dispositivo é inválido.'
    },
    ID_DISPOSITIVO_INVALIDO: {
        status: 400,
        mensagem: 'O ID do dispositivo informado é inválido.'
    },
    DISPOSITIVO_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'Dispositivo não encontrado.'
    },
    DISPOSITIVO_EXISTENTE: {
        status: 409,
        mensagem: 'Este dispositivo já está cadastrado.'
    },
    ERRO_CRIAR_DISPOSITIVO: {
        status: 500,
        mensagem: 'Não foi possível cadastrar o dispositivo.'
    },
    ERRO_BUSCAR_DISPOSITIVO: {
        status: 500,
        mensagem: 'Não foi possível consultar o dispositivo.'
    },
    ERRO_ATUALIZAR_DISPOSITIVO: {
        status: 500,
        mensagem: 'Não foi possível atualizar o dispositivo.'
    },
    ERRO_DELETAR_DISPOSITIVO: {
        status: 500,
        mensagem: 'Não foi possível remover o dispositivo.'
    },

    // ==========================================
    // CONFIGURAÇÕES (tbl_configuracoes)
    // ==========================================
    CONFIGURACOES_ENCONTRADAS: {
        status: 200,
        mensagem: 'Configurações consultadas com sucesso.'
    },
    CONFIGURACOES_CRIADAS: {
        status: 201,
        mensagem: 'Configurações criadas com sucesso.'
    },
    CONFIGURACOES_ATUALIZADAS: {
        status: 200,
        mensagem: 'Configurações atualizadas com sucesso.'
    },
    CONFIGURACOES_NAO_ENCONTRADAS: {
        status: 404,
        mensagem: 'Configurações não encontradas.'
    },
    CONFIGURACOES_EXISTENTES: {
        status: 409,
        mensagem: 'O usuário já possui configurações cadastradas.'
    },
    CONFIGURACAO_INVALIDA: {
        status: 422,
        mensagem: 'O valor informado para a configuração é inválido.'
    },
    ERRO_BUSCAR_CONFIGURACOES: {
        status: 500,
        mensagem: 'Não foi possível consultar as configurações.'
    },
    ERRO_CRIAR_CONFIGURACOES: {
        status: 500,
        mensagem: 'Não foi possível criar as configurações.'
    },
    ERRO_ATUALIZAR_CONFIGURACOES: {
        status: 500,
        mensagem: 'Não foi possível atualizar as configurações.'
    },

    // ==========================================
    // NOTIFICAÇÃO (tbl_notificacao)
    // ==========================================
    NOTIFICACAO_CRIADA: {
        status: 201,
        mensagem: 'Notificação criada com sucesso.'
    },
    NOTIFICACAO_ENCONTRADA: {
        status: 200,
        mensagem: 'Notificação encontrada com sucesso.'
    },
    NOTIFICACOES_ENCONTRADAS: {
        status: 200,
        mensagem: 'Notificações consultadas com sucesso.'
    },
    NOTIFICACAO_LIDA: {
        status: 200,
        mensagem: 'Notificação marcada como lida.'
    },
    NOTIFICACOES_LIDAS: {
        status: 200,
        mensagem: 'Todas as notificações foram marcadas como lidas.'
    },
    NOTIFICACAO_DELETADA: {
        status: 200,
        mensagem: 'Notificação excluída com sucesso.'
    },
    NOME_NOTIFICACAO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O título da notificação é obrigatório.'
    },
    CONTEUDO_NOTIFICACAO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O conteúdo da notificação é obrigatório.'
    },
    CONTEUDO_NOTIFICACAO_INVALIDO: {
        status: 422,
        mensagem: 'O conteúdo da notificação deve ter no máximo 200 caracteres.'
    },
    ICONE_NOTIFICACAO_INVALIDO: {
        status: 422,
        mensagem: 'O ícone da notificação é inválido.'
    },
    ID_NOTIFICACAO_INVALIDO: {
        status: 400,
        mensagem: 'O ID da notificação informado é inválido.'
    },
    NOTIFICACAO_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Notificação não encontrada.'
    },
    NOTIFICACAO_JA_LIDA: {
        status: 409,
        mensagem: 'Esta notificação já foi marcada como lida.'
    },
    ERRO_CRIAR_NOTIFICACAO: {
        status: 500,
        mensagem: 'Não foi possível criar a notificação.'
    },
    ERRO_BUSCAR_NOTIFICACOES: {
        status: 500,
        mensagem: 'Não foi possível consultar as notificações.'
    },
    ERRO_ATUALIZAR_NOTIFICACAO: {
        status: 500,
        mensagem: 'Não foi possível atualizar a notificação.'
    },
    ERRO_DELETAR_NOTIFICACAO: {
        status: 500,
        mensagem: 'Não foi possível excluir a notificação.'
    },

    // ==========================================
    // SEGUIDORES (tbl_seguidores)
    // ==========================================
    SEGUIDOR_CRIADO: {
        status: 201,
        mensagem: 'Agora você está seguindo este usuário.'
    },
    SEGUIDORES_ENCONTRADOS: {
        status: 200,
        mensagem: 'Seguidores consultados com sucesso.'
    },
    SEGUINDO_ENCONTRADOS: {
        status: 200,
        mensagem: 'Usuários seguidos consultados com sucesso.'
    },
    SEGUIDOR_DELETADO: {
        status: 200,
        mensagem: 'Você deixou de seguir este usuário.'
    },
    ID_SEGUIDOR_OBRIGATORIO: {
        status: 400,
        mensagem: 'O ID do seguidor é obrigatório.'
    },
    ID_SEGUINDO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O ID do usuário a ser seguido é obrigatório.'
    },
    SEGUIR_SI_MESMO: {
        status: 422,
        mensagem: 'Você não pode seguir a si mesmo.'
    },
    SEGUIDOR_JA_EXISTENTE: {
        status: 409,
        mensagem: 'Você já está seguindo este usuário.'
    },
    SEGUIDOR_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'Você não está seguindo este usuário.'
    },
    ERRO_SEGUIR_USUARIO: {
        status: 500,
        mensagem: 'Não foi possível seguir o usuário.'
    },
    ERRO_BUSCAR_SEGUIDORES: {
        status: 500,
        mensagem: 'Não foi possível consultar os seguidores.'
    },
    ERRO_DEIXAR_SEGUIR: {
        status: 500,
        mensagem: 'Não foi possível deixar de seguir o usuário.'
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
    ERRO_REGISTRO_EM_USO: {
        status: 409,
        mensagem: 'Não é possível excluir o registro pois ele está sendo utilizado por outros dados.'
    },
    ERRO_REGISTRO_DUPLICADO: {
        status: 409,
        mensagem: 'Já existe um registro com estes dados.'
    },
    ERRO_TRANSACAO_BANCO: {
        status: 500,
        mensagem: 'Não foi possível concluir a transação no banco de dados.'
    },

    // ==========================================
    // OPEN FINANCE (tbl_conexao_open_finance)
    // ==========================================
    OPEN_FINANCE_SUCESSO: {
        status: 200,
        mensagem: 'Operação do Open Finance realizada com sucesso.'
    },
    CONNECT_TOKEN_CRIADO: {
        status: 201,
        mensagem: 'Token de conexão gerado com sucesso.'
    },
    CONEXAO_FINANCEIRA_CRIADA: {
        status: 201,
        mensagem: 'Conexão financeira criada com sucesso.'
    },
    CONEXAO_FINANCEIRA_ENCONTRADA: {
        status: 200,
        mensagem: 'Conexão financeira encontrada com sucesso.'
    },
    CONEXOES_FINANCEIRAS_ENCONTRADAS: {
        status: 200,
        mensagem: 'Conexões financeiras consultadas com sucesso.'
    },
    CONEXAO_FINANCEIRA_ATUALIZADA: {
        status: 200,
        mensagem: 'Conexão financeira atualizada com sucesso.'
    },
    CONEXAO_FINANCEIRA_REMOVIDA: {
        status: 200,
        mensagem: 'Conexão financeira removida com sucesso.'
    },
    SINCRONIZACAO_FINANCEIRA_SUCESSO: {
        status: 200,
        mensagem: 'Dados financeiros sincronizados com sucesso.'
    },
    PROVEDOR_OBRIGATORIO: {
        status: 400,
        mensagem: 'O provedor financeiro é obrigatório.'
    },
    PROVEDOR_INVALIDO: {
        status: 422,
        mensagem: 'O provedor financeiro informado é inválido.'
    },
    CONSENTIMENTO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O consentimento para acesso aos dados é obrigatório.'
    },
    CONSENTIMENTO_INVALIDO: {
        status: 422,
        mensagem: 'O consentimento informado é inválido.'
    },
    CONSENTIMENTO_EXPIRADO: {
        status: 401,
        mensagem: 'O consentimento para acesso aos dados expirou. Autorize novamente.'
    },
    EXTERNAL_CONNECTION_ID_OBRIGATORIO: {
        status: 400,
        mensagem: 'O identificador externo da conexão é obrigatório.'
    },
    ID_CONEXAO_FINANCEIRA_INVALIDO: {
        status: 400,
        mensagem: 'O ID da conexão financeira informado é inválido.'
    },
    CONEXAO_FINANCEIRA_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Conexão financeira não encontrada.'
    },
    CONEXAO_FINANCEIRA_EXISTENTE: {
        status: 409,
        mensagem: 'Já existe uma conexão financeira com este provedor.'
    },
    CONEXAO_FINANCEIRA_INATIVA: {
        status: 403,
        mensagem: 'A conexão financeira está inativa.'
    },
    ERRO_OPEN_FINANCE: {
        status: 502,
        mensagem: 'Não foi possível concluir a operação com o Open Finance.'
    },
    ERRO_CONNECT_TOKEN: {
        status: 500,
        mensagem: 'Não foi possível gerar o token de conexão.'
    },
    ERRO_CRIAR_CONEXAO_FINANCEIRA: {
        status: 500,
        mensagem: 'Não foi possível criar a conexão financeira.'
    },
    ERRO_BUSCAR_CONEXAO_FINANCEIRA: {
        status: 500,
        mensagem: 'Não foi possível consultar a conexão financeira.'
    },
    ERRO_REMOVER_CONEXAO_FINANCEIRA: {
        status: 500,
        mensagem: 'Não foi possível remover a conexão financeira.'
    },
    ERRO_SINCRONIZACAO_FINANCEIRA: {
        status: 502,
        mensagem: 'Não foi possível sincronizar os dados financeiros.'
    },

    // ==========================================
    // CHAT (tbl_chat)
    // ==========================================
    CHAT_CRIADO: {
        status: 201,
        mensagem: 'Chat criado com sucesso.'
    },
    CHAT_ENCONTRADO: {
        status: 200,
        mensagem: 'Chat encontrado com sucesso.'
    },
    CHATS_ENCONTRADOS: {
        status: 200,
        mensagem: 'Chats consultados com sucesso.'
    },
    CHAT_ATUALIZADO: {
        status: 200,
        mensagem: 'Chat atualizado com sucesso.'
    },
    CHAT_DELETADO: {
        status: 200,
        mensagem: 'Chat excluído com sucesso.'
    },
    NOME_CHAT_OBRIGATORIO: {
        status: 400,
        mensagem: 'O nome do chat é obrigatório.'
    },
    NOME_CHAT_INVALIDO: {
        status: 422,
        mensagem: 'O nome do chat deve ter no máximo 45 caracteres.'
    },
    ID_CHAT_INVALIDO: {
        status: 400,
        mensagem: 'O ID do chat informado é inválido.'
    },
    ID_CHAT_OBRIGATORIO: {
        status: 400,
        mensagem: 'O ID do chat é obrigatório.'
    },
    CHAT_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'Chat não encontrado.'
    },
    ERRO_CRIAR_CHAT: {
        status: 500,
        mensagem: 'Não foi possível criar o chat.'
    },
    ERRO_BUSCAR_CHAT: {
        status: 500,
        mensagem: 'Não foi possível consultar o chat.'
    },
    ERRO_BUSCAR_CHATS: {
        status: 500,
        mensagem: 'Não foi possível consultar os chats.'
    },
    ERRO_ATUALIZAR_CHAT: {
        status: 500,
        mensagem: 'Não foi possível atualizar o chat.'
    },
    ERRO_DELETAR_CHAT: {
        status: 500,
        mensagem: 'Não foi possível excluir o chat.'
    },

    // ==========================================
    // MENSAGEM (tbl_mensagem)
    // ==========================================
    MENSAGEM_ENVIADA: {
        status: 201,
        mensagem: 'Mensagem enviada com sucesso.'
    },
    MENSAGEM_ENCONTRADA: {
        status: 200,
        mensagem: 'Mensagem encontrada com sucesso.'
    },
    MENSAGENS_ENCONTRADAS: {
        status: 200,
        mensagem: 'Mensagens consultadas com sucesso.'
    },
    MENSAGEM_DELETADA: {
        status: 200,
        mensagem: 'Mensagem excluída com sucesso.'
    },
    CONTEUDO_MENSAGEM_OBRIGATORIO: {
        status: 400,
        mensagem: 'O conteúdo da mensagem é obrigatório.'
    },
    CONTEUDO_MENSAGEM_INVALIDO: {
        status: 422,
        mensagem: 'O conteúdo da mensagem é inválido ou excede o tamanho permitido.'
    },
    PAPEL_MENSAGEM_OBRIGATORIO: {
        status: 400,
        mensagem: 'O papel do remetente da mensagem é obrigatório.'
    },
    PAPEL_MENSAGEM_INVALIDO: {
        status: 422,
        mensagem: 'O papel do remetente da mensagem é inválido.'
    },
    ID_MENSAGEM_INVALIDO: {
        status: 400,
        mensagem: 'O ID da mensagem informado é inválido.'
    },
    MENSAGEM_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Mensagem não encontrada.'
    },
    ERRO_ENVIAR_MENSAGEM: {
        status: 500,
        mensagem: 'Não foi possível enviar a mensagem.'
    },
    ERRO_BUSCAR_MENSAGENS: {
        status: 500,
        mensagem: 'Não foi possível consultar as mensagens.'
    },
    ERRO_DELETAR_MENSAGEM: {
        status: 500,
        mensagem: 'Não foi possível excluir a mensagem.'
    },
    ERRO_RESPOSTA_IA: {
        status: 502,
        mensagem: 'Não foi possível obter a resposta do assistente.'
    },

    // ==========================================
    // META FINANCEIRA (tbl_meta_financeira)
    // ==========================================
    META_CRIADA: {
        status: 201,
        mensagem: 'Meta financeira criada com sucesso.'
    },
    META_ENCONTRADA: {
        status: 200,
        mensagem: 'Meta financeira encontrada com sucesso.'
    },
    METAS_ENCONTRADAS: {
        status: 200,
        mensagem: 'Metas financeiras consultadas com sucesso.'
    },
    META_ATUALIZADA: {
        status: 200,
        mensagem: 'Meta financeira atualizada com sucesso.'
    },
    META_DELETADA: {
        status: 200,
        mensagem: 'Meta financeira excluída com sucesso.'
    },
    META_CONCLUIDA: {
        status: 200,
        mensagem: 'Parabéns! Meta financeira concluída.'
    },
    NOME_META_OBRIGATORIO: {
        status: 400,
        mensagem: 'O nome da meta é obrigatório.'
    },
    NOME_META_INVALIDO: {
        status: 422,
        mensagem: 'O nome da meta deve ter no máximo 100 caracteres.'
    },
    VALOR_DESEJADO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O valor desejado da meta é obrigatório.'
    },
    VALOR_DESEJADO_INVALIDO: {
        status: 422,
        mensagem: 'O valor desejado deve ser maior que zero.'
    },
    VALOR_INICIO_INVALIDO: {
        status: 422,
        mensagem: 'O valor inicial da meta é inválido.'
    },
    VALOR_TOTAL_INVALIDO: {
        status: 422,
        mensagem: 'O valor total da meta é inválido.'
    },
    VALOR_INICIO_MAIOR_QUE_DESEJADO: {
        status: 422,
        mensagem: 'O valor inicial não pode ser maior que o valor desejado.'
    },
    DATA_ALVO_OBRIGATORIA: {
        status: 400,
        mensagem: 'A data alvo da meta é obrigatória.'
    },
    DATA_ALVO_INVALIDA: {
        status: 422,
        mensagem: 'A data alvo deve ser uma data futura válida.'
    },
    ID_META_INVALIDO: {
        status: 400,
        mensagem: 'O ID da meta informado é inválido.'
    },
    META_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Meta financeira não encontrada.'
    },
    META_JA_CONCLUIDA: {
        status: 409,
        mensagem: 'Esta meta financeira já foi concluída.'
    },
    ERRO_CRIAR_META: {
        status: 500,
        mensagem: 'Não foi possível criar a meta financeira.'
    },
    ERRO_BUSCAR_META: {
        status: 500,
        mensagem: 'Não foi possível consultar a meta financeira.'
    },
    ERRO_BUSCAR_METAS: {
        status: 500,
        mensagem: 'Não foi possível consultar as metas financeiras.'
    },
    ERRO_ATUALIZAR_META: {
        status: 500,
        mensagem: 'Não foi possível atualizar a meta financeira.'
    },
    ERRO_DELETAR_META: {
        status: 500,
        mensagem: 'Não foi possível excluir a meta financeira.'
    },

    // ==========================================
    // CATEGORIA DE META (tbl_categoria_meta)
    // ==========================================
    CATEGORIA_META_CRIADA: {
        status: 201,
        mensagem: 'Categoria de meta criada com sucesso.'
    },
    CATEGORIA_META_ENCONTRADA: {
        status: 200,
        mensagem: 'Categoria de meta encontrada com sucesso.'
    },
    CATEGORIAS_META_ENCONTRADAS: {
        status: 200,
        mensagem: 'Categorias de meta consultadas com sucesso.'
    },
    CATEGORIA_META_ATUALIZADA: {
        status: 200,
        mensagem: 'Categoria de meta atualizada com sucesso.'
    },
    CATEGORIA_META_DELETADA: {
        status: 200,
        mensagem: 'Categoria de meta excluída com sucesso.'
    },
    NOME_CATEGORIA_META_OBRIGATORIO: {
        status: 400,
        mensagem: 'O nome da categoria de meta é obrigatório.'
    },
    NOME_CATEGORIA_META_INVALIDO: {
        status: 422,
        mensagem: 'O nome da categoria de meta deve ter no máximo 80 caracteres.'
    },
    ID_CATEGORIA_META_INVALIDO: {
        status: 400,
        mensagem: 'O ID da categoria de meta informado é inválido.'
    },
    CATEGORIA_META_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Categoria de meta não encontrada.'
    },
    CATEGORIA_META_EXISTENTE: {
        status: 409,
        mensagem: 'Esta categoria de meta já está cadastrada.'
    },
    CATEGORIA_META_EM_USO: {
        status: 409,
        mensagem: 'Não é possível excluir a categoria pois existem metas vinculadas a ela.'
    },
    ERRO_CRIAR_CATEGORIA_META: {
        status: 500,
        mensagem: 'Não foi possível criar a categoria de meta.'
    },
    ERRO_BUSCAR_CATEGORIA_META: {
        status: 500,
        mensagem: 'Não foi possível consultar a categoria de meta.'
    },
    ERRO_BUSCAR_CATEGORIAS_META: {
        status: 500,
        mensagem: 'Não foi possível consultar as categorias de meta.'
    },
    ERRO_ATUALIZAR_CATEGORIA_META: {
        status: 500,
        mensagem: 'Não foi possível atualizar a categoria de meta.'
    },
    ERRO_DELETAR_CATEGORIA_META: {
        status: 500,
        mensagem: 'Não foi possível excluir a categoria de meta.'
    },

    // ==========================================
    // RECOMENDAÇÃO IA (tbl_recomendacao_ia)
    // ==========================================
    RECOMENDACAO_CRIADA: {
        status: 201,
        mensagem: 'Recomendação criada com sucesso.'
    },
    RECOMENDACAO_ENCONTRADA: {
        status: 200,
        mensagem: 'Recomendação encontrada com sucesso.'
    },
    RECOMENDACOES_ENCONTRADAS: {
        status: 200,
        mensagem: 'Recomendações consultadas com sucesso.'
    },
    RECOMENDACAO_ATUALIZADA: {
        status: 200,
        mensagem: 'Recomendação atualizada com sucesso.'
    },
    RECOMENDACAO_DELETADA: {
        status: 200,
        mensagem: 'Recomendação excluída com sucesso.'
    },
    TITULO_RECOMENDACAO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O título da recomendação é obrigatório.'
    },
    TITULO_RECOMENDACAO_INVALIDO: {
        status: 422,
        mensagem: 'O título da recomendação deve ter no máximo 45 caracteres.'
    },
    DESCRICAO_RECOMENDACAO_OBRIGATORIA: {
        status: 400,
        mensagem: 'A descrição da recomendação é obrigatória.'
    },
    IMPACTO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O impacto da recomendação é obrigatório.'
    },
    IMPACTO_INVALIDO: {
        status: 422,
        mensagem: 'O impacto informado é inválido.'
    },
    ID_RECOMENDACAO_INVALIDO: {
        status: 400,
        mensagem: 'O ID da recomendação informado é inválido.'
    },
    RECOMENDACAO_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Recomendação não encontrada.'
    },
    ERRO_CRIAR_RECOMENDACAO: {
        status: 500,
        mensagem: 'Não foi possível criar a recomendação.'
    },
    ERRO_BUSCAR_RECOMENDACAO: {
        status: 500,
        mensagem: 'Não foi possível consultar a recomendação.'
    },
    ERRO_BUSCAR_RECOMENDACOES: {
        status: 500,
        mensagem: 'Não foi possível consultar as recomendações.'
    },
    ERRO_ATUALIZAR_RECOMENDACAO: {
        status: 500,
        mensagem: 'Não foi possível atualizar a recomendação.'
    },
    ERRO_DELETAR_RECOMENDACAO: {
        status: 500,
        mensagem: 'Não foi possível excluir a recomendação.'
    },
    ERRO_GERAR_RECOMENDACAO_IA: {
        status: 502,
        mensagem: 'Não foi possível gerar a recomendação com a IA.'
    },

    // ==========================================
    // CATEGORIA DE RECOMENDAÇÃO (tbl_categoria_recomendacao)
    // ==========================================
    CATEGORIA_RECOMENDACAO_CRIADA: {
        status: 201,
        mensagem: 'Categoria de recomendação criada com sucesso.'
    },
    CATEGORIA_RECOMENDACAO_ENCONTRADA: {
        status: 200,
        mensagem: 'Categoria de recomendação encontrada com sucesso.'
    },
    CATEGORIAS_RECOMENDACAO_ENCONTRADAS: {
        status: 200,
        mensagem: 'Categorias de recomendação consultadas com sucesso.'
    },
    CATEGORIA_RECOMENDACAO_ATUALIZADA: {
        status: 200,
        mensagem: 'Categoria de recomendação atualizada com sucesso.'
    },
    CATEGORIA_RECOMENDACAO_DELETADA: {
        status: 200,
        mensagem: 'Categoria de recomendação excluída com sucesso.'
    },
    NOME_CATEGORIA_RECOMENDACAO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O nome da categoria de recomendação é obrigatório.'
    },
    NOME_CATEGORIA_RECOMENDACAO_INVALIDO: {
        status: 422,
        mensagem: 'O nome da categoria de recomendação deve ter no máximo 80 caracteres.'
    },
    ID_CATEGORIA_RECOMENDACAO_INVALIDO: {
        status: 400,
        mensagem: 'O ID da categoria de recomendação informado é inválido.'
    },
    CATEGORIA_RECOMENDACAO_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Categoria de recomendação não encontrada.'
    },
    CATEGORIA_RECOMENDACAO_EXISTENTE: {
        status: 409,
        mensagem: 'Esta categoria de recomendação já está cadastrada.'
    },
    CATEGORIA_RECOMENDACAO_EM_USO: {
        status: 409,
        mensagem: 'Não é possível excluir a categoria pois existem recomendações vinculadas a ela.'
    },
    ERRO_CRIAR_CATEGORIA_RECOMENDACAO: {
        status: 500,
        mensagem: 'Não foi possível criar a categoria de recomendação.'
    },
    ERRO_BUSCAR_CATEGORIA_RECOMENDACAO: {
        status: 500,
        mensagem: 'Não foi possível consultar a categoria de recomendação.'
    },
    ERRO_BUSCAR_CATEGORIAS_RECOMENDACAO: {
        status: 500,
        mensagem: 'Não foi possível consultar as categorias de recomendação.'
    },
    ERRO_ATUALIZAR_CATEGORIA_RECOMENDACAO: {
        status: 500,
        mensagem: 'Não foi possível atualizar a categoria de recomendação.'
    },
    ERRO_DELETAR_CATEGORIA_RECOMENDACAO: {
        status: 500,
        mensagem: 'Não foi possível excluir a categoria de recomendação.'
    },

    // ==========================================
    // SIMULAÇÃO DE INVESTIMENTO (tbl_simulacao_investimento)
    // ==========================================
    SIMULACAO_INVESTIMENTO_CRIADA: {
        status: 201,
        mensagem: 'Simulação de investimento criada com sucesso.'
    },
    SIMULACAO_INVESTIMENTO_ENCONTRADA: {
        status: 200,
        mensagem: 'Simulação de investimento encontrada com sucesso.'
    },
    SIMULACOES_INVESTIMENTO_ENCONTRADAS: {
        status: 200,
        mensagem: 'Simulações de investimento consultadas com sucesso.'
    },
    SIMULACAO_INVESTIMENTO_ATUALIZADA: {
        status: 200,
        mensagem: 'Simulação de investimento atualizada com sucesso.'
    },
    SIMULACAO_INVESTIMENTO_DELETADA: {
        status: 200,
        mensagem: 'Simulação de investimento excluída com sucesso.'
    },
    NOME_SIMULACAO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O nome da simulação é obrigatório.'
    },
    NOME_SIMULACAO_INVALIDO: {
        status: 422,
        mensagem: 'O nome da simulação deve ter no máximo 45 caracteres.'
    },
    VALOR_INICIAL_OBRIGATORIO: {
        status: 400,
        mensagem: 'O valor inicial é obrigatório.'
    },
    VALOR_INICIAL_INVALIDO: {
        status: 422,
        mensagem: 'O valor inicial não pode ser negativo.'
    },
    APORTE_MENSAL_OBRIGATORIO: {
        status: 400,
        mensagem: 'O aporte mensal é obrigatório.'
    },
    APORTE_MENSAL_INVALIDO: {
        status: 422,
        mensagem: 'O aporte mensal não pode ser negativo.'
    },
    PRAZO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O prazo é obrigatório.'
    },
    PRAZO_INVALIDO: {
        status: 422,
        mensagem: 'O prazo deve ser um número inteiro maior que zero.'
    },
    RENTABILIDADE_OBRIGATORIA: {
        status: 400,
        mensagem: 'A rentabilidade é obrigatória.'
    },
    RENTABILIDADE_INVALIDA: {
        status: 422,
        mensagem: 'A rentabilidade informada é inválida.'
    },
    ID_SIMULACAO_INVESTIMENTO_INVALIDO: {
        status: 400,
        mensagem: 'O ID da simulação de investimento informado é inválido.'
    },
    SIMULACAO_INVESTIMENTO_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Simulação de investimento não encontrada.'
    },
    ERRO_CRIAR_SIMULACAO_INVESTIMENTO: {
        status: 500,
        mensagem: 'Não foi possível criar a simulação de investimento.'
    },
    ERRO_BUSCAR_SIMULACAO_INVESTIMENTO: {
        status: 500,
        mensagem: 'Não foi possível consultar a simulação de investimento.'
    },
    ERRO_BUSCAR_SIMULACOES_INVESTIMENTO: {
        status: 500,
        mensagem: 'Não foi possível consultar as simulações de investimento.'
    },
    ERRO_ATUALIZAR_SIMULACAO_INVESTIMENTO: {
        status: 500,
        mensagem: 'Não foi possível atualizar a simulação de investimento.'
    },
    ERRO_DELETAR_SIMULACAO_INVESTIMENTO: {
        status: 500,
        mensagem: 'Não foi possível excluir a simulação de investimento.'
    },
    ERRO_CALCULAR_INVESTIMENTO: {
        status: 500,
        mensagem: 'Não foi possível calcular a simulação de investimento.'
    },

    // ==========================================
    // SIMULAÇÃO DE AMORTIZAÇÃO (tbl_simulacao_amortizacao)
    // ==========================================
    SIMULACAO_AMORTIZACAO_CRIADA: {
        status: 201,
        mensagem: 'Simulação de amortização criada com sucesso.'
    },
    SIMULACAO_AMORTIZACAO_ENCONTRADA: {
        status: 200,
        mensagem: 'Simulação de amortização encontrada com sucesso.'
    },
    SIMULACOES_AMORTIZACAO_ENCONTRADAS: {
        status: 200,
        mensagem: 'Simulações de amortização consultadas com sucesso.'
    },
    SIMULACAO_AMORTIZACAO_ATUALIZADA: {
        status: 200,
        mensagem: 'Simulação de amortização atualizada com sucesso.'
    },
    SIMULACAO_AMORTIZACAO_DELETADA: {
        status: 200,
        mensagem: 'Simulação de amortização excluída com sucesso.'
    },
    SALDO_DEVEDOR_OBRIGATORIO: {
        status: 400,
        mensagem: 'O saldo devedor é obrigatório.'
    },
    SALDO_DEVEDOR_INVALIDO: {
        status: 422,
        mensagem: 'O saldo devedor deve ser maior que zero.'
    },
    TAXA_OBRIGATORIA: {
        status: 400,
        mensagem: 'A taxa de juros é obrigatória.'
    },
    TAXA_INVALIDA: {
        status: 422,
        mensagem: 'A taxa de juros informada é inválida.'
    },
    SISTEMA_CALCULO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O sistema de cálculo (ex.: SAC ou Price) é obrigatório.'
    },
    SISTEMA_CALCULO_INVALIDO: {
        status: 422,
        mensagem: 'O sistema de cálculo informado é inválido.'
    },
    MODALIDADE_OBRIGATORIA: {
        status: 400,
        mensagem: 'A modalidade é obrigatória.'
    },
    MODALIDADE_INVALIDA: {
        status: 422,
        mensagem: 'A modalidade informada é inválida.'
    },
    ID_SIMULACAO_AMORTIZACAO_INVALIDO: {
        status: 400,
        mensagem: 'O ID da simulação de amortização informado é inválido.'
    },
    SIMULACAO_AMORTIZACAO_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Simulação de amortização não encontrada.'
    },
    ERRO_CRIAR_SIMULACAO_AMORTIZACAO: {
        status: 500,
        mensagem: 'Não foi possível criar a simulação de amortização.'
    },
    ERRO_BUSCAR_SIMULACAO_AMORTIZACAO: {
        status: 500,
        mensagem: 'Não foi possível consultar a simulação de amortização.'
    },
    ERRO_BUSCAR_SIMULACOES_AMORTIZACAO: {
        status: 500,
        mensagem: 'Não foi possível consultar as simulações de amortização.'
    },
    ERRO_ATUALIZAR_SIMULACAO_AMORTIZACAO: {
        status: 500,
        mensagem: 'Não foi possível atualizar a simulação de amortização.'
    },
    ERRO_DELETAR_SIMULACAO_AMORTIZACAO: {
        status: 500,
        mensagem: 'Não foi possível excluir a simulação de amortização.'
    },
    ERRO_CALCULAR_AMORTIZACAO: {
        status: 500,
        mensagem: 'Não foi possível calcular a simulação de amortização.'
    },

    // ==========================================
    // POST (tbl_post)
    // ==========================================
    POST_CRIADO: {
        status: 201,
        mensagem: 'Publicação criada com sucesso.'
    },
    POST_ENCONTRADO: {
        status: 200,
        mensagem: 'Publicação encontrada com sucesso.'
    },
    POSTS_ENCONTRADOS: {
        status: 200,
        mensagem: 'Publicações consultadas com sucesso.'
    },
    POST_ATUALIZADO: {
        status: 200,
        mensagem: 'Publicação atualizada com sucesso.'
    },
    POST_DELETADO: {
        status: 200,
        mensagem: 'Publicação excluída com sucesso.'
    },
    CONTEUDO_POST_OBRIGATORIO: {
        status: 400,
        mensagem: 'O conteúdo da publicação é obrigatório.'
    },
    CONTEUDO_POST_INVALIDO: {
        status: 422,
        mensagem: 'O conteúdo da publicação é inválido ou excede o tamanho permitido.'
    },
    ID_POST_INVALIDO: {
        status: 400,
        mensagem: 'O ID da publicação informado é inválido.'
    },
    ID_POST_OBRIGATORIO: {
        status: 400,
        mensagem: 'O ID da publicação é obrigatório.'
    },
    POST_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'Publicação não encontrada.'
    },
    POST_INATIVO: {
        status: 403,
        mensagem: 'Esta publicação não está disponível.'
    },
    POST_SEM_PERMISSAO: {
        status: 403,
        mensagem: 'Você só pode alterar ou excluir as suas próprias publicações.'
    },
    ERRO_CRIAR_POST: {
        status: 500,
        mensagem: 'Não foi possível criar a publicação.'
    },
    ERRO_BUSCAR_POST: {
        status: 500,
        mensagem: 'Não foi possível consultar a publicação.'
    },
    ERRO_BUSCAR_POSTS: {
        status: 500,
        mensagem: 'Não foi possível consultar as publicações.'
    },
    ERRO_ATUALIZAR_POST: {
        status: 500,
        mensagem: 'Não foi possível atualizar a publicação.'
    },
    ERRO_DELETAR_POST: {
        status: 500,
        mensagem: 'Não foi possível excluir a publicação.'
    },

    // ==========================================
    // COMENTÁRIO (tbl_comentario)
    // ==========================================
    COMENTARIO_CRIADO: {
        status: 201,
        mensagem: 'Comentário criado com sucesso.'
    },
    COMENTARIO_ENCONTRADO: {
        status: 200,
        mensagem: 'Comentário encontrado com sucesso.'
    },
    COMENTARIOS_ENCONTRADOS: {
        status: 200,
        mensagem: 'Comentários consultados com sucesso.'
    },
    COMENTARIO_ATUALIZADO: {
        status: 200,
        mensagem: 'Comentário atualizado com sucesso.'
    },
    COMENTARIO_DELETADO: {
        status: 200,
        mensagem: 'Comentário excluído com sucesso.'
    },
    MENSAGEM_COMENTARIO_OBRIGATORIA: {
        status: 400,
        mensagem: 'O texto do comentário é obrigatório.'
    },
    MENSAGEM_COMENTARIO_INVALIDA: {
        status: 422,
        mensagem: 'O texto do comentário é inválido ou excede o tamanho permitido.'
    },
    ID_COMENTARIO_INVALIDO: {
        status: 400,
        mensagem: 'O ID do comentário informado é inválido.'
    },
    ID_COMENTARIO_OBRIGATORIO: {
        status: 400,
        mensagem: 'O ID do comentário é obrigatório.'
    },
    ID_COMENTARIO_PAI_INVALIDO: {
        status: 400,
        mensagem: 'O ID do comentário pai informado é inválido.'
    },
    COMENTARIO_PAI_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'O comentário que você está respondendo não foi encontrado.'
    },
    COMENTARIO_PAI_OUTRO_POST: {
        status: 422,
        mensagem: 'O comentário pai pertence a outra publicação.'
    },
    COMENTARIO_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'Comentário não encontrado.'
    },
    COMENTARIO_SEM_PERMISSAO: {
        status: 403,
        mensagem: 'Você só pode alterar ou excluir os seus próprios comentários.'
    },
    ERRO_CRIAR_COMENTARIO: {
        status: 500,
        mensagem: 'Não foi possível criar o comentário.'
    },
    ERRO_BUSCAR_COMENTARIO: {
        status: 500,
        mensagem: 'Não foi possível consultar o comentário.'
    },
    ERRO_BUSCAR_COMENTARIOS: {
        status: 500,
        mensagem: 'Não foi possível consultar os comentários.'
    },
    ERRO_ATUALIZAR_COMENTARIO: {
        status: 500,
        mensagem: 'Não foi possível atualizar o comentário.'
    },
    ERRO_DELETAR_COMENTARIO: {
        status: 500,
        mensagem: 'Não foi possível excluir o comentário.'
    },

    // ==========================================
    // CURTIDA EM POST (tbl_curtida_post)
    // ==========================================
    CURTIDA_POST_CRIADA: {
        status: 201,
        mensagem: 'Publicação curtida com sucesso.'
    },
    CURTIDAS_POST_ENCONTRADAS: {
        status: 200,
        mensagem: 'Curtidas da publicação consultadas com sucesso.'
    },
    CURTIDA_POST_REMOVIDA: {
        status: 200,
        mensagem: 'Curtida removida da publicação com sucesso.'
    },
    CURTIDA_POST_EXISTENTE: {
        status: 409,
        mensagem: 'Você já curtiu esta publicação.'
    },
    CURTIDA_POST_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Você ainda não curtiu esta publicação.'
    },
    ERRO_CURTIR_POST: {
        status: 500,
        mensagem: 'Não foi possível curtir a publicação.'
    },
    ERRO_BUSCAR_CURTIDAS_POST: {
        status: 500,
        mensagem: 'Não foi possível consultar as curtidas da publicação.'
    },
    ERRO_REMOVER_CURTIDA_POST: {
        status: 500,
        mensagem: 'Não foi possível remover a curtida da publicação.'
    },

    // ==========================================
    // CURTIDA EM COMENTÁRIO (tbl_curtida_comentario)
    // ==========================================
    CURTIDA_COMENTARIO_CRIADA: {
        status: 201,
        mensagem: 'Comentário curtido com sucesso.'
    },
    CURTIDAS_COMENTARIO_ENCONTRADAS: {
        status: 200,
        mensagem: 'Curtidas do comentário consultadas com sucesso.'
    },
    CURTIDA_COMENTARIO_REMOVIDA: {
        status: 200,
        mensagem: 'Curtida removida do comentário com sucesso.'
    },
    CURTIDA_COMENTARIO_EXISTENTE: {
        status: 409,
        mensagem: 'Você já curtiu este comentário.'
    },
    CURTIDA_COMENTARIO_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Você ainda não curtiu este comentário.'
    },
    ERRO_CURTIR_COMENTARIO: {
        status: 500,
        mensagem: 'Não foi possível curtir o comentário.'
    },
    ERRO_BUSCAR_CURTIDAS_COMENTARIO: {
        status: 500,
        mensagem: 'Não foi possível consultar as curtidas do comentário.'
    },
    ERRO_REMOVER_CURTIDA_COMENTARIO: {
        status: 500,
        mensagem: 'Não foi possível remover a curtida do comentário.'
    },

    // ==========================================
    // DENÚNCIA (tbl_denuncia)
    // ==========================================
    DENUNCIA_CRIADA: {
        status: 201,
        mensagem: 'Denúncia registrada com sucesso. Obrigado por contribuir com a comunidade.'
    },
    DENUNCIA_ENCONTRADA: {
        status: 200,
        mensagem: 'Denúncia encontrada com sucesso.'
    },
    DENUNCIAS_ENCONTRADAS: {
        status: 200,
        mensagem: 'Denúncias consultadas com sucesso.'
    },
    DENUNCIA_ATUALIZADA: {
        status: 200,
        mensagem: 'Denúncia atualizada com sucesso.'
    },
    DENUNCIA_DELETADA: {
        status: 200,
        mensagem: 'Denúncia excluída com sucesso.'
    },
    TITULO_DENUNCIA_OBRIGATORIO: {
        status: 400,
        mensagem: 'O título da denúncia é obrigatório.'
    },
    TITULO_DENUNCIA_INVALIDO: {
        status: 422,
        mensagem: 'O título da denúncia deve ter no máximo 100 caracteres.'
    },
    DESCRICAO_DENUNCIA_OBRIGATORIA: {
        status: 400,
        mensagem: 'A descrição da denúncia é obrigatória.'
    },
    ID_DENUNCIA_INVALIDO: {
        status: 400,
        mensagem: 'O ID da denúncia informado é inválido.'
    },
    DENUNCIA_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Denúncia não encontrada.'
    },
    DENUNCIA_EXISTENTE: {
        status: 409,
        mensagem: 'Você já denunciou esta publicação.'
    },
    DENUNCIAR_PROPRIO_POST: {
        status: 422,
        mensagem: 'Você não pode denunciar a sua própria publicação.'
    },
    ERRO_CRIAR_DENUNCIA: {
        status: 500,
        mensagem: 'Não foi possível registrar a denúncia.'
    },
    ERRO_BUSCAR_DENUNCIA: {
        status: 500,
        mensagem: 'Não foi possível consultar a denúncia.'
    },
    ERRO_BUSCAR_DENUNCIAS: {
        status: 500,
        mensagem: 'Não foi possível consultar as denúncias.'
    },
    ERRO_ATUALIZAR_DENUNCIA: {
        status: 500,
        mensagem: 'Não foi possível atualizar a denúncia.'
    },
    ERRO_DELETAR_DENUNCIA: {
        status: 500,
        mensagem: 'Não foi possível excluir a denúncia.'
    },

    // ==========================================
    // CATEGORIA DE DENÚNCIA (tbl_categoria_denuncia)
    // ==========================================
    CATEGORIA_DENUNCIA_CRIADA: {
        status: 201,
        mensagem: 'Categoria de denúncia criada com sucesso.'
    },
    CATEGORIA_DENUNCIA_ENCONTRADA: {
        status: 200,
        mensagem: 'Categoria de denúncia encontrada com sucesso.'
    },
    CATEGORIAS_DENUNCIA_ENCONTRADAS: {
        status: 200,
        mensagem: 'Categorias de denúncia consultadas com sucesso.'
    },
    CATEGORIA_DENUNCIA_ATUALIZADA: {
        status: 200,
        mensagem: 'Categoria de denúncia atualizada com sucesso.'
    },
    CATEGORIA_DENUNCIA_DELETADA: {
        status: 200,
        mensagem: 'Categoria de denúncia excluída com sucesso.'
    },
    NOME_CATEGORIA_DENUNCIA_OBRIGATORIO: {
        status: 400,
        mensagem: 'O nome da categoria de denúncia é obrigatório.'
    },
    NOME_CATEGORIA_DENUNCIA_INVALIDO: {
        status: 422,
        mensagem: 'O nome da categoria de denúncia deve ter no máximo 40 caracteres.'
    },
    ID_CATEGORIA_DENUNCIA_INVALIDO: {
        status: 400,
        mensagem: 'O ID da categoria de denúncia informado é inválido.'
    },
    CATEGORIA_DENUNCIA_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Categoria de denúncia não encontrada.'
    },
    CATEGORIA_DENUNCIA_EXISTENTE: {
        status: 409,
        mensagem: 'Esta categoria de denúncia já está cadastrada.'
    },
    CATEGORIA_DENUNCIA_EM_USO: {
        status: 409,
        mensagem: 'Não é possível excluir a categoria pois existem denúncias vinculadas a ela.'
    },
    ERRO_CRIAR_CATEGORIA_DENUNCIA: {
        status: 500,
        mensagem: 'Não foi possível criar a categoria de denúncia.'
    },
    ERRO_BUSCAR_CATEGORIA_DENUNCIA: {
        status: 500,
        mensagem: 'Não foi possível consultar a categoria de denúncia.'
    },
    ERRO_BUSCAR_CATEGORIAS_DENUNCIA: {
        status: 500,
        mensagem: 'Não foi possível consultar as categorias de denúncia.'
    },
    ERRO_ATUALIZAR_CATEGORIA_DENUNCIA: {
        status: 500,
        mensagem: 'Não foi possível atualizar a categoria de denúncia.'
    },
    ERRO_DELETAR_CATEGORIA_DENUNCIA: {
        status: 500,
        mensagem: 'Não foi possível excluir a categoria de denúncia.'
    },

    // ==========================================
    // BADGE (tbl_badge)
    // ==========================================
    BADGE_CRIADO: {
        status: 201,
        mensagem: 'Badge criado com sucesso.'
    },
    BADGE_ENCONTRADO: {
        status: 200,
        mensagem: 'Badge encontrado com sucesso.'
    },
    BADGES_ENCONTRADOS: {
        status: 200,
        mensagem: 'Badges consultados com sucesso.'
    },
    BADGE_ATUALIZADO: {
        status: 200,
        mensagem: 'Badge atualizado com sucesso.'
    },
    BADGE_DELETADO: {
        status: 200,
        mensagem: 'Badge excluído com sucesso.'
    },
    NOME_BADGE_OBRIGATORIO: {
        status: 400,
        mensagem: 'O nome do badge é obrigatório.'
    },
    NOME_BADGE_INVALIDO: {
        status: 422,
        mensagem: 'O nome do badge deve ter no máximo 45 caracteres.'
    },
    DESCRICAO_BADGE_OBRIGATORIA: {
        status: 400,
        mensagem: 'A descrição do badge é obrigatória.'
    },
    ICONE_BADGE_OBRIGATORIO: {
        status: 400,
        mensagem: 'O ícone do badge é obrigatório.'
    },
    ICONE_BADGE_INVALIDO: {
        status: 422,
        mensagem: 'O ícone do badge é inválido.'
    },
    XP_BADGE_OBRIGATORIO: {
        status: 400,
        mensagem: 'O XP do badge é obrigatório.'
    },
    XP_BADGE_INVALIDO: {
        status: 422,
        mensagem: 'O XP do badge deve ser um número inteiro não negativo.'
    },
    ID_BADGE_INVALIDO: {
        status: 400,
        mensagem: 'O ID do badge informado é inválido.'
    },
    BADGE_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'Badge não encontrado.'
    },
    BADGE_EXISTENTE: {
        status: 409,
        mensagem: 'Já existe um badge com este nome.'
    },
    BADGE_EM_USO: {
        status: 409,
        mensagem: 'Não é possível excluir o badge pois ele já foi conquistado por usuários.'
    },
    ERRO_CRIAR_BADGE: {
        status: 500,
        mensagem: 'Não foi possível criar o badge.'
    },
    ERRO_BUSCAR_BADGE: {
        status: 500,
        mensagem: 'Não foi possível consultar o badge.'
    },
    ERRO_BUSCAR_BADGES: {
        status: 500,
        mensagem: 'Não foi possível consultar os badges.'
    },
    ERRO_ATUALIZAR_BADGE: {
        status: 500,
        mensagem: 'Não foi possível atualizar o badge.'
    },
    ERRO_DELETAR_BADGE: {
        status: 500,
        mensagem: 'Não foi possível excluir o badge.'
    },

    // ==========================================
    // BADGE DO USUÁRIO (tbl_badge_usuario)
    // ==========================================
    BADGE_CONQUISTADO: {
        status: 201,
        mensagem: 'Parabéns! Você conquistou um novo badge.'
    },
    BADGES_USUARIO_ENCONTRADOS: {
        status: 200,
        mensagem: 'Badges do usuário consultados com sucesso.'
    },
    BADGE_USUARIO_REMOVIDO: {
        status: 200,
        mensagem: 'Badge removido do usuário com sucesso.'
    },
    BADGE_JA_CONQUISTADO: {
        status: 409,
        mensagem: 'O usuário já conquistou este badge.'
    },
    BADGE_USUARIO_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'O usuário não possui este badge.'
    },
    ERRO_CONQUISTAR_BADGE: {
        status: 500,
        mensagem: 'Não foi possível registrar a conquista do badge.'
    },
    ERRO_BUSCAR_BADGES_USUARIO: {
        status: 500,
        mensagem: 'Não foi possível consultar os badges do usuário.'
    },
    ERRO_REMOVER_BADGE_USUARIO: {
        status: 500,
        mensagem: 'Não foi possível remover o badge do usuário.'
    },

    // ==========================================
    // RANKING / XP (tbl_ranking)
    // ==========================================
    RANKING_ENCONTRADO: {
        status: 200,
        mensagem: 'Ranking consultado com sucesso.'
    },
    RANKING_USUARIO_ENCONTRADO: {
        status: 200,
        mensagem: 'Posição do usuário no ranking consultada com sucesso.'
    },
    RANKING_ATUALIZADO: {
        status: 200,
        mensagem: 'Ranking atualizado com sucesso.'
    },
    XP_ADICIONADO: {
        status: 200,
        mensagem: 'XP adicionado com sucesso.'
    },
    PONTOS_INVALIDOS: {
        status: 422,
        mensagem: 'A quantidade de pontos informada é inválida.'
    },
    XP_INVALIDO: {
        status: 422,
        mensagem: 'A quantidade de XP informada é inválida.'
    },
    RANKING_USUARIO_NAO_ENCONTRADO: {
        status: 404,
        mensagem: 'O usuário ainda não possui posição no ranking.'
    },
    ERRO_BUSCAR_RANKING: {
        status: 500,
        mensagem: 'Não foi possível consultar o ranking.'
    },
    ERRO_ATUALIZAR_RANKING: {
        status: 500,
        mensagem: 'Não foi possível atualizar o ranking.'
    },
    ERRO_ADICIONAR_XP: {
        status: 500,
        mensagem: 'Não foi possível adicionar XP ao usuário.'
    },
    // ==========================================
// BADGES / CONQUISTAS - SUCESSO
// ==========================================
BADGE_CRIADA: {
    status: 201,
    mensagem: 'Badge criada com sucesso.'
},
BADGE_ENCONTRADA: {
    status: 200,
    mensagem: 'Badge encontrada com sucesso.'
},
BADGES_LISTADAS: {
    status: 200,
    mensagem: 'Badges listadas com sucesso.'
},
BADGE_ATUALIZADA: {
    status: 200,
    mensagem: 'Badge atualizada com sucesso.'
},
BADGE_EXCLUIDA: {
    status: 200,
    mensagem: 'Badge excluída com sucesso.'
},
BADGE_CONQUISTADA: {
    status: 201,
    mensagem: 'Badge conquistada pelo usuário com sucesso.'
},
BADGE_JA_CONQUISTADA: {
    status: 200,
    mensagem: 'O usuário já possui esta badge.'
},
BADGES_USUARIO_ENCONTRADAS: {
    status: 200,
    mensagem: 'Badges do usuário consultadas com sucesso.'
},
BADGES_USUARIO_LISTADAS: {
    status: 200,
    mensagem: 'Lista de badges do usuário retornada com sucesso.'
},
BADGE_VINCULADA_USUARIO: {
    status: 201,
    mensagem: 'Badge vinculada ao usuário com sucesso.'
},
BADGE_DESVINCULADA_USUARIO: {
    status: 200,
    mensagem: 'Badge desvinculada do usuário com sucesso.'
},
PROGRESSO_BADGE_ATUALIZADO: {
    status: 200,
    mensagem: 'Progresso da badge atualizado com sucesso.'
},
BADGES_ATUALIZADAS: {
    status: 200,
    mensagem: 'Badges atualizadas com sucesso.'
},
BADGE_VALIDADA: {
    status: 200,
    mensagem: 'Badge validada com sucesso.'
}
    
}

module.exports = config_message