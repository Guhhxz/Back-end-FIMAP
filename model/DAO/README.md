# DAO

As pastas agrupam o acesso ao banco pelo mesmo domínio das controllers. Cada DAO concentra consultas e persistência; respostas HTTP e validações da requisição pertencem à controller.

| Pasta | Responsabilidade |
| --- | --- |
| Autenticacao | Persistência de códigos OTP e dispositivos |
| Badge | Persistência de badges |
| CategoriaRecomendacao | Categorias de recomendações (pendente de implementação) |
| Chat | Persistência de chats (pendente de implementação) |
| MensagemChat | Persistência e processamento das mensagens de chat |
| RecomendacaoIA | Recomendações de IA (pendente de implementação) |
| Simulacoes | Exclusão de investimentos e CRUD de amortizações |
| Usuario | Persistência e consultas de usuários |

## Organização dos arquivos

1. Imports e configuração do Knex.
2. Constantes e funções auxiliares do módulo.
3. Funções de consulta e persistência.
4. Exportações públicas em `module.exports`.

A configuração do banco está em `model/Database_config_knex/KnexFile.js`. Para arquivos dentro das pastas de domínio, o caminho relativo é `../../Database_config_knex/KnexFile.js`.

Use parâmetros vinculados nas consultas SQL ou o query builder do Knex. Nas operações sobre dados privados, mantenha o filtro do usuário quando aplicável. Preserve os contratos de retorno e os nomes exportados utilizados pelas controllers.

A formatação dos arquivos JavaScript segue o `.prettierrc.json` da raiz. O esquema das tabelas está em `Database/Script_Fimap.sql`.
