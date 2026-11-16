const cloudinary = require('cloudinary').v2

/* ============================ CONFIGURAÇÃO ============================ */

const VARIAVEIS_OBRIGATORIAS = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
]

// Avisa na subida (e não só no primeiro upload) se faltar algo no .env
const variaveisAusentes = VARIAVEIS_OBRIGATORIAS.filter(nome => !process.env[nome])

if (variaveisAusentes.length > 0) {
    console.warn(`Cloudinary: variáveis ausentes no .env: ${variaveisAusentes.join(', ')}`)
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp']
const TIPOS_VIDEO = ['video/mp4']

// O postController compara o error.message com este texto para responder
// TIPO_ARQUIVO_NAO_PERMITIDO. Se mudar aqui, mude lá também.
const ERRO_TIPO_NAO_PERMITIDO = 'Tipo de arquivo não permitido.'

/* ============================== UPLOADS ============================== */

// Upload de arquivo recebido pelo Multer (galeria). Retorna a secure_url
const UploadArquivo = (arquivo, pasta = 'posts') => new Promise((resolve, reject) => {
    const ehVideo = TIPOS_VIDEO.includes(arquivo.mimetype)
    const ehFoto = TIPOS_FOTO.includes(arquivo.mimetype)

    if (!ehVideo && !ehFoto) {
        return reject(new Error(ERRO_TIPO_NAO_PERMITIDO))
    }

    const stream = cloudinary.uploader.upload_stream(
        {
            folder: pasta,
            resource_type: ehVideo ? 'video' : 'image'
        },
        (error, result) => {
            if (error) return reject(error)

            resolve(result.secure_url)
        }
    )

    stream.end(arquivo.buffer)
})

// Upload de imagem ou vídeo recebido por URL (tipo: 'foto' | 'video'). Retorna a secure_url
const UploadUrl = async (url, pasta = 'posts', tipo = 'foto') => {
    try {
        if (new URL(url).protocol !== 'https:') {
            throw new Error('URL inválida. Utilize HTTPS.')
        }

        if (!['foto', 'video'].includes(tipo)) {
            throw new Error(ERRO_TIPO_NAO_PERMITIDO)
        }

        const resultado = await cloudinary.uploader.upload(url, {
            folder: pasta,
            resource_type: tipo === 'video' ? 'video' : 'image'
        })

        return resultado.secure_url
    } catch (error) {
        // 400 = o Cloudinary não conseguiu carregar a URL (é validação, o controller responde)
        if (error?.http_code !== 400) {
            console.error('Erro ao enviar URL para o Cloudinary:', error)
        }

        throw error
    }
}

/* ============================= EXCLUSÃO ============================= */

// Extrai { tipo, publicId } de uma URL do Cloudinary (ou null se não reconhecer).
// Ex.: .../image/upload/v123/posts/1/abc.jpg -> { tipo: 'image', publicId: 'posts/1/abc' }
const ExtrairPublicId = (url) => {
    const m = url.match(/\/(image|video)\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/)

    return m ? { tipo: m[1], publicId: m[2] } : null
}

// Apaga um arquivo pela URL. Retorna true se o Cloudinary confirmou
const ExcluirPorUrl = async (url) => {
    const info = ExtrairPublicId(url)

    if (!info) return false

    const resultado = await cloudinary.uploader.destroy(info.publicId, {
        resource_type: info.tipo,
        invalidate: true
    })

    return resultado.result === 'ok'
}

// Apaga várias URLs em paralelo. Retorna quantas foram apagadas (não lança erro)
const ExcluirVarias = async (urls = []) => {
    const resultados = await Promise.allSettled(urls.map(ExcluirPorUrl))

    return resultados.filter(
        resultado => resultado.status === 'fulfilled' && resultado.value
    ).length
}

module.exports = {
    UploadArquivo,
    UploadUrl,
    ExcluirPorUrl,
    ExcluirVarias
}