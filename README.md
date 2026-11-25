# API de tarefas

API REST em JavaScript com Node.js 24, Express 5, Drizzle ORM e PostgreSQL.

## Rodar localmente

Com um banco PostgreSQL criado, execute:

```sh
npm ci
cp .env-example .env
# Preencha DATABASE_URL no arquivo .env.
npm run db:migrate
npm run dev
```

A API fica disponível em `http://localhost:3000` por padrão.

| Método | Rota | Operação |
| --- | --- | --- |
| GET | `/health` | Verifica a conexão com o PostgreSQL |
| GET | `/tarefas` | Lista as tarefas |
| POST | `/tarefas` | Cria uma tarefa |
| GET | `/tarefas/:id` | Consulta uma tarefa |
| PATCH | `/tarefas/:id` | Atualiza os campos enviados |
| DELETE | `/tarefas/:id` | Exclui uma tarefa |

```sh
curl -X POST http://localhost:3000/tarefas \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Configurar o Render"}'
```

`titulo` é obrigatório na criação e aceita até 200 caracteres. `concluida` é um booleano opcional, com valor inicial `false`.

## Deploy no Render

1. Envie o conteúdo do projeto para um repositório, incluindo `.env-example`, `package-lock.json` e a pasta `drizzle/`.
2. Crie uma instância do Render Postgres e um Web Service com runtime Node na mesma região.
3. No Web Service, defina `DATABASE_URL` com a **Internal Database URL** do banco. O Render fornece `PORT`.
4. Configure **Build Command** como `npm ci`, **Start Command** como `npm start` e **Health Check Path** como `/health`.
5. Configure **Pre-Deploy Command** como `npm run db:migrate` se o plano oferecer esse campo. Caso contrário, use `npm run db:migrate && npm start` no **Start Command** para uma implantação com uma única instância.

O CRUD de exemplo é público e não tem autenticação. Use dados de teste ao expor o serviço.

## Alterar o esquema

Edite `src/schema.js`, execute `npm run db:generate` e inclua a nova migration gerada no repositório. Para aplicá-la localmente, execute `npm run db:migrate`.
