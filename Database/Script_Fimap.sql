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
    posicao INT,
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


ALTER TABLE tbl_meta_financeira
    ADD COLUMN aporte_mensal DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER valor_total,
    ADD COLUMN id_conta_vinculada INT NULL AFTER id_categoria;

ALTER TABLE tbl_meta_financeira
    ADD CONSTRAINT FK_CONEXAO_META
    FOREIGN KEY (id_conta_vinculada)
    REFERENCES tbl_conexao_open_finance (id)
    ON DELETE SET NULL;
    
ALTER TABLE tbl_categoria_meta
    ADD COLUMN id_usuario INT NULL AFTER nome;
    

ALTER TABLE tbl_categoria_meta
    ADD CONSTRAINT FK_USUARIO_CATEGORIAMETA
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE;
    
ALTER TABLE tbl_conexao_open_finance
	ADD COLUMN nome_instituicao VARCHAR(100) NULL AFTER external_connection_id;

DELIMITER $$


CREATE TRIGGER trg_apos_cadastro_configuracoes
AFTER INSERT ON tbl_usuario
FOR EACH ROW
BEGIN
    INSERT INTO tbl_configuracoes (id_usuario)
    VALUES (NEW.id);
END$$


-- Inicializa também o ranking ao cadastrar usuário (complementa trg_apos_cadastro_configuracoes)

CREATE TRIGGER trg_apos_cadastro_ranking
AFTER INSERT ON tbl_usuario
FOR EACH ROW
BEGIN
    INSERT INTO tbl_ranking ( pontos_total, id_usuario)
    VALUES (0, NEW.id);
END$$

-- Ao conquistar badge: soma XP no usuário, recalcula nível, atualiza ranking e gera notificação

CREATE TRIGGER trg_apos_conquista_badge
AFTER INSERT ON tbl_badge_usuario
FOR EACH ROW
BEGIN
    DECLARE v_xp INT DEFAULT 0;
    DECLARE v_nome_badge VARCHAR(45);
    DECLARE v_novo_xp INT DEFAULT 0;

    SELECT xp, nome INTO v_xp, v_nome_badge
    FROM tbl_badge
    WHERE id = NEW.id_badge;

	UPDATE tbl_usuario SET xp_usuario = xp_usuario + v_xp WHERE id = NEW.id_usuario;
	SELECT xp_usuario INTO v_novo_xp FROM tbl_usuario WHERE id = NEW.id_usuario;
	UPDATE tbl_usuario SET nivel_total = FLOOR(v_novo_xp / 100) + 1 WHERE id = NEW.id_usuario;

    SELECT xp_usuario INTO v_novo_xp
    FROM tbl_usuario
    WHERE id = NEW.id_usuario;

    UPDATE tbl_ranking
    SET pontos_total = v_novo_xp
    WHERE id_usuario = NEW.id_usuario;

    INSERT INTO tbl_notificacao (icone, nome, conteudo, data_criacao, lida, id_usuario)
    VALUES ('🏅', 'Nova Conquista!', CONCAT('Você desbloqueou a badge: ', v_nome_badge), NOW(), 0, NEW.id_usuario);
END$$

-- Invalida códigos OTP anteriores ativos antes de gerar um novo para o usuário

CREATE TRIGGER trg_antes_inserir_otp
BEFORE INSERT ON tbl_codigo_otp
FOR EACH ROW
BEGIN
    UPDATE tbl_codigo_otp
    SET ativo = 0
    WHERE id_usuario = NEW.id_usuario AND ativo = 1;
END$$

-- Conclui a meta automaticamente quando valor_total atinge valor_desejado

CREATE TRIGGER trg_antes_atualizar_meta
BEFORE UPDATE ON tbl_meta_financeira
FOR EACH ROW
BEGIN
    IF NEW.valor_total >= NEW.valor_desejado AND OLD.status = 1 THEN
        SET NEW.status = 2; -- 2 = Concluída
        INSERT INTO tbl_notificacao (icone, nome, conteudo, data_criacao, lida, id_usuario)
        VALUES ('🎉', 'Meta Atingida!', CONCAT('Parabéns! Você concluiu a meta: ', NEW.nome), NOW(), 0, NEW.id_usuario);
    END IF;
END$$

-- Notifica o autor do post quando recebe uma curtida (se não for auto-curtida)

CREATE TRIGGER trg_apos_curtida_post
AFTER INSERT ON tbl_curtida_post
FOR EACH ROW
BEGIN
    DECLARE v_autor_post INT;
    DECLARE v_nome_curtidor VARCHAR(80);

    SELECT id_usuario INTO v_autor_post FROM tbl_post WHERE id = NEW.id_post;
    SELECT COALESCE(nome_exibicao, nome) INTO v_nome_curtidor FROM tbl_usuario WHERE id = NEW.id_usuario;

    IF v_autor_post <> NEW.id_usuario THEN
        INSERT INTO tbl_notificacao (icone, nome, conteudo, data_criacao, lida, id_usuario)
        VALUES ('❤️', 'Nova curtida', CONCAT(v_nome_curtidor, ' curtiu sua publicação.'), NOW(), 0, v_autor_post);
    END IF;
END$$

-- Auto-moderação: oculta o post (status = 0) se atingir 5 denúncias

CREATE TRIGGER trg_apos_denuncia_post
AFTER INSERT ON tbl_denuncia
FOR EACH ROW
BEGIN
    DECLARE v_total_denuncias INT DEFAULT 0;

    SELECT COUNT(*) INTO v_total_denuncias
    FROM tbl_denuncia
    WHERE id_post = NEW.id_post;

    IF v_total_denuncias >= 5 THEN
        UPDATE tbl_post
        SET status = 0, data_atualizacao = NOW()
        WHERE id = NEW.id_post;
    END IF;
END$$

DELIMITER ;

-- Feed da Comunidade
CREATE OR REPLACE VIEW vw_feed_comunidade AS
SELECT
    p.id AS id_post,
    p.conteudo,
    p.data_criacao,
    p.data_atualizacao,
    u.id AS id_autor,
    COALESCE(u.nome_exibicao, u.nome) AS autor_nome,
    u.username_social,
    u.foto_perfil,
    u.nivel_total,
    (SELECT COUNT(*) FROM tbl_curtida_post cp WHERE cp.id_post = p.id) AS total_curtidas,
    (SELECT COUNT(*) FROM tbl_comentario c WHERE c.id_post = p.id) AS total_comentarios
FROM tbl_post p
INNER JOIN tbl_usuario u ON u.id = p.id_usuario
WHERE p.status = 1 AND u.visibilidade = 1
ORDER BY p.data_criacao DESC;

-- Perfil Completo do Usuário
CREATE OR REPLACE VIEW vw_perfil_usuario AS
SELECT
    u.id,
    u.nome,
    u.email,
    u.username,
    u.nome_exibicao,
    u.username_social,
    u.biografia_social,
    u.localizacao_estado,
    u.foto_perfil,
    u.visibilidade,
    u.xp_usuario,
    u.nivel_total,
    COALESCE(r.posicao, 0) AS ranking_posicao,
    (SELECT COUNT(*) FROM tbl_seguidores s WHERE s.id_seguindo = u.id) AS total_seguidores,
    (SELECT COUNT(*) FROM tbl_seguidores s WHERE s.id_seguidor = u.id) AS total_seguindo,
    (SELECT COUNT(*) FROM tbl_badge_usuario bu WHERE bu.id_usuario = u.id) AS total_badges
FROM tbl_usuario u
LEFT JOIN tbl_ranking r ON r.id_usuario = u.id;

-- Metas Financeiras com Progresso e Instituição
CREATE OR REPLACE VIEW vw_metas_detalhadas AS
SELECT
    m.id,
    m.nome,
    m.descricao,
    m.valor_inicio,
    m.valor_desejado,
    m.valor_total,
    m.aporte_mensal,
    ROUND((m.valor_total / NULLIF(m.valor_desejado, 0)) * 100, 2) AS percentual_concluido,
    GREATEST(DATEDIFF(m.data_alvo, NOW()), 0) AS dias_restantes,
    m.data_alvo,
    m.status,
    m.id_usuario,
    cm.nome AS categoria_nome,
    cof.nome_instituicao AS instituicao_vinculada
FROM tbl_meta_financeira m
INNER JOIN tbl_categoria_meta cm ON cm.id = m.id_categoria
LEFT JOIN tbl_conexao_open_finance cof ON cof.id = m.id_conta_vinculada;

-- 4. Ranking Público
CREATE OR REPLACE VIEW vw_ranking_geral AS
SELECT
    r.posicao,
    r.pontos_total,
    u.id AS id_usuario,
    COALESCE(u.nome_exibicao, u.nome) AS nome_exibicao,
    u.username_social,
    u.foto_perfil,
    u.nivel_total
FROM tbl_ranking r
INNER JOIN tbl_usuario u ON u.id = r.id_usuario
WHERE u.visibilidade = 1
ORDER BY r.posicao ASC;

