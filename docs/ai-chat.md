# Chat FIMAP: apresentação e cancelamento

A interface de teste está em `frontend-test/index.html`. Os comandos de instalação, execução e publicação estão em [test-ui.md](test-ui.md).

`frontend-test/assets/ai-renderer.js` centraliza Markdown, métricas, avisos, tabelas, barras e cópia. `ai-chat.css` preserva o tema claro existente. Marked interpreta Markdown; HTML recebido é escapado e o resultado passa por DOMPurify com lista restrita de elementos. Links aceitam HTTP, HTTPS e mailto. Highlight.js colore código somente ao terminar.

## Contrato visual v1

Respostas normais usam Markdown. Para dados conhecidos, o modelo pode emitir um bloco de código com linguagem `fimap` contendo:

```json
{
  "version": 1,
  "title": "Análise financeira",
  "summary": "Resumo baseado nos valores informados.",
  "metrics": [
    {"label": "Receita mensal", "value": 5000, "format": "BRL"},
    {"label": "Despesas", "value": 3200, "format": "BRL"},
    {"label": "Valor restante", "value": 1800, "format": "BRL"},
    {"label": "Taxa de economia", "value": 36, "format": "percent"}
  ],
  "bars": [
    {"label": "Despesas", "value": 3200, "total": 5000},
    {"label": "Valor restante", "value": 1800, "total": 5000}
  ],
  "callouts": [{"type": "recomendacao", "text": "Avalie sua reserva de emergência."}]
}
```

Valores acima são fictícios, apenas para documentar o contrato; não são injetados no chat. Formatos: `BRL`, `percent` (36 significa 36%), `number`. Até oito métricas e oito barras. Barras exigem total positivo e valor entre zero e total; são uma representação da proporção fornecida, sem cálculos financeiros novos. Avisos: `resumo`, `informacao`, `atencao`, `dica`, `comparacao`, `recomendacao`. Blocos inválidos permanecem como texto/código. Textos e números comuns nunca são convertidos automaticamente em cartões.

O prompt compartilhado em `src/ai-presentation-prompt.js` é usado pelo endpoint público Express e pelo Worker. O contrato mantém o transporte SSE `{tipo:"trecho",conteudo:"..."}` e o marcador `{tipo:"fim"}`.

## Parar e perguntar novamente

Durante a geração aparece “Parar resposta”. O navegador aborta a requisição; o Express propaga o sinal para o fetch do Worker. O Worker cancela a leitura do stream de origem quando o consumidor cancela a resposta. O texto parcial fica visível, identificado como interrompido, mas não é enviado como contexto da próxima pergunta. O controle volta ao campo de mensagem. O intervalo de cinco segundos é liberado para requisições canceladas; o limite global do Worker de 12 requisições/minuto permanece.

O endpoint persistente também propaga cancelamento. A pergunta já gravada permanece no histórico; uma resposta abortada antes da gravação não é persistida como concluída. A página pública continua usando contexto em memória, como antes.

## Validação

Na raiz, `npm test` cobre cancelamento do serviço, do controller e do Worker, além do fluxo SSE concluído. `npx wrangler deploy --dry-run` verifica o bundle sem publicar.

## Comportamento da IA

Edite `src/ai-system-prompt.js` para mudar a identidade, o tom e as regras da assistente. O texto entre as crases aceita várias linhas e pode ser ampliado com novas seções. Esse arquivo é compartilhado pelo Worker, pelo chat público Express e pelo chat com histórico. As orientações visuais continuam em `src/ai-presentation-prompt.js`, acrescentadas nos fluxos públicos.

O prompt é enviado a cada requisição e compartilha a janela de contexto do modelo com o histórico e a resposta. Um texto maior consome mais tokens; o arquivo não remove os limites do modelo. Não coloque segredos no prompt. Após editar, reinicie o backend e publique novamente o Worker.

O prompt de comportamento contém as 30 seções do FIMAP e uma seção inicial de aplicação: exemplos são hipotéticos, ferramentas dependem de habilitação real, o contexto é apenas o recebido e as respostas não executam operações financeiras. Na rota legada `/chat`, somente as versões exatas do prompt compartilhado (com ou sem o contrato de apresentação) podem ultrapassar o limite comum de 2.000 caracteres para mensagens de sistema. Isso exige manter backend e Worker com a mesma versão do prompt.
