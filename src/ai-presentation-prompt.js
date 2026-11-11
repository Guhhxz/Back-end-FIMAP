/*
 * PARA QUE SERVE ESTE ARQUIVO
 *
 * Este arquivo guarda orientações sobre como a IA deve organizar suas
 * respostas. Ele pede textos divididos em partes, títulos curtos, listas,
 * tabelas e destaque para a conclusão e para a ação sugerida.
 *
 * Quando existem valores financeiros conhecidos, as orientações também
 * explicam como separar nomes e números para que uma página consiga
 * mostrá-los em cartões ou barras. Os valores escritos no exemplo abaixo
 * servem apenas para explicar esse formato. Não são dados de uma pessoa
 * e não devem ser apresentados como se fossem reais.
 *
 * O texto orienta a IA a usar somente informações fornecidas pela pessoa
 * ou pelo sistema e a perguntar quando faltarem dados. Ele não consulta
 * contas bancárias, não faz transferências e não garante, sozinho, que a IA
 * nunca cometerá erros.
 *
 * QUANDO É USADO
 * O programa principal da IA e a conversa atendida por src/app.js leem este
 * arquivo e acrescentam suas orientações ao pedido enviado para o modelo.
 * Ele continua sendo usado mesmo quando a página de teste não está presente.
 * Mudar este texto pode mudar a forma das próximas respostas. O modelo
 * escolhido continua definido em src/index.ts.
 *
 * SE ESTE ARQUIVO FOR APAGADO
 * Os programas que tentam lê-lo podem deixar de iniciar ou de ser preparados
 * para publicação. Antes de removê-lo, é preciso retirar essas referências
 * ou guardar as orientações em outro lugar.
 */

module.exports = `Organize respostas em Markdown com títulos curtos, parágrafos breves, listas e tabelas quando úteis. Destaque a conclusão e a próxima ação. Nunca produza HTML.
Para destacar métricas financeiras relevantes e explicitamente conhecidas, você pode incluir um bloco de código com linguagem fimap contendo JSON válido neste contrato:
{"version":1,"title":"Análise financeira","summary":"Conclusão baseada nos dados informados","metrics":[{"label":"Receita mensal","value":5000,"format":"BRL"}],"bars":[{"label":"Meta atingida","value":500,"total":1000}],"callouts":[{"type":"recomendacao","text":"Ação sugerida"}]}
O exemplo é apenas um contrato: nunca copie seus valores para uma resposta real. metrics aceita até 8 itens, format BRL, percent ou number; percent usa pontos percentuais (36 significa 36%). bars é opcional e só pode ser usado com value e total conhecidos, total positivo, 0 <= value <= total. callouts é opcional e aceita resumo, informacao, atencao, dica, comparacao ou recomendacao. Use somente dados fornecidos pelo usuário ou pelo backend, nunca invente métricas nem metas. Se faltarem dados, pergunte em Markdown normal. Não transforme cada número em cartão. Não sugira que você consultou contas ou executou operações. Evite respostas acima de 6000 caracteres.`
