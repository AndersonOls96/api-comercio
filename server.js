import express from 'express';
import { sql } from 'drizzle-orm';
import { db, pool } from './src/db/db.js';
import categoriaRoutes from './src/route/categoria.route.js';
import produtoRoutes from './src/route/produto.route.js';
import vendaRoutes from './src/route/venda.route.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/health', async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'indisponivel' });
  }
});

app.use('/categorias', categoriaRoutes);
app.use('/produtos', produtoRoutes);
app.use('/vendas', vendaRoutes);

app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ erro: 'Corpo ou formato da requisição inválido.' });
  }
  const codigo = error.cause?.code ?? error.code;
  if (codigo === '23503' || codigo === '23505') {
    return res.status(409).json({ erro: 'O registro está vinculado a outro ou já existe.' });
  }
  console.error('Falha ao processar requisição', error.cause?.code ?? error.code ?? error.name);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`API escutando na porta ${server.address().port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close(async (error) => {
      if (error) process.exitCode = 1;
      await pool.end();
    });
  });
}
