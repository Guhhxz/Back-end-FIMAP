
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp']
const TIPOS_VIDEO = ['video/mp4']

// Upload de arquivo recebido pelo Multer (galeria)
const UploadArquivo = (arquivo, pasta = 'posts') => new Promise((resolve, reject) => {
    const ehVideo = TIPOS_VIDEO.includes(arquivo.mimetype)
    const ehFoto = TIPOS_FOTO.includes(arquivo.mimetype)

    if (!ehVideo && !ehFoto) {
        return reject(new Error('Tipo de arquivo não permitido.'))
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

// Upload de imagem ou vídeo recebido por URL
const UploadUrl = async (url, pasta = 'posts', tipo = 'foto') => {
    try {
        const endereco = new URL(url)

        if (endereco.protocol !== 'https:') {
            throw new Error('URL inválida. Utilize HTTPS.')
        }

        if (!['foto', 'video'].includes(tipo)) {
            throw new Error('Tipo de arquivo não permitido.')
        }

        const resultado = await cloudinary.uploader.upload(url, {
            folder: pasta,
            resource_type: tipo === 'video' ? 'video' : 'image'
        })

        return resultado.secure_url
    } catch (error) {
        console.error('Erro ao enviar URL para o Cloudinary:', error)
        throw error
    }
}

const ExtrairPublicId = (url) => {
    const m = url.match(/\/(image|video)\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/)

    return m
        ? { tipo: m[1], publicId: m[2] }
        : null
}

const ExcluirPorUrl = async (url) => {
    const info = ExtrairPublicId(url)

    if (!info) return false

    const resultado = await cloudinary.uploader.destroy(info.publicId, {
        resource_type: info.tipo,
        invalidate: true
    })

    return resultado.result === 'ok'
}

const ExcluirVarias = async (urls = []) => {
    const resultados = await Promise.allSettled(
        urls.map(ExcluirPorUrl)
    )

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
