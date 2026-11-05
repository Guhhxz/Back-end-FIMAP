# Back-end FIMAP

Repositório da API, integrações financeiras e IA.

O chat e a IA são usados na nuvem, pelo endereço:

https://back-end-fimap.pedroday813.workers.dev

Não é necessário iniciar um atendimento local da IA para usar o site.

- `npm run ui:deploy`: publica a IA com a página de teste na Cloudflare.
- `npm run deploy`: publica somente a API/IA, sem página.
- `npm test`: executa as verificações automáticas.
- `npm run pluggy:serve`: abre somente `Pluggy.html` no computador.

Os arquivos da página ficam em `frontend-test/`. Os programas do servidor, configurações Wrangler e dependências ficam fora dela. A pasta pode ser excluída sem impedir a execução, os testes ou a publicação da API/IA.

O programa Express e a ligação com o banco de dados usados pelas outras partes do backend continuam em `src/app.js` e `model/`; eles não são executados pelo Worker do chat. Esta alteração direciona o chat para a Cloudflare, sem migrar o banco de dados ou as demais rotas financeiras.

Veja [como publicar e usar a página](docs/test-ui.md).
