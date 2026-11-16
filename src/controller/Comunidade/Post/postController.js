const config_message = require('../modulo/configMensagens.js')
const postDAO = require('../../../../model/DAO/Comunidade/Post/postDAO.js')
const { UploadArquivo, UploadUrl, ExcluirVarias } = require('../../services/cloudinary.js')

/* ============================ CONSTANTES ============================ */

// Valor da coluna "status" para post visível. Post removido tem status 0.
const STATUS_ATIVO = 1

// Tamanho máximo do texto de um post
const TEXTO_MAX_CARACTERES = 2000

// Máximo de fotos + vídeos por post (uploads vão em paralelo, então o limite
// também protege o servidor e o Cloudinary)
const ARQUIVOS_MAX_POR_POST = 10

// Tipos permitidos no array "conteudo" salvo no banco.
// Ex.: [{ tipo: 'texto', valor: 'Olá' }, { tipo: 'foto', valor: 'https://...' }]
const TIPOS = ['texto', 'foto', 'video']

/* ======================= HELPERS: RESPOSTAS/ENTRADA ======================= */

// Id inteiro maior que zero (recebe o resultado de Number(...); NaN é barrado)
const idValido = (id) => Number.isInteger(id) && id > 0

// { sucesso: false, mensagem } a partir de um objeto do configMensagens.js
const responderErro = (res, cfg) =>
    res.status(cfg.status).json({ sucesso: false, mensagem: cfg.mensagem })

// { sucesso: true, mensagem, ...dados }
const responderSucesso = (res, cfg, dados = {}) =>
    res.status(cfg.status).json({ sucesso: true, mensagem: cfg.mensagem, ...dados })

// Lê um id da URL aceitando mais de um nome de parâmetro
// (ex.: lerParam(req, 'usuarioId', 'id_usuario')). Sem nenhum deles, retorna NaN.
const lerParam = (req, ...nomes) => {
    for (const nome of nomes) {
        if (req.params?.[nome] !== undefined) return Number(req.params[nome])
    }

    return NaN
}

// Descobre qual usuário está fazendo a requisição.
// TEMPORÁRIO: lê o id do body ou da query, então qualquer pessoa pode enviar o id
// de outro usuário e se passar por ele. Quando o login com token estiver pronto,
// troque por req.usuario.id (vindo do middleware de autenticação).
const idDoUsuarioLogado = (req) => Number(req.body?.id_usuario ?? req.query?.id_usuario)

// Extrai o texto do post da requisição. O front pode mandar de três formas:
//   - array em req.body.conteudo: [{ tipo: 'texto', valor }]
//   - objeto em req.body.conteudo: { texto }
//   - multipart "cru": req.body['conteudo[texto]']
// Retorna: '' (sem texto, válido) | null (existe mas não é string) | string com trim
const lerTexto = (req) => {
    const conteudo = req.body?.conteudo

    let bruto = req.body?.['conteudo[texto]']

    if (Array.isArray(conteudo)) {
        const itemTexto = conteudo.find(item => item?.tipo === 'texto')
        bruto = itemTexto?.valor
    } else if (conteudo && typeof conteudo === 'object') {
        bruto = conteudo.texto ?? bruto
    }

    if (bruto === undefined) return ''
    if (typeof bruto !== 'string') return null

    return bruto.trim()
}

// Texto inválido = não é string (null) ou passa do limite
const textoInvalido = (texto) => texto === null || texto.length > TEXTO_MAX_CARACTERES

// URL válida e https
const urlHttpsValida = (valor) => {
    try {
        return new URL(valor).protocol === 'https:'
    } catch (_) {
        return false
    }
}

/* ========================= HELPERS: CONTEÚDO ========================= */

// Um item do array de conteúdo precisa ser objeto, ter "tipo" dentro de TIPOS
// e "valor" string. Usado para descartar itens corrompidos.
const itemValido = (item) =>
    item && typeof item === 'object' && TIPOS.includes(item.tipo) && typeof item.valor === 'string'

// Converte o que está na coluna "conteudo" para o array [{ tipo, valor }].
// A resposta da API precisa ser sempre a mesma, mesmo com formatos antigos no banco:
//   1. Array novo (string JSON ou já parseado): filtrado com itemValido.
//      '[]' é válido e devolve [] (post sem texto e sem mídia).
//   2. Objeto antigo { texto, foto: [], midia: [] }: "midia" vira tipo "video".
//   3. Texto puro (post muito antigo): vira [{ tipo: 'texto', valor }].
//   4. Qualquer coisa inválida ou vazia: [].
// O mysql2 devolve colunas JSON já parseadas, por isso o JSON.parse só roda em string.
const lerConteudo = (valor) => {
    let c = valor

    if (typeof valor === 'string') {
        try {
            c = JSON.parse(valor)
        } catch (_) {
            // Não é JSON: trata como texto puro
            return valor ? [{ tipo: 'texto', valor }] : []
        }
    }

    // Formato novo
    if (Array.isArray(c)) return c.filter(itemValido)

    // Formato antigo { texto, foto, midia }
    if (c && typeof c === 'object') {
        return [
            ...(c.texto ? [{ tipo: 'texto', valor: c.texto }] : []),
            ...(Array.isArray(c.foto) ? c.foto : []).map(v => ({ tipo: 'foto', valor: v })),
            ...(Array.isArray(c.midia) ? c.midia : []).map(v => ({ tipo: 'video', valor: v }))
        ]
    }

    // JSON válido que não é objeto nem array (ex.: um número): trata como texto
    return typeof valor === 'string' && valor ? [{ tipo: 'texto', valor }] : []
}

// Linha crua do banco -> objeto que a API devolve ao front.
// Number() no status evita erro quando o driver devolve string ou BigInt.
const formatarPost = (p) => ({
    id: p.id,
    data_criacao: p.data_criacao,
    data_atualizacao: p.data_atualizacao,
    status: Number(p.status) === STATUS_ATIVO ? 'ativo' : 'inativo',
    id_usuario: p.id_usuario,
    conteudo: lerConteudo(p.conteudo)
})

/* ========================== HELPERS: UPLOADS ========================== */

// Processa o resultado de um Promise.allSettled de uploads.
//   - Cada URL enviada com sucesso é anotada em "enviadas" (caderno de registro
//     usado pelo rollback do criarPost) e transformada em item de conteúdo.
//   - Se algum upload falhou, lança o primeiro erro DEPOIS de registrar os sucessos,
//     então nada fica órfão no Cloudinary.
//   - A ordem do resultado é a mesma da lista enviada.
const coletarUploads = (resultados, transformar, enviadas) => {
    const itens = []
    let erro = null

    resultados.forEach((resultado, i) => {
        if (resultado.status === 'fulfilled') {
            enviadas.push(resultado.value)
            itens.push(transformar(resultado.value, i))
        } else {
            erro = erro ?? resultado.reason
        }
    })

    if (erro) throw erro

    return itens
}

// Envia URLs externas ao Cloudinary. Devolve [{ tipo, valor: urlNova }]
const enviarUrls = async (itens, pasta, enviadas) => {
    const resultados = await Promise.allSettled(
        itens.map(async item => UploadUrl(item.valor, pasta, item.tipo))
    )

    return coletarUploads(
        resultados,
        (url, i) => ({ tipo: itens[i].tipo, valor: url }),
        enviadas
    )
}

// Envia arquivos do multer (buffer + mimetype) ao Cloudinary em paralelo.
// O tipo vem do mimetype ('video/...' vira video, o resto vira foto), não do nome do campo.
// Lista vazia devolve [] sem chamar o Cloudinary.
const enviarArquivos = async (arquivos, pasta, enviadas) => {
    const resultados = await Promise.allSettled(
        arquivos.map(arquivo => UploadArquivo(arquivo, pasta))
    )

    return coletarUploads(
        resultados,
        (url, i) => ({
            tipo: arquivos[i].mimetype.startsWith('video/') ? 'video' : 'foto',
            valor: url
        }),
        enviadas
    )
}

// Rollback: apaga do Cloudinary as URLs recebidas. Não é handler Express.
// Nunca lança erro: se a limpeza falhar, só registra no console para não
// esconder o erro original que o usuário deveria receber.
const desfazerUploads = async (urls) => {
    if (!urls.length) return

    try {
        await ExcluirVarias(urls)
    } catch (erro) {
        console.error('Erro no rollback dos arquivos:', erro)
    }
}

/* ============================ ENDPOINTS ============================ */

// POST /criar
// Cria um post com texto, fotos e vídeos, todos OPCIONAIS (pode ser qualquer
// combinação, inclusive nenhuma: "conteudo" fica []). Passos:
//   1. Identifica o usuário e valida texto, itens, URLs e quantidade de arquivos.
//   2. Sobe URLs e arquivos ao Cloudinary (em paralelo).
//   3. Monta o array [{ tipo, valor }] (texto primeiro, depois a mídia).
//   4. Grava o array como JSON na coluna "conteudo".
//   5. Busca o post recém-criado e devolve formatado.
// Falhas: "enviadas" guarda as URLs já subidas. Se algo falhar ANTES do INSERT,
// o catch apaga esses arquivos. Depois do INSERT o post existe, então "enviadas"
// é zerada para que um erro posterior (ex.: no GetPostById) não apague arquivos
// de um post válido.
const criarPost = async (req, res) => {
    const enviadas = []

    try {
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        // Valida o usuário antes de qualquer upload ao Cloudinary
        if (!await postDAO.ExisteUsuario(id_usuario)) {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        const texto = lerTexto(req)

        if (textoInvalido(texto)) {
            return responderErro(res, config_message.CONTEUDO_POST_INVALIDO)
        }

        // Arquivos enviados pela galeria (multer)
        const fotos = req.files?.['conteudo[foto]'] ?? []
        const videos = req.files?.['conteudo[midia]'] ?? []
        const arquivos = [...fotos, ...videos]

        // Itens recebidos diretamente pelo JSON
        const conteudoRecebido = req.body?.conteudo
        const itensJSON = Array.isArray(conteudoRecebido) ? conteudoRecebido : []

        // Texto vazio é permitido (o texto é opcional); foto e vídeo precisam de valor
        if (itensJSON.some(item =>
            !itemValido(item) || (item.tipo !== 'texto' && !item.valor.trim())
        )) {
            return responderErro(res, config_message.CONTEUDO_POST_INVALIDO)
        }

        // Só fotos e vídeos enviados por URL (o texto já foi lido em lerTexto)
        const urls = itensJSON.filter(item => item.tipo === 'foto' || item.tipo === 'video')

        // Valida as URLs antes de iniciar os uploads
        if (urls.some(item => !urlHttpsValida(item.valor))) {
            return responderErro(res, config_message.CONTEUDO_POST_INVALIDO)
        }

        if (arquivos.length + urls.length > ARQUIVOS_MAX_POR_POST) {
            return responderErro(res, config_message.LIMITE_ARQUIVOS_POST)
        }

        const pasta = `posts/${id_usuario}`
        const conteudo = []

        if (texto) {
            conteudo.push({ tipo: 'texto', valor: texto })
        }

        conteudo.push(...await enviarUrls(urls, pasta, enviadas))
        conteudo.push(...await enviarArquivos(arquivos, pasta, enviadas))

        const id_post = await postDAO.CreatePost({
            conteudo: JSON.stringify(conteudo),
            id_usuario
        })

        // O post foi criado: não apagar os arquivos
        enviadas.length = 0

        const criado = await postDAO.GetPostById(id_post)

        return responderSucesso(res, config_message.POST_CRIADO, {
            post: formatarPost(criado)
        })

    } catch (error) {
        await desfazerUploads(enviadas)

        // Rede de segurança: usuário removido entre a validação e o INSERT (FK_USUARIO_POST)
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return responderErro(res, config_message.USUARIO_NAO_ENCONTRADO)
        }

        // O Cloudinary recusou a URL ou o arquivo (link inexistente, privado, corrompido...)
        if (error?.http_code === 400) {
            return responderErro(res, {
                status: 400,
                mensagem: 'Não foi possível carregar a foto ou o vídeo enviado. Verifique se o link é público e válido.'
            })
        }

        console.error('Erro ao criar post:', error)

        if (error.message === 'Tipo de arquivo não permitido.') {
            return responderErro(res, config_message.TIPO_ARQUIVO_NAO_PERMITIDO)
        }

        return responderErro(res, config_message.ERRO_CRIAR_POST)
    }
}

// GET /buscar/:postId
// Busca UM post ativo. Se não existe OU foi removido, a resposta é a mesma (404),
// para não revelar que um post removido existiu.
const buscarPostPorId = async (req, res) => {
    try {
        const id_post = lerParam(req, 'postId', 'id_post')

        if (!idValido(id_post)) {
            return responderErro(res, config_message.ID_POST_INVALIDO)
        }

        const post = await postDAO.GetPostById(id_post)

        if (!post || Number(post.status) !== STATUS_ATIVO) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        return responderSucesso(res, config_message.POST_ENCONTRADO, {
            post: formatarPost(post)
        })

    } catch (error) {
        console.error('Erro ao buscar post:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_POST)
    }
}

// GET /buscar/post/:usuarioId
// Lista os posts ATIVOS de um usuário (perfil público: o id vem da URL).
// Sem posts, a resposta é sucesso com lista vazia.
const listarPostsPorUsuario = async (req, res) => {
    try {
        const id_usuario = lerParam(req, 'usuarioId', 'id_usuario')

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.ID_USUARIO_INVALIDO)
        }

        const posts = await postDAO.GetAllPostsAtivosByIdUsuario(id_usuario)
        const formatados = posts.map(formatarPost)

        return responderSucesso(res, config_message.POSTS_ENCONTRADOS, {
            quantidade: formatados.length,
            posts: formatados
        })

    } catch (error) {
        console.error('Erro ao listar posts:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_POSTS)
    }
}

// GET /buscar/post-inativo/:usuarioId
// Lista os posts REMOVIDOS (status = 0) de um usuário.
// TEMPORÁRIO: o id vem da URL (com fallback para idDoUsuarioLogado), então qualquer
// pessoa consegue ver os removidos de outra. Com o login por token, use somente
// req.usuario.id para cada um ver só os próprios posts removidos.
const listarPostsInativos = async (req, res) => {
    try {
        const idDaUrl = lerParam(req, 'usuarioId', 'id_usuario')
        const id_usuario = Number.isNaN(idDaUrl) ? idDoUsuarioLogado(req) : idDaUrl

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        const posts = await postDAO.GetAllPostsInativosByIdUsuario(id_usuario)
        const formatados = posts.map(formatarPost)

        return responderSucesso(res, config_message.POSTS_ENCONTRADOS, {
            quantidade: formatados.length,
            posts: formatados
        })

    } catch (error) {
        console.error('Erro ao listar posts removidos:', error)
        return responderErro(res, config_message.ERRO_BUSCAR_POSTS)
    }
}

// PATCH /atualizar/:postId
// Edita SOMENTE o texto do post; fotos e vídeos ficam como estavam.
// Ordem das verificações: ids válidos -> texto válido -> post existe e ativo (404)
// -> post é do usuário logado (403).
// Novo conteúdo = texto novo na frente + mídia atual. Texto vazio remove o texto;
// sem mídia, o post fica com conteudo = [] (permitido).
const atualizarPost = async (req, res) => {
    try {
        const id_post = lerParam(req, 'postId', 'id_post')
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_post)) return responderErro(res, config_message.ID_POST_INVALIDO)
        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)

        const texto = lerTexto(req)

        if (textoInvalido(texto)) {
            return responderErro(res, config_message.CONTEUDO_POST_INVALIDO)
        }

        const existente = await postDAO.GetPostById(id_post)

        if (!existente || Number(existente.status) !== STATUS_ATIVO) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        // Number() dos dois lados: o driver pode devolver o id como string ou BigInt
        if (Number(existente.id_usuario) !== id_usuario) {
            return responderErro(res, config_message.POST_SEM_PERMISSAO)
        }

        const midias = lerConteudo(existente.conteudo).filter(item => item.tipo !== 'texto')
        const conteudo = texto ? [{ tipo: 'texto', valor: texto }, ...midias] : midias

        const linhasAtualizadas = await postDAO.UpdatePost({
            id: id_post,
            id_usuario,
            conteudo: JSON.stringify(conteudo)
        })

        // Post removido entre a consulta e o update
        if (!linhasAtualizadas) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        const atualizado = await postDAO.GetPostById(id_post)

        return responderSucesso(res, config_message.POST_ATUALIZADO, {
            post: formatarPost(atualizado)
        })

    } catch (error) {
        console.error('Erro ao atualizar post:', error)
        return responderErro(res, config_message.ERRO_ATUALIZAR_POST)
    }
}

// PATCH /deletar/:postId
// Exclusão LÓGICA: o registro continua no banco, só muda o status para 0 (por isso
// aparece em listarPostsInativos). Os arquivos continuam no Cloudinary, o que
// permite restaurar o post, mas ocupa espaço.
// Mesmas verificações do atualizarPost: ids válidos, post existe e ativo, e é do usuário.
const deletarPost = async (req, res) => {
    try {
        const id_post = lerParam(req, 'postId', 'id_post')
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_post)) return responderErro(res, config_message.ID_POST_INVALIDO)
        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)

        const existente = await postDAO.GetPostById(id_post)

        if (!existente || Number(existente.status) !== STATUS_ATIVO) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        if (Number(existente.id_usuario) !== id_usuario) {
            return responderErro(res, config_message.POST_SEM_PERMISSAO)
        }

        const linhasRemovidas = await postDAO.DeletePost(id_post, id_usuario)

        // Post já removido entre a consulta e o update
        if (!linhasRemovidas) {
            return responderErro(res, config_message.POST_NAO_ENCONTRADO)
        }

        return responderSucesso(res, config_message.POST_DELETADO)

    } catch (error) {
        console.error('Erro ao remover post:', error)
        return responderErro(res, config_message.ERRO_DELETAR_POST)
    }
}

module.exports = {
    criarPost,
    buscarPostPorId,
    listarPostsPorUsuario,
    listarPostsInativos,
    atualizarPost,
    deletarPost
}