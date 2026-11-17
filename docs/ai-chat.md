# Integração do Chat IA FIMAP

Implementação na branch remota `minhas-alteracoes` (nome confirmado no GitHub em 17/11/2026).
O frontend chama este backend com o JWT do usuário. Só o backend envia o token compartilhado ao Worker.
Nenhum segredo do Worker deve chegar ao navegador.

## Configuração e banco

Use Node.js 22.13 ou superior (os testes SQL usam `node:sqlite`) e MySQL 8/InnoDB.
As tabelas `tbl_usuario`, `tbl_chat` e `tbl_mensagem` já devem existir, com os tipos INT signed do
`Database/Script_Fimap.sql`. Os papéis existentes no banco **não são migrados**: 1 = usuário e 2 = IA.
Na API de mensagens, a conversão é explícita: 0 = usuário e 1 = IA.

Copie os nomes de configuração de `.env.example` para o ambiente privado:

- `JWT_SECRET`: assinatura do JWT de acesso do aplicativo, algoritmo HS256, usuário no `sub`.
- `CLOUDFLARE_WORKER_URL`: URL completa privada, recomendada `https://ia-fimap.fimap-agency.workers.dev/v1/ia/chat`.
- `CLOUDFLARE_CHAT_TOKEN`: mesmo valor de `CHAT_API_TOKEN` do Worker; não é o JWT do usuário.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: acesso ao MySQL.
- `PORT`: porta do servidor, padrão 8080.

O adaptador existente também aceita `/chat` (SSE legado). Chats autenticados recusam a rota pública.
O adaptador não segue redirects com o token. Não configure a URL a partir de dados do navegador.
Não houve alteração de secrets, chamadas reais de inferência, deploy ou aplicação de migrações nesta entrega.

A migração `db/migrations/202611170001_chat_requisicoes.js` só cria `tbl_chat_requisicao`,
com FKs e índices. Não apaga nem reescreve mensagens existentes. Depois de backup e validação em homologação,
o operador pode aplicá-la com:

```sh
npm run db:migrate
```

O caminho das migrações é absoluto, independente do diretório usado pelo CLI do Knex.
O rollback (`down`) apaga a nova tabela e seus estados; não execute em produção para esconder falhas.
Não remova solicitações antigas sem uma política explícita: elas são as chaves duráveis de deduplicação.
A exclusão explícita de um chat/usuário remove seus registros por cascade, incluindo solicitações e histórico.
Após exclusão, recuperação retorna 404 e a retenção de idempotência daquela conversa termina.

## Endpoints autenticados

Base: `/v1/ia/chat`. Todos exigem `Authorization: Bearer JWT_DO_USUARIO`.
JWT ausente, inválido, expirado ou de redefinição de senha não autoriza operações.
`id_usuario` em corpo/query não define o dono. A URL antiga `/listar-chats/:id_usuario`
só é aceita se corresponder ao usuário autenticado. A listagem geral foi substituída pela listagem do próprio usuário.
Chats alheios e inexistentes produzem o mesmo 404. Nenhuma listagem nem cadastro cria chats de demonstração.

| Método | Caminho | Corpo / comportamento |
| --- | --- | --- |
| GET | `/listar-chats` | `conteudo: []` para conta sem chats |
| POST | `/iniciar-chat` | `{ "nome": "Minha conversa" }`; HTTP 201, `id`, `nome` |
| GET | `/listar-chat/:id_chat` | Metadados próprios em `conteudo` |
| PATCH | `/atualizar-nome-chat/:id_chat` | `{ "nome": "Novo nome" }`, de 1 a 45 caracteres |
| DELETE | `/apagar-chat/:id_chat` | Exclui somente chat próprio |
| GET | `/listar-chat/:id_chat/mensagens` | Histórico completo em `conteudo`, sem paginação nem truncamento |
| POST | `/mensagens` | Pergunta, chat e UUID; SSE descrito abaixo |
| GET | `/requisicoes/:requisicao_id` | Consulta estado e resultado confirmado |
| POST | `/requisicoes/:requisicao_id/cancelar` | Registra cancelamento idempotente |

Histórico:

```json
{
  "sucesso": true,
  "mensagem": "Mensagens consultadas com sucesso.",
  "conteudo": [
    { "id": 1, "conteudo": "Olá", "papel": 0, "data_envio": "2026-11-17T12:00:00.000Z" },
    { "id": 2, "conteudo": "Como posso ajudar?", "papel": 1, "data_envio": "2026-11-17T12:00:00.000Z" }
  ]
}
```

A ordem é `data_envio ASC, id ASC`, inclusive quando as datas coincidem.
Chat vazio retorna `conteudo: []`. Falha de banco retorna erro, nunca lista vazia.
O histórico inteiro é retornado para compatibilidade com o frontend atual. Conversas muito grandes
exigirão paginação explícita em uma versão futura, acordada com o frontend; não existe teto oculto.

Envio:

```json
{
  "id_chat": 1,
  "pergunta": "Como organizar minhas finanças?",
  "requisicao_id": "b1e35ba1-88e7-4dc3-8a03-010000000001"
}
```

A pergunta, normalizada com `trim`, tem de 1 a 2.000 caracteres JavaScript. O backend não usa `messages`
recebidas do navegador neste fluxo. Envia ao Worker apenas até cinco pares anteriores completos e a pergunta atual.
Respostas anteriores têm no máximo 16.000 caracteres; contexto legado inválido é rejeitado, sem truncar números.
O histórico legado é preservado: pergunta órfã é descartada do contexto, mas continua visível no histórico.
Novas perguntas com falha ficam na solicitação durável, sem criar mensagens órfãs em `tbl_mensagem`.

SSE compatível:

```text
data: {"tipo":"trecho","conteudo":"Texto parcial"}

data: {"tipo":"fim","id_chat":1,"requisicao_id":"b1e35ba1-88e7-4dc3-8a03-010000000001","mensagem_usuario":{"id":1,"conteudo":"Como organizar minhas finanças?","papel":0,"data_envio":"..."},"mensagem_assistente":{"id":2,"conteudo":"Texto completo","papel":1,"data_envio":"..."}}

```

O evento `fim` só é escrito **depois do commit** do par de mensagens e do estado `concluida`.
Resposta parcial, erro, JSON inválido, texto vazio ou EOF sem conclusão não confirmam sucesso.
O adaptador continua aceitando SSE FIMAP, SSE nativo (`response`/`choices`/`[DONE]`) e JSON completo.
UTF-8 fragmentado e delimitadores LF/CRLF são reconstruídos incrementalmente.
A escrita aguarda `drain`; um consumidor parado por 10 segundos causa `CHAT_CLIENTE_LENTO` e cancela a inferência.
Não há nova tentativa automática.

Aliases anteriores `GET/POST /v1/ia/chats/:chatId/mensagens` e
`GET/POST /v1/ia/chat/:chatId/mensagens` continuam autenticados; POST também aceita `conteudo`.
O GET agora usa o mesmo envelope completo `conteudo` e papéis numéricos; `limite`/`antes_de` não paginam.
Clientes desses aliases que usavam `mensagens`, papéis textuais ou cursor precisam adotar o contrato acima.

Para preservar envios antigos, `requisicao_id` é opcional. Se omitido, o servidor gera um UUID e o expõe
em `X-Requisicao-Id` e no `fim`. **Reenviar sem o mesmo UUID não oferece deduplicação.**
Clientes novos devem criar e guardar o UUID antes do POST. Valores presentes e inválidos retornam 400.
O cabeçalho e `Retry-After` são expostos pelo CORS.

## Estados, idempotência e recuperação

Consulta de uma solicitação própria (HTTP 200):

```json
{
  "sucesso": true,
  "mensagem": "Solicitação consultada com sucesso.",
  "conteudo": {
    "requisicao_id": "b1e35ba1-88e7-4dc3-8a03-010000000001",
    "id_chat": 1,
    "estado": "concluida",
    "codigo": null,
    "retry_after": null,
    "resultado": {
      "id_chat": 1,
      "requisicao_id": "b1e35ba1-88e7-4dc3-8a03-010000000001",
      "mensagem_usuario": { "id": 1, "papel": 0, "conteudo": "Pergunta", "data_envio": "..." },
      "mensagem_assistente": { "id": 2, "papel": 1, "conteudo": "Resposta", "data_envio": "..." }
    }
  }
}
```

| Estado | Consulta | POST com mesmo UUID e mesmo pedido |
| --- | --- | --- |
| `gerando` | 200, sem `resultado` | 409 `REQUISICAO_EM_ANDAMENTO`, sem chamar Worker |
| `concluida` | 200 com `resultado` | Reproduz texto salvo e `fim`, `recuperada: true`, sem chamar Worker |
| `falhou` | 200 com `codigo` e `retry_after` quando disponível | Erro terminal já registrado; não gera novamente |
| `cancelada` | 200, código `REQUISICAO_CANCELADA` | 409, não gera novamente |
| `expirada` | 200, código `REQUISICAO_EXPIRADA` | 409, não gera novamente |

Mesmo UUID com outro texto normalizado ou outro chat do próprio usuário: 409 `REQUISICAO_CONFLITO`.
A chave única é `(id_usuario, requisicao_id)`; contas diferentes têm namespaces independentes.
Solicitação inexistente, de chat apagado ou de outro usuário: 404, inclusive no cancelamento.
A consulta não reexecuta a geração. Se o banco confirmou e o navegador perdeu o `fim`,
recupere `resultado` e faça merge pelas IDs das mensagens.
Falhas/cancelamentos não guardam texto parcial como resposta concluída.

Cancelamento retorna HTTP 200 com o mesmo envelope de estado. Se `gerando`, muda para `cancelada`
e libera o slot; se já terminal, mantém o estado (inclusive `concluida` e seu resultado).
Uma corrida entre cancelamento e commit é serializada: vence a transação que confirmar primeiro.
A desconexão do navegador propaga `AbortSignal` ao adaptador e registra cancelamento quando o banco permite.
Outras instâncias detectam cancelamento por polling durável a cada 1 segundo e abortam o Worker.
Isso impede persistência tardia, mas não garante que o modelo ou ferramentas externas já iniciadas deixem de consumir cota.

## Concorrência, leases e limites

A reserva é feita em transação, antes de carregar o contexto. O MySQL bloqueia a linha do usuário e a do chat,
verifica propriedade, chave do pedido, solicitação ativa e limites. A transação termina antes da chamada externa.
`UNIQUE(chat_ativo)` (NULL nos estados terminais) impede duas reservas ativas por chat;
`UNIQUE(id_usuario, requisicao_id)` impede duplicação da solicitação.
O commit da resposta exige estado `gerando`, dono do lease e lease válido sob o mesmo bloqueio.
Nenhum controle de integridade depende de Map/Set por processo. Não é necessário versionamento no frontend:
cada contexto é carregado após obter a reserva exclusiva e inclui os últimos pares confirmados.

O prazo global da geração no serviço é de 120 segundos; o adaptador também limita a chamada externa a 120 segundos.
O frontend atual de 130 segundos deixa margem para transporte/persistência, sem garantia frente a um banco indisponível.
O Worker tem prazos próprios (por exemplo 120 segundos por chamada ao modelo e etapas de ferramentas);
o backend pode cancelar antes da soma dessas etapas. Configure proxy/load balancer acima do prazo do frontend,
sem buffering de SSE. Não trate timeout como prova de que não houve inferência.

O lease é fixo em 150 segundos, medido pelo relógio do MySQL, sem transação longa nem renovação em memória.
Consultas, reservas e finalizações expiram leases vencidos; uma consulta após queda do processo recupera o estado
`expirada`, e a próxima reserva pode liberar o slot vencido. Não depende de um cron estar vivo.
Solicitações sem tráfego podem continuar fisicamente `gerando` até a próxima operação, mas não impedem recuperação.
Um processo antigo não pode confirmar depois da expiração, mesmo que receba uma resposta atrasada.
Se falhar a gravação do estado de erro, o lease oferece essa recuperação posterior.

Limites do backend autenticado, persistidos por solicitação e serializados pela linha do usuário:

- Até 12 novas solicitações por janela móvel de 60 segundos por usuário.
- Até duas gerações ativas por usuário entre conversas; uma por conversa.
- Intervalo mínimo de cinco segundos entre novas solicitações na mesma conversa.
- Replays/consultas/cancelamentos não consomem novas inferências nem contam como novas solicitações.

Limites atingidos retornam 429 com `Retry-After` (60 ou 5 segundos); chat ocupado retorna 409.
Falhas de geração contam para a janela; não apague chats/solicitações para contornar limites.
Por conta do cascade e retenção por chat, esse controle não é uma cota antifraude permanente contra excluir/recriar conversas.
A rota pública preservada, sem dados do banco, tem limite por IP e por processo de 12/minuto.
Ela não substitui os controles do chat autenticado e não deve ser usada para injetar dados bancários.

## Erros públicos

Antes do primeiro trecho: status HTTP adequado com `{ "sucesso": false, "codigo": "...", "mensagem": "..." }`.
Depois de iniciado: `data: {"tipo":"erro","codigo":"...","mensagem":"...","sucesso":false}` sem `fim`.
Quando conhecido, `Retry-After` é preservado no HTTP; após início do SSE, é `retry_after` no evento.
Mensagens brutas do provedor, SQL, tokens e perguntas não são registradas em logs operacionais.

| Falha | HTTP / código |
| --- | --- |
| Configuração local ausente ou URL pública no chat autenticado | 503 `IA_CONFIGURACAO` |
| Token compartilhado inválido (401/403 do Worker) | 503 `IA_AUTENTICACAO`, nunca 401 da sessão do usuário |
| Credencial/configuração do modelo recusada | 503 `AI_CONFIGURATION` / `AI_PROVIDER_AUTH` / `AI_PROVIDER_ACCESS` |
| Cota esgotada | 429 `AI_QUOTA` |
| Limite temporário | 429 `AI_RATE_LIMIT` ou `IA_LIMITE` |
| Serviço indisponível | 502 `AI_UNAVAILABLE` / `IA_PROVEDOR`, ou 503 `IA_SERVICO_INDISPONIVEL` |
| Conexão com Worker | 502 `IA_INDISPONIVEL` |
| Timeout | 504 `IA_TIMEOUT` |
| Resposta inválida, vazia ou interrompida | 502 `IA_RESPOSTA_INVALIDA` / `IA_RESPOSTA_VAZIA` / `IA_FLUXO_INTERROMPIDO` / `AI_INVALID_RESPONSE` |
| Banco | 500 `CHAT_BANCO` |

Códigos conhecidos do Worker são preservados por allowlist; mensagens externas são substituídas por texto público seguro.
Se o Worker não distinguir uma causa (por exemplo, evento genérico `erro`), este backend não inventa um diagnóstico mais específico.

## Ajustes exatos no frontend

1. Enviar JWT de acesso em **todas** as operações de chat, histórico, estado e cancelamento.
2. Usar `GET /listar-chats` do próprio usuário; remover autoridade de `id_usuario` de corpo/query.
3. Ler `GET /listar-chat/:id_chat/mensagens` em `conteudo`, ordenar conforme retorno e mapear papel 0/1.
4. Criar um UUID por ação antes de enviar; guardar junto de `id_chat` e pergunta. Reutilizar o UUID em retransmissões
   do mesmo pedido; não repetir automaticamente falhas e não gerar outro UUID só porque faltou `fim`.
5. Consumir SSE incremental por linhas/eventos (não por pacote Axios), verificando `tipo: erro` mesmo com HTTP 200.
   Manter o timeout de 130 segundos; tratar EOF sem `fim` como estado desconhecido, nunca como sucesso.
6. Após desconexão/timeout/perda de `fim`, consultar `GET /requisicoes/:uuid` com o JWT.
   Se `gerando`, aguardar e consultar novamente com intervalo de pelo menos 1 segundo; se `concluida`,
   recuperar o par e mesclar por IDs sem duplicá-lo. 404 significa inexistência/falta de acesso, sem inferência automática.
7. Exibir estados `falhou`, `cancelada`, `expirada` e os códigos de erro; respeitar `Retry-After`.
   Nova tentativa, somente por ação explícita após reconciliação, cria outro UUID e pode consumir outra inferência.
8. Botão “Parar resposta”: `POST /requisicoes/:uuid/cancelar` com JWT, então encerrar a leitura local.
   Se o backend devolver `concluida`, recuperar o resultado já confirmado.
9. Em 409 `CHAT_EM_ANDAMENTO`/`REQUISICAO_EM_ANDAMENTO`, não enviar outra pergunta; atualizar histórico/estado.
   Desabilitar envio local durante geração e manter cada stream associado ao seu chat/UUID.
10. Se ainda usar aliases antigos com paginação/papéis textuais, adaptar para o envelope completo acima.
    Sanitizar Markdown da IA antes de renderizar HTML.

## Dependências separadas do Worker IA-Fimap

Referências verificadas: [src/index.ts](https://github.com/pedrorodriguesdev/IA-Fimap/blob/main/src/index.ts)
(blob `2b7f99a3bb5287ba878d5a686de1cd69f13148ae`) e
[docs/backend-integration.md](https://github.com/pedrorodriguesdev/IA-Fimap/blob/main/docs/backend-integration.md)
(blob `29866b178883d0497a63d461f66cec67e42f276a`). Nenhum arquivo desse repositório foi alterado.

O Worker atualmente limita por IP: 5 segundos entre pedidos e 12/60s via binding Cloudflare.
Vários usuários deste backend podem compartilhar um IP de saída, portanto limites do backend **não resolvem**
a contenção no Worker. Antes de uso compartilhado em escala, o Worker precisa:

- Aceitar uma referência opaca de usuário **somente após** validar o Bearer privado; proposta:
  `X-Fimap-User-Ref = HMAC(chave exclusiva do backend, namespace + id_usuario)`.
  Não enviar ID cru, IP arbitrário do navegador ou JWT do usuário. O cabeçalho é proposta e não é enviado nesta entrega.
- Aplicar chaves por usuário/serviço e manter um teto global apropriado; usar armazenamento/coordenador durável
  para cota global, separado das rotas públicas. Não confiar no mesmo cabeçalho na demonstração pública.
- Se for necessário impedir consumo duplicado após falha de rede no próprio Worker, implementar idempotência
  durável também nessa camada. A garantia atual evita nova chamada no backend para o mesmo UUID;
  não é uma garantia de consumo exatamente uma vez pelo provedor.
- Propagar códigos/Retry-After específicos também em erros de SSE, e revisar cancelamento/prazo global
  das etapas de planejamento, ferramentas e modelo.

## Limite do contexto financeiro e proposta futura

Este fluxo fornece somente mensagens. Não consulta automaticamente saldos, extratos nem Open Finance.
Não afirme na UI que a IA analisou dados bancários não enviados. O backend não acrescenta `contextoFinanceiro`
ou campos extras presumindo que o Worker saiba interpretá-los.

Uma entrega separada deve definir contrato versionado: carregar contas/consentimentos autorizados no backend,
selecionar período e campos necessários, produzir resumo agregado mínimo (sem número completo de conta,
credenciais ou extrato integral), limitar tamanho antes do envio e registrar consentimento/retenção.
Uma proposta inicial de teto seria 4.000 caracteres para esse resumo, independente dos limites das mensagens,
**apenas após** definição e suporte explícito pelo Worker. Definir schema, tratamento de dados ausentes,
expiração, redação de dados pessoais e instruções que impeçam alegações de análise de fontes ausentes.
Nenhuma dessas extensões é enviada ao Worker atual.

## Testes e limites da validação

`npm test` usa IA simulada, HTTP local e SQL SQLite isolado com o compilador MySQL do Knex.
Verifica JWT/isolamento, histórico vazio/completo, erros de banco, reservas/replays entre serviços,
conflitos, commit/rollback do par, recuperação sem `fim`, lease abandonado, cancelamento entre instâncias,
limites por usuário, SSE fragmentado/UTF-8, backpressure e limpeza de recursos.
Não consome inferência real nem usa dados financeiros reais.

`tests/chat-mysql.test.js` é opt-in: configure `CHAT_TEST_MYSQL_URL` **somente para servidor de testes**
com permissão para criar/apagar schemas descartáveis. Ele cria `fimap_chat_test_<uuid>`, aplica a migração,
usa dois pools concorrentes, confere constraints/locks, rollback com falha na segunda mensagem e fencing.
Remove somente o schema que criou. A URL nunca é impressa. Execute `npm test` com essa variável no ambiente privado.

Resultado desta entrega: 33 testes passaram; um teste MySQL foi omitido por falta de servidor descartável.
SQLite não prova comportamento de locks InnoDB, compatibilidade da migração no banco existente ou latência de produção.
Antes de publicar: executar o teste MySQL, validar a migração em cópia do banco e testar proxy/frontend/Worker em homologação.
Não houve deploy, push ou execução de migração no banco existente.
