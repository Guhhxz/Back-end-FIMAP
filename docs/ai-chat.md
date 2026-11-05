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
