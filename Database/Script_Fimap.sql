DROP DATABASE IF EXISTS db_fimap_2026;

CREATE DATABASE IF NOT EXISTS db_fimap_2026;
USE db_fimap_2026;

# ------------------- USUARIO --------------------
# cria tabela tbl_usuario
CREATE TABLE IF NOT EXISTS tbl_usuario (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    cpf CHAR(11) NOT NULL,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(80) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    xp_usuario INT UNSIGNED NOT NULL DEFAULT 0,
	nivel_total INT UNSIGNED NOT NULL DEFAULT 1,
    foto_perfil VARCHAR(255),
    nome_exibicao VARCHAR(80),
    username_social VARCHAR(80),
    biografia_social VARCHAR(250),
    localizacao_estado VARCHAR(100),
    visibilidade TINYINT DEFAULT 1,
    
    UNIQUE(cpf),
    UNIQUE(email),
    UNIQUE(username),
    UNIQUE(username_social)
);

# ------------------- SEGUIDORES --------------------
# cria tabela tbl_seguidores
CREATE TABLE IF NOT EXISTS tbl_seguidores (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_seguidor INT NOT NULL,
    id_seguindo INT NOT NULL,
    
    CONSTRAINT FK_SEGUIDOR_SEGUIDORES
    FOREIGN KEY (id_seguidor)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    CONSTRAINT FK_SEGUINDO_SEGUIDORES
    FOREIGN KEY (id_seguindo)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    UNIQUE(id_seguidor, id_seguindo)
);

# ------------------- NOTIFICACAO --------------------
# cria tabela tbl_notificacao
CREATE TABLE IF NOT EXISTS tbl_notificacao (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    icone VARCHAR(255) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    conteudo VARCHAR(200) NOT NULL,
    data_criacao DATETIME NOT NULL,
    lida TINYINT NOT NULL,
    id_usuario INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_NOTIFICACAO
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    INDEX IDX_NOTIFICACAO_USUARIO_LIDA (id_usuario, lida)
);

# ------------------- CONFIGURAÇÕES --------------------
# cria tabela tbl_configuracoes
CREATE TABLE IF NOT EXISTS tbl_configuracoes (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    notificacao TINYINT NOT NULL DEFAULT 0,
    alerta TINYINT NOT NULL DEFAULT 0,
    relatorio TINYINT NOT NULL DEFAULT 0,
	recomendacao TINYINT NOT NULL DEFAULT 1,
    topicos TINYINT NOT NULL DEFAULT 1,
    id_usuario INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_CONFIGURACOES
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    UNIQUE(id_usuario)
);

# ------------------- CODIGO OTP --------------------
# cria tabela tbl_codigo_otp
CREATE TABLE IF NOT EXISTS tbl_codigo_otp (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    codigo CHAR(6) NOT NULL,
    ativo TINYINT NOT NULL,
    data_expiracao DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_CODIGOOTP
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    INDEX IDX_OTP_USUARIO_ATIVO (id_usuario, ativo)
);

# ------------------- CONEXAO OPEN FINANCE --------------------
# cria tabela tbl_conexao_open_finance
CREATE TABLE IF NOT EXISTS tbl_conexao_open_finance (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    status TINYINT NOT NULL,
    consentimento_api VARCHAR(255) NULL,
    ultima_sincronizacao DATETIME NULL,
    provedor VARCHAR(30) NULL,
    external_connection_id VARCHAR(255) NULL,
    id_usuario INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_CONEXAOOPENFINANCE
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    UNIQUE(provedor, external_connection_id)
);

# ------------------- DISPOSITIVO --------------------
# cria tabela tbl_dispositivo
CREATE TABLE IF NOT EXISTS tbl_dispositivo (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(67) NOT NULL,
    sistema_operacional VARCHAR(24) NOT NULL,
    identificador VARCHAR(64) NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,

    CONSTRAINT FK_USUARIO_DISPOSITIVO
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
     UNIQUE(id_usuario, identificador)
);

# ------------------- SESSAO --------------------
# cria tabela tbl_sessao
CREATE TABLE IF NOT EXISTS tbl_sessao (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    refresh_token_hash CHAR(64) NOT NULL,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_expiracao DATETIME NOT NULL,
    ultimo_uso DATETIME,
    data_revogacao DATETIME,
    id_usuario INT NOT NULL,
    id_dispositivo INT,

    CONSTRAINT FK_USUARIO_SESSAO
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_DISPOSITIVO_SESSAO
    FOREIGN KEY (id_dispositivo)
    REFERENCES tbl_dispositivo (id)
    ON DELETE CASCADE,

    UNIQUE(refresh_token_hash),
    INDEX IDX_SESSAO_USUARIO_REVOGACAO (id_usuario, data_revogacao)
);

# ------------------- CHAT --------------------
# cria tabela tbl_chat
CREATE TABLE IF NOT EXISTS tbl_chat (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
	data_criacao DATETIME NOT NULL,
	id_usuario INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_CHAT
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE
);

# ------------------- MENSAGEM --------------------
# cria tabela tbl_mensagem
CREATE TABLE IF NOT EXISTS tbl_mensagem (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    conteudo TEXT NOT NULL,
    data_envio DATETIME NOT NULL,
    papel TINYINT NOT NULL,
    id_chat INT NOT NULL,
    
    CONSTRAINT FK_CHAT_MENSAGEM
    FOREIGN KEY (id_chat)
    REFERENCES tbl_chat (id)
    ON DELETE CASCADE,
    
    INDEX IDX_MENSAGEM_CHAT_DATA (id_chat, data_envio)
);

# ------------------- CATEGORIA META --------------------
# cria tabela tbl_categoria_meta
CREATE TABLE IF NOT EXISTS tbl_categoria_meta (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(80) NOT NULL
);

# ------------------- META FINANCEIRA --------------------
# cria tabela tbl_meta_financeira
CREATE TABLE IF NOT EXISTS tbl_meta_financeira (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor_inicio DECIMAL(15,2) NOT NULL,
    valor_desejado DECIMAL(15,2) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    data_alvo DATETIME NOT NULL,
    status TINYINT NOT NULL,
    id_categoria INT NOT NULL,
    id_usuario INT NOT NULL,
    
    CONSTRAINT FK_CATEGORIA_META
    FOREIGN KEY (id_categoria)
    REFERENCES tbl_categoria_meta (id)
    ON DELETE CASCADE,
    
    CONSTRAINT FK_USUARIO_META
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    INDEX IDX_META_USUARIO_STATUS (id_usuario, status)
);

# ------------------- CATEGORIA RECOMENDACAO --------------------
# cria tabela tbl_categoria_recomendacao
CREATE TABLE IF NOT EXISTS tbl_categoria_recomendacao (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL
);

# ------------------- RECOMENDACAO IA --------------------
# cria tabela tbl_recomendacao_ia
CREATE TABLE IF NOT EXISTS tbl_recomendacao_ia (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(45) NOT NULL,
	descricao TEXT NOT NULL,
    impacto VARCHAR(45) NOT NULL,
    data_criacao DATETIME NOT NULL,
    status TINYINT NOT NULL,
    id_categoria INT NOT NULL,
    id_usuario INT NOT NULL,
    
    CONSTRAINT FK_CATEGORIA_RECOMENDACAOIA
    FOREIGN KEY (id_categoria)
    REFERENCES tbl_categoria_recomendacao (id)
    ON DELETE CASCADE,
    
    CONSTRAINT FK_USUARIO_RECOMENDACAOIA
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    INDEX IDX_RECOMENDACAO_USUARIO_STATUS (id_usuario, status)
);

# ------------------- SIMULACAO INVESTIMENTO --------------------
# cria tabela tbl_simulacao_investimento
CREATE TABLE IF NOT EXISTS tbl_simulacao_investimento (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
    descricao TEXT,
    valor_inicial DECIMAL(15,2) NOT NULL,
    aporte_mensal DECIMAL(15,2) NOT NULL,
    prazo INT NOT NULL,
    rentabilidade DECIMAL(5,2) NOT NULL,
    data_criacao DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_SIMULACAOINVESTIMENTO
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE
);

# ------------------- SIMULACAO AMORTIZACAO --------------------
# cria tabela tbl_simulacao_amortizacao
CREATE TABLE IF NOT EXISTS tbl_simulacao_amortizacao (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(45) NOT NULL,
    descricao TEXT,
    saldo_devedor DECIMAL (15,2) NOT NULL,
    prazo INT NOT NULL,
    taxa DECIMAL(5,2) NOT NULL,
    sistema_calculo VARCHAR(45) NOT NULL,
    aporte_mensal DECIMAL(15,2) NOT NULL,
    modalidade VARCHAR(45) NOT NULL,
    data_criacao DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_SIMULACAOAMORTIZACAO
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE
);


# ------------------- BADGE --------------------
# cria tabela tbl_badge
CREATE TABLE IF NOT EXISTS tbl_badge (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    icone VARCHAR(255) NOT NULL,
    nome VARCHAR(45) NOT NULL,
    descricao TEXT NOT NULL,
    xp INT NOT NULL
);

# ------------------- BADGE USUARIO --------------------
# cria tabela tbl_badge_usuario
CREATE TABLE IF NOT EXISTS tbl_badge_usuario (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data_conquista DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    id_badge INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_BADGEUSUARIO
	FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    CONSTRAINT FK_BADGE_BADGEUSUARIO
    FOREIGN KEY (id_badge)
    REFERENCES tbl_badge (id)
    ON DELETE CASCADE,
    
	UNIQUE(id_usuario, id_badge)
);

# ------------------- RANKING --------------------
# cria tabela tbl_ranking
CREATE TABLE IF NOT EXISTS tbl_ranking (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    posicao INT NOT NULL,
    pontos_total INT NOT NULL,
    id_usuario INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_RANKING
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    UNIQUE(id_usuario),
	INDEX IDX_RANKING_POSICAO (posicao)
);

# ------------------- POST --------------------
# cria tabela tbl_post
CREATE TABLE IF NOT EXISTS tbl_post (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    conteudo TEXT NOT NULL,
    data_criacao DATETIME NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    data_atualizacao DATETIME,
    id_usuario INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_POST
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    INDEX IDX_POST_STATUS_DATA (status, data_criacao)
);

# ------------------- CURTIDA POST --------------------
# cria tabela tbl_curtida_post
CREATE TABLE IF NOT EXISTS tbl_curtida_post (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data_curtida DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    id_post INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_CURTIDAPOST
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    CONSTRAINT FK_POST_CURTIDAPOST
    FOREIGN KEY (id_post)
    REFERENCES tbl_post (id)
    ON DELETE CASCADE,
    
    UNIQUE (id_usuario, id_post)
);

# ------------------- COMENTARIO --------------------
# cria tabela tbl_comentario
CREATE TABLE IF NOT EXISTS tbl_comentario (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    mensagem TEXT NOT NULL,
    data_criacao DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    id_post INT NOT NULL,
    id_comentario_pai INT,
    
    CONSTRAINT FK_USUARIO_COMENTARIO
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    CONSTRAINT FK_POST_COMENTARIO
    FOREIGN KEY (id_post)
    REFERENCES tbl_post (id)
    ON DELETE CASCADE,
    
    CONSTRAINT FK_COMENTARIOPAI_COMENTARIO
    FOREIGN KEY (id_comentario_pai)
    REFERENCES tbl_comentario (id)
    ON DELETE CASCADE,
    
    INDEX IDX_COMENTARIO_POST_DATA (id_post, data_criacao)
);

# ------------------- CURTIDA COMENTARIO --------------------
# cria tabela tbl_curtida_comentario
CREATE TABLE IF NOT EXISTS tbl_curtida_comentario (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data_curtida DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    id_comentario INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_CURTIDACOMENTARIO
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,
    
    CONSTRAINT FK_comentario_CURTIDACOMENTARIO
    FOREIGN KEY (id_comentario)
    REFERENCES tbl_comentario (id)
    ON DELETE CASCADE,
    
    UNIQUE (id_usuario, id_comentario)
);

# ------------------- CATEGORIA DENUNCIA --------------------
# cria tabela tbl_categoria_denuncia
CREATE TABLE IF NOT EXISTS tbl_categoria_denuncia (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(40) NOT NULL
);

# ------------------- DENUNCIA --------------------
# cria tabela tbl_denuncia
CREATE TABLE IF NOT EXISTS tbl_denuncia (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    data_criacao DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    id_post INT NOT NULL,
    id_categoria INT NOT NULL,
    
    CONSTRAINT FK_USUARIO_DENUNCIA 
    FOREIGN KEY (id_usuario) 
    REFERENCES tbl_usuario (id) 
    ON DELETE CASCADE,
    
    CONSTRAINT FK_POST_DENUNCIA
    FOREIGN KEY (id_post)
    REFERENCES tbl_post (id)
    ON DELETE CASCADE,
    
    CONSTRAINT FK_CATEGORIA_DENUNCIA
    FOREIGN KEY (id_categoria)
    REFERENCES tbl_categoria_denuncia (id)
    ON DELETE CASCADE,
    
    UNIQUE(id_usuario, id_post)
);