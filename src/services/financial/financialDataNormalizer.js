const { isoDate } = require('./validation')
function normalize(tipo, fonte, response, dados, { dataReferencia = null, unidade = null, observacoes = [], maxAgeDays = null } = {}) {
    const date = isoDate(dataReferencia)
    const age = date ? Math.max(0, (Date.parse(response.consultadoEm) - Date.parse(date)) / 86400000) : null
    return {
        tipo, fonte, dataReferencia: date, consultadoEm: response.consultadoEm,
        unidade, atrasoEstimadoMinutos: null, cache: response.cache || false,
        desatualizado: age === null ? null : maxAgeDays === null ? null : age > maxAgeDays,
        observacoes: [...observacoes, ...(date ? [] : ['Provedor não informou uma data de referência válida. Não tratar como dado atual verificado.'])],
        dados
    }
}
module.exports = { normalize }
