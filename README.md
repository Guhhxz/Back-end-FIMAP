<!--
PARA QUE SERVE: apresentar o projeto e os comandos iniciais.
QUANDO ENTRA EM AÇÃO: ao instalar, iniciar ou procurar a documentação do backend.
QUANDO FAZ DIFERENÇA: aponta o caminho mais curto para testar o chat e verificar o banco.
-->

# Back-end FIMAP

API Express com MySQL, integrações financeiras e chat com IA.

Use Node.js 22 ou superior:

```sh
npm install
npm test
npm start
```

O backend escuta em `http://localhost:8080`. `GET /health` verifica o processo.
O chat público está em `POST /v1/ia/chat-publico`, e o chat com histórico em
`POST /v1/ia/chats/:chatId/mensagens`.

Veja os corpos das requisições, variáveis de ambiente, eventos SSE e requisitos do banco em
[docs/ai-chat.md](docs/ai-chat.md). O arquivo `.env.example` documenta a configuração da IA.
