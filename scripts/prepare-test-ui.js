/*
 * PARA QUE SERVE ESTE ARQUIVO
 *
 * A página de teste precisa de alguns arquivos prontos para organizar os
 * textos, destacar trechos de código e ajudar a impedir que uma resposta
 * da IA coloque comandos perigosos dentro da página.
 *
 * Esses arquivos ficam instalados em node_modules, na pasta principal.
 * Este programa copia somente os arquivos necessários para
 * frontend-test/assets/vendor, onde o navegador consegue carregá-los.
 * Ele não leva a pasta node_modules inteira para dentro da página.
 *
 * QUANDO É USADO
 * Pode ser executado com npm run ui:build. Também é chamado automaticamente
 * antes do comando ui:deploy, para deixar a página
 * pronta. Antes do primeiro uso, execute npm install na pasta principal.
 *
 * SE ESTE ARQUIVO FOR APAGADO
 * Os comandos da página de teste que tentam executá-lo deixam de funcionar
 * até serem ajustados. A execução e a publicação normais da IA não o usam.
 *
 * SOBRE A PASTA DA PÁGINA
 * Este programa cria a pasta de destino quando necessário. Se você já
 * excluiu frontend-test e não quer recriar parte dela, não execute os
 * comandos opcionais ui:*.
 */

const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const vendor = path.join(root, 'frontend-test/assets/vendor')
fs.mkdirSync(vendor, { recursive: true })
for (const [source, destination] of Object.entries({
    'marked/lib/marked.umd.js': 'marked.js',
    'dompurify/dist/purify.min.js': 'purify.js',
    '@highlightjs/cdn-assets/highlight.min.js': 'highlight.js',
    '@highlightjs/cdn-assets/styles/github-dark.min.css': 'highlight.css'
})) {
    fs.copyFileSync(path.join(root, 'node_modules', source), path.join(vendor, destination))
}
console.log('Bibliotecas preparadas em frontend-test/assets/vendor.')
