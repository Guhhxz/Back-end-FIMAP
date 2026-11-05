/*
 * PARA QUE SERVE ESTE ARQUIVO
 *
 * Abre apenas Pluggy.html no próprio computador. Essa é a única página
 * que continua com essa opção, separada do chat publicado na Cloudflare.
 * O chat e a IA devem ser abertos pelo endereço publicado na internet.
 *
 * COMO USAR
 * Execute npm run pluggy:serve na pasta principal e abra o endereço
 * mostrado no terminal. Não é preciso ligar a IA no computador.
 * Pluggy.html foi preservado como estava: atualmente é um arquivo vazio.
 *
 * Este programa não entrega o chat nem recebe perguntas para a IA.
 * Se ele for apagado, apenas o comando pluggy:serve deixa de funcionar.
 */
const http = require('node:http')
const fs = require('node:fs/promises')
const path = require('node:path')

const pluggyFile = path.resolve(__dirname, '../frontend-test/Pluggy.html')
const port = Number(process.env.PLUGGY_TEST_PORT || 3000)

const server = http.createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405, { Allow: 'GET, HEAD' }).end()
        return
    }
    // Lê apenas o caminho pedido, sem precisar de um endereço de atendimento da IA.
    const pathname = req.url.split('?')[0]
    if (!['/', '/Pluggy.html'].includes(pathname)) {
        res.writeHead(404).end()
        return
    }
    try {
        const content = await fs.readFile(pluggyFile)
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(req.method === 'HEAD' ? undefined : content)
    } catch {
        res.writeHead(404).end('Pluggy.html não foi encontrado.')
    }
})
server.listen(port, '127.0.0.1', () => {
    console.log(`Somente Pluggy.html: http://localhost:${port}/Pluggy.html`)
    console.log('Chat e IA: https://back-end-fimap.pedroday813.workers.dev')
})
