/*
 * Este arquivo guarda o endereço da IA publicada na Cloudflare.
 * O atendimento das perguntas acontece na nuvem e não depende de um
 * programa de IA aberto no computador. Os programas do servidor usam
 * este mesmo endereço para evitar que cada um procure a IA em um lugar.
 * CLOUDFLARE_WORKER_URL permite escolher outro endereço publicado.
 */
const WORKER_URL_PADRAO = 'https://back-end-fimap.pedroday813.workers.dev/chat'

module.exports = { WORKER_URL_PADRAO }
