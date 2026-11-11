# Página de teste do FIMAP na Cloudflare

O chat é usado em https://back-end-fimap.pedroday813.workers.dev. A página envia as perguntas para a IA na Cloudflare; não é necessário ligar um atendimento da IA no computador.

`frontend-test/` contém somente os arquivos da página: HTML, CSS e JavaScript do navegador. Os programas do servidor, Workers, arquivos Wrangler, dependências e `node_modules` ficam fora dela.

## Publicar o chat

Na raiz, instale as dependências e publique:

```bash
npm install
npm run ui:deploy
```

Esse comando prepara os arquivos visuais e atualiza o Worker `back-end-fimap` da conta autenticada. A configuração está em `wrangler.frontend-test.jsonc`. Para publicar somente a API/IA, sem a página, use `npm run deploy`.

`frontend-test/config.js` indica o endereço publicado para as perguntas. Os programas Node que consultam a IA usam o mesmo Worker por meio de `src/config/ia.js`. A variável `CLOUDFLARE_WORKER_URL` permite escolher outro Worker publicado.

## Pluggy.html continua somente no computador

Este arquivo foi preservado como estava: vazio. Ele não é enviado para a Cloudflare, conforme a regra em `frontend-test/.assetsignore`.

Para abri-lo no computador:

```bash
npm run pluggy:serve
```

Abra o endereço mostrado no terminal. Esse programa entrega apenas `Pluggy.html`; ele não entrega o chat e não executa a IA. A porta pode ser escolhida com `PLUGGY_TEST_PORT`.

## Arquivos de apoio

- `src/index.ts`: programa principal da IA na Cloudflare.
- `src/testUiWorker.ts`: entrega a página e encaminha as perguntas para a IA.
- `scripts/prepare-test-ui.js`: prepara os arquivos visuais para a publicação.
- `scripts/serve-pluggy.js`: abre somente a página Pluggy no computador.
- `src/ai-presentation-prompt.js`: orienta a organização das respostas da IA.

O programa Express e o banco das rotas financeiras são partes separadas do backend. Publicar o Worker do chat não publica essas outras rotas nem transfere o banco de dados para a Cloudflare.

## Excluir a página

Basta excluir `frontend-test/`. Os testes e a publicação normais da API/IA continuam funcionando. Os comandos opcionais `ui:*` e `pluggy:serve` dependem da pasta da página.

Veja [ai-chat.md](ai-chat.md) para a apresentação das respostas e o cancelamento.
