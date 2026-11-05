const { error } = require('./httpClient')
function number(value, name, min = 0, max = 1e12) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw error(`PARAMETRO_INVALIDO:${name}`)
    return value
}
function integer(value, name, min, max) {
    number(value, name, min, max)
    if (!Number.isInteger(value)) throw error(`PARAMETRO_INVALIDO:${name}`)
    return value
}
function text(value, name, pattern) {
    if (typeof value !== 'string' || !pattern.test(value)) throw error(`PARAMETRO_INVALIDO:${name}`)
    return value
}
function date(value, name = 'data') {
    text(value, name, /^\d{4}-\d{2}-\d{2}$/)
    const parsed = new Date(value + 'T00:00:00Z')
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw error(`PARAMETRO_INVALIDO:${name}`)
    return value
}
function period(start, end, maxDays = 3660) {
    date(start, 'inicio'); date(end, 'fim')
    const days = (Date.parse(end) - Date.parse(start)) / 86400000
    if (days < 0 || days > maxDays) throw error('PERIODO_INVALIDO')
}
const numeric = value => (typeof value === 'number' && Number.isFinite(value)) ? value : null
const requiredNumber = value => { const result = numeric(value); if (result === null) throw error('RESPOSTA_INVALIDA'); return result }
const isoDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && Number.isFinite(Date.parse(value)) ? value : null
const brDate = value => { if (typeof value !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) throw error('RESPOSTA_INVALIDA'); return date(value.split('/').reverse().join('-')) }
function objectArgs(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) throw error('ARGUMENTOS_INVALIDOS')
    return value
}
module.exports = { number, integer, text, date, period, numeric, requiredNumber, isoDate, brDate, objectArgs }
