const config_message = require('../modulo/configMensagens.js')
const postDAO = require('../../../model/DAO/Post/postDAO.js')
const { UploadArquivo, UploadUrl, ExcluirVarias } = require('../../services/cloudinary.js')
// ============================================================
// CONSTANTES
// ============================================================

// Valor da coluna "status" para post visível. Post removido tem status 0.
const STATUS_ATIVO = 1

// Tamanho máximo do texto de um post. Evita textos gigantes no banco.
const TEXTO_MAX_CARACTERES = 2000

// Quantidade máxima de fotos + vídeos por post. Como os uploads vão em paralelo,
// o limite também evita sobrecarregar o servidor e o Cloudinary.
const ARQUIVOS_MAX_POR_POST = 10

// Tipos permitidos dentro do array "conteudo" salvo no banco.
// Exemplo: [{ tipo: 'texto', valor: 'Olá' }, { tipo: 'foto', valor: 'https://...' }]
const TIPOS = ['texto', 'foto', 'video']

// ============================================================
// HELPERS (funções auxiliares, não são rotas)
// ============================================================

// Confere se o id é um número inteiro maior que zero.
// Recebe o resultado de Number(...). Se vier NaN, texto ou negativo, retorna false.
// Por isso Number("12abc") (NaN) é barrado antes de chegar ao banco.
const idValido = (id) => Number.isInteger(id) && id > 0

// Envia uma resposta de ERRO no padrão do projeto: { sucesso: false, mensagem }.
// Recebe um objeto do configMensagens.js (ex.: config_message.POST_NAO_ENCONTRADO),
// que traz o código HTTP (status) e o texto (mensagem).
// Se o objeto não tiver "status", res.status(undefined) lança erro.
const responderErro = (res, cfg) =>
    res.status(cfg.status).json({ sucesso: false, mensagem: cfg.mensagem })

// Envia uma resposta de SUCESSO no padrão do projeto: { sucesso: true, mensagem, ...dados }.
// O terceiro parâmetro é opcional e traz o que mais deve ir na resposta
// (ex.: { post } ou { quantidade, posts }). O spread (...dados) junta tudo no mesmo JSON.
const responderSucesso = (res, cfg, dados = {}) =>
    res.status(cfg.status).json({ sucesso: true, mensagem: cfg.mensagem, ...dados })

// Descobre qual usuário está fazendo a requisição.
// TEMPORÁRIO: lê o id do body ou da query string, então qualquer pessoa pode enviar o id de
// outro usuário e se passar por ele. Quando o login com token estiver pronto,
// troque por req.usuario.id (vindo do middleware de autenticação).
// Se o id não vier, Number(undefined) dá NaN e o idValido barra depois.
const idDoUsuarioLogado = (req) => Number(req.body?.id_usuario ?? req.query?.id_usuario)

// Extrai o texto do post da requisição.
// O front pode mandar o texto de duas formas:
//   - JSON ou multipart já parseado: req.body.conteudo.texto
//   - multipart "cru":               req.body['conteudo[texto]']
// Retornos possíveis:
//   - ''     → nenhum texto enviado (válido, o post pode não ter texto)
//   - null   → o valor existe mas não é string (ex.: número ou objeto), ou seja, inválido
//   - string → texto sem espaços nas pontas

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



const enviarUrls = async (itens, pasta, enviadas) => {
    const resultados = await Promise.allSettled(
        itens.map(async item => {
            const url = await UploadUrl(item.valor, pasta, item.tipo)

            return {
                tipo: item.tipo,
                valor: url
            }
        })
    )

    const conteudo = []
    let erro = null

    resultados.forEach(resultado => {
        if (resultado.status === 'fulfilled') {
            enviadas.push(resultado.value.valor)
            conteudo.push(resultado.value)
        } else {
            erro = erro ?? resultado.reason
        }
    })

    if (erro) throw erro

    return conteudo
}


// Confere se UM item do array de conteúdo tem o formato correto:
// precisa ser objeto, ter "tipo" dentro de TIPOS e "valor" do tipo string.
// Usado em lerConteudo para descartar itens corrompidos.
const itemValido = (item) =>
    item && typeof item === 'object' && TIPOS.includes(item.tipo) && typeof item.valor === 'string'

// Converte o que está na coluna "conteudo" do banco para o array [{ tipo, valor }].
// Existe porque o banco pode ter o conteúdo em formatos diferentes, e a resposta
// da API tem que ser sempre a mesma. Formatos aceitos:
//   1. Array novo (como string JSON ou já parseado): é só filtrado com itemValido.
//      Um array vazio ('[]') é válido e devolve [] (post sem texto e sem mídia).
//   2. Objeto antigo { texto, foto: [], midia: [] }: convertido para o array novo,
//      e "midia" vira tipo "video".
//   3. Texto puro (post muito antigo): vira [{ tipo: 'texto', valor }].
//   4. Qualquer coisa inválida ou vazia: retorna [].
// O mysql2 devolve colunas do tipo JSON já parseadas, por isso o
// JSON.parse só roda quando o valor chega como string.
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

// Transforma a linha crua do banco no objeto que a API devolve ao front.
// - status: número (1/0) vira texto ('ativo'/'inativo'). Number() evita erro quando
//   o driver devolve o valor como string ou BigInt.
// - conteudo: sempre passa por lerConteudo, então o front recebe sempre um array.
const formatarPost = (p) => ({
    id: p.id,
    data_criacao: p.data_criacao,
    data_atualizacao: p.data_atualizacao,
    status: Number(p.status) === STATUS_ATIVO ? 'ativo' : 'inativo',
    id_usuario: p.id_usuario,
    conteudo: lerConteudo(p.conteudo)
})

// Envia vários arquivos ao Cloudinary ao mesmo tempo e devolve os itens
// prontos para o array de conteúdo: [{ tipo: 'foto' | 'video', valor: url }].
// Parâmetros:
//   - arquivos: lista de arquivos do multer (cada um com buffer e mimetype)
//   - pasta:    pasta de destino no Cloudinary (ex.: 'posts/12')
//   - enviadas: array que serve como "caderno de registro". Cada URL enviada com sucesso
//               é anotada ali, para o catch do criarPost poder apagá-las se algo falhar depois.
// Detalhes:
//   - Usa Promise.allSettled, não Promise.all. Assim, se um upload falhar, os outros
//     terminam e suas URLs entram em "enviadas", e nada fica órfão no Cloudinary.
//   - O tipo vem do mimetype ('video/...' vira video, o resto vira foto), não do nome do campo.
//   - A ordem do resultado é a mesma dos arquivos enviados.
//   - Se qualquer upload falhou, lança o primeiro erro DEPOIS de registrar os sucessos.
//   - Se a lista de arquivos vier vazia, devolve [] sem chamar o Cloudinary.
const enviarArquivos = async (arquivos, pasta, enviadas) => {
    const resultados = await Promise.allSettled(arquivos.map(a => UploadArquivo(a, pasta)))
    const itens = []
    let erro = null

    resultados.forEach((r, i) => {
        if (r.status === 'fulfilled') {
            enviadas.push(r.value)
            itens.push({
                tipo: arquivos[i].mimetype.startsWith('video/') ? 'video' : 'foto',
                valor: r.value
            })
        } else {
            erro = erro ?? r.reason
        }
    })

    if (erro) throw erro
    return itens
}

// Rollback dos uploads: apaga do Cloudinary as URLs recebidas.
// NÃO é um handler Express (não recebe req/res). É chamada no catch do criarPost
// quando o post não foi criado, para não deixar arquivos órfãos gastando espaço.
// Nunca lança erro: se a limpeza falhar, só registra no console,
// para não esconder o erro original que o usuário deveria receber.
const desfazerUploads = async (urls) => {
    if (!urls.length) return

    try {
        await ExcluirVarias(urls)
    } catch (erro) {
        console.error('Erro no rollback dos arquivos:', erro)
    }
}

// ============================================================
// ENDPOINTS (funções ligadas às rotas)
// ============================================================

// POST /posts
// Cria um post com texto, fotos e vídeos. Os três são OPCIONAIS: o post pode ter
// qualquer combinação, inclusive nenhum (nesse caso "conteudo" fica []). Passo a passo:
//   1. Identifica o usuário e valida o texto e a quantidade de arquivos.
//   2. Sobe fotos e vídeos ao Cloudinary (em paralelo) e recebe as URLs.
//   3. Monta o array [{ tipo, valor }] (texto primeiro, depois a mídia).
//   4. Grava o array como JSON na coluna "conteudo".
//   5. Busca o post recém-criado e devolve formatado.
// Controle de falhas: "enviadas" guarda as URLs já subidas. Se algo falhar ANTES
// do INSERT, o catch apaga esses arquivos. Depois do INSERT o post existe, então
// "enviadas" é zerada (enviadas.length = 0) para que um erro posterior
// (ex.: no GetPostById) não apague arquivos de um post válido.

const criarPost = async (req, res) => {
    const enviadas = []

    try {
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_usuario)) {
            return responderErro(res, config_message.NAO_AUTENTICADO)
        }

        const texto = lerTexto(req)

        if (texto === null || texto.length > TEXTO_MAX_CARACTERES) {
            return responderErro(res, config_message.CONTEUDO_POST_INVALIDO)
        }

        // Arquivos enviados pela galeria através do Multer
        const fotos = req.files?.['conteudo[foto]'] ?? []
        const videos = req.files?.['conteudo[midia]'] ?? []
        const arquivos = [...fotos, ...videos]

        // Conteúdo recebido diretamente pelo JSON
        const conteudoRecebido = req.body?.conteudo
        const itensJSON = Array.isArray(conteudoRecebido)
            ? conteudoRecebido
            : []

        // Valida o formato dos itens recebidos pelo JSON
        if (itensJSON.some(item =>
            !itemValido(item) ||
            !item.valor.trim()
        )) {
            return responderErro(res, config_message.CONTEUDO_POST_INVALIDO)
        }

        // Separa somente imagens e vídeos enviados por URL
        const urls = itensJSON.filter(item =>
            item.tipo === 'foto' || item.tipo === 'video'
        )

        // Valida as URLs antes de iniciar os uploads
        for (const item of urls) {
            try {
                const endereco = new URL(item.valor)

                if (endereco.protocol !== 'https:') {
                    return responderErro(res, config_message.CONTEUDO_POST_INVALIDO)
                }
            } catch (_) {
                return responderErro(res, config_message.CONTEUDO_POST_INVALIDO)
            }
        }

        // Limite total de arquivos por publicação
        if (arquivos.length + urls.length > ARQUIVOS_MAX_POR_POST) {
            return responderErro(res, config_message.LIMITE_ARQUIVOS_POST)
        }

        const pasta = `posts/${id_usuario}`
        const conteudo = []

        // Adiciona o texto
        if (texto) {
            conteudo.push({
                tipo: 'texto',
                valor: texto
            })
        }

        // Envia URLs externas para o Cloudinary
        conteudo.push(
            ...await enviarUrls(urls, pasta, enviadas)
        )

        // Envia arquivos da galeria para o Cloudinary
        conteudo.push(
            ...await enviarArquivos(arquivos, pasta, enviadas)
        )

        // Salva o conteúdo com as URLs retornadas pelo Cloudinary
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

        console.error('Erro ao criar post:', error)

        if (error.message === 'Tipo de arquivo não permitido.') {
            return responderErro(res, config_message.TIPO_ARQUIVO_NAO_PERMITIDO)
        }

        return responderErro(res, config_message.ERRO_CRIAR_POST)
    }
}


// GET /posts/:postId
// Busca UM post pelo id. Só devolve posts ativos: se o post não existe OU foi
// removido, a resposta é a mesma (404), para não revelar que um post removido existiu.
const buscarPostPorId = async (req, res) => {
    try {
        const id_post = Number(req.params.postId)

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

// GET /usuarios/:usuarioId/posts
// Lista os posts ATIVOS de um usuário (perfil público). O id vem da URL,
// porque qualquer pessoa pode ver os posts de outra. Devolve também a "quantidade".
// Se o usuário não tiver posts, a resposta é sucesso com lista vazia (não é erro).
const listarPostsPorUsuario = async (req, res) => {
    try {
        const id_usuario = Number(req.params.usuarioId)

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

// GET /posts/removidos
// Lista os posts REMOVIDOS (status = 0) do usuário logado. Diferente da listagem
// pública, aqui o id NÃO vem da URL, vem do usuário logado, para que cada um
// só veja os próprios posts removidos. Depende de idDoUsuarioLogado,
// que ainda é temporário (ver aviso no helper).
const listarPostsInativos = async (req, res) => {
    try {
        const id_usuario = idDoUsuarioLogado(req)

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

// PUT /posts/:postId
// Edita SOMENTE o texto do post. Fotos e vídeos continuam como estavam. Ordem das verificações:
//   1. ids válidos (post e usuário)
//   2. texto válido
//   3. post existe e está ativo (senão 404)
//   4. o post é do usuário logado (senão 403)
// Para montar o novo conteúdo: pega o array atual, separa só a mídia (tudo que não é
// 'texto') e coloca o texto novo na frente. Se o texto vier vazio, o texto é removido
// do post. Se não sobrar mídia, o post fica com conteudo = [], o que é permitido.
const atualizarPost = async (req, res) => {
    try {
        const id_post = Number(req.params.postId)
        const id_usuario = idDoUsuarioLogado(req)

        if (!idValido(id_post)) return responderErro(res, config_message.ID_POST_INVALIDO)
        if (!idValido(id_usuario)) return responderErro(res, config_message.NAO_AUTENTICADO)

        const texto = lerTexto(req)

        if (texto === null || texto.length > TEXTO_MAX_CARACTERES) {
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

        const midias = lerConteudo(existente.conteudo).filter(i => i.tipo !== 'texto')
        const conteudo = texto ? [{ tipo: 'texto', valor: texto }, ...midias] : midias

        await postDAO.UpdatePost({
            id: id_post,
            id_usuario,
            conteudo: JSON.stringify(conteudo)
        })

        const atualizado = await postDAO.GetPostById(id_post)

        return responderSucesso(res, config_message.POST_ATUALIZADO, {
            post: formatarPost(atualizado)
        })
    } catch (error) {
        console.error('Erro ao atualizar post:', error)
        return responderErro(res, config_message.ERRO_ATUALIZAR_POST)
    }
}

// DELETE /posts/:postId
// Remove o post com exclusão LÓGICA: o registro continua no banco, só muda o status para 0
// (por isso aparece em listarPostsInativos). Os arquivos continuam no Cloudinary,
// o que permite restaurar o post depois, mas ocupa espaço. Mesmas verificações do
// atualizarPost: ids válidos, post existe e ativo, e pertence ao usuário logado.
const deletarPost = async (req, res) => {
    try {
        const id_post = Number(req.params.postId)
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

        await postDAO.DeletePost(id_post, id_usuario)

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