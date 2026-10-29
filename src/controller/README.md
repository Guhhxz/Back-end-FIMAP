# Controllers

As pastas agrupam as operações por domínio. As controllers recebem `req` e `res`, validam a entrada e retornam a resposta HTTP. O acesso ao banco fica em `model/DAO`; integrações externas ficam em `src/services`.

| Pasta | Responsabilidade |
| --- | --- |
| Autenticacao | Dispositivos, alteração e recuperação de senha |
| Badge | Operações de badges |
| CategoriaRecomendacao | Categorias de recomendações (pendente de implementação) |
| Chat | Operações de chats |
| MensagemChat | Mensagens dos chats |
| OpenFinance | Integração Open Finance pelo serviço Pluggy |
| RecomendacaoIA | Recomendações de IA (pendente de implementação) |
| Simulacoes | Exclusão de investimentos e CRUD de amortizações |
| Usuario | Operações de usuários |
| modulo | Catálogo compartilhado de mensagens e status HTTP |

## Organização dos arquivos

1. Imports de dependências, mensagens e DAO ou serviço.
2. Constantes e funções auxiliares do módulo.
3. Funções responsáveis pelas operações HTTP.
4. Exportações públicas em `module.exports`.

Preserve os nomes exportados e os caminhos consumidos pelas rotas. Os nomes existentes foram mantidos para compatibilidade. Use a grafia exata dos arquivos nos imports, inclusive maiúsculas e minúsculas.

A formatação dos arquivos JavaScript está definida no `.prettierrc.json` da raiz: quatro espaços, aspas simples, sem ponto e vírgula e linhas de até 100 caracteres quando possível.

Os contratos HTTP estão em `swagger/fimap_Swagger.yaml`. A existência de uma controller não significa que sua rota já esteja registrada em `src/routes` ou `src/app.js`.
