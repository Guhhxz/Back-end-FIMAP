/*
 * PARA QUE SERVE ESTE ARQUIVO
 *
 * Este arquivo permite abrir a página de teste e conversar com a IA usando
 * um único endereço na Cloudflare. A Cloudflare é o serviço onde o projeto
 * fica disponível na internet.
 *
 * Quando alguém faz uma pergunta, este arquivo encaminha o pedido para
 * src/index.ts, que cuida da IA. Quando alguém pede para abrir a página,
 * ele entrega os arquivos de frontend-test, como os textos, as cores e os
 * botões. Ele não escolhe o modelo e não escreve as respostas da IA.
 *
 * QUANDO É USADO
 * É usado pelo comando npm run ui:deploy, por meio
 * do arquivo wrangler.frontend-test.jsonc. O comando npm run deploy usa
 * o arquivo principal da IA e não depende deste arquivo.
 *
 * SE ESTE ARQUIVO FOR APAGADO
 * A opção de abrir ou publicar a IA junto da página de teste deixa de
 * funcionar. A execução e a publicação normais da IA continuam funcionando.
 * Ele fica fora de frontend-test porque é executado na Cloudflare, e não
 * no navegador da pessoa que abre a página.
 */

import api, { type Env as ApiEnv } from './index';

type FrontendEnv = ApiEnv & { ASSETS: Fetcher };

export default {
  async fetch(request: Request, env: FrontendEnv): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    // Pluggy.html é reservado para os testes no computador.
    if (pathname.toLowerCase().replace(/\/+$/, '') === '/pluggy.html') {
      return new Response('Página disponível somente no computador.', { status: 404 });
    }
    if (pathname.startsWith('/v1/') || pathname === '/chat' || pathname === '/health') {
      return api.fetch(request, env);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<FrontendEnv>;
