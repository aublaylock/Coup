import path from 'path';
import serve from 'koa-static';
import { Server, Origins } from 'boardgame.io/server';
import { CoupGame } from '../src/game/CoupGame';

const PORT = Number(process.env.PORT ?? 8001);

const server = Server({
  games: [CoupGame],
  origins: [
    Origins.LOCALHOST_IN_DEVELOPMENT,
    // Render sets RENDER_EXTERNAL_URL to the service's public URL.
    ...(process.env.RENDER_EXTERNAL_URL ? [process.env.RENDER_EXTERNAL_URL] : []),
  ],
});

// Serve the built client (dist/client) so the app and server share one origin.
server.app.use(serve(path.resolve(__dirname, '../client')));

// Simple health-check endpoint so uptime monitors can keep the instance warm.
server.router.get('/health', (ctx) => {
  ctx.status = 200;
  ctx.body = { status: 'ok' };
});

server.run(PORT, () => {
  console.log(`boardgame.io server listening on http://localhost:${PORT}`);
  console.log(`Lobby API: http://localhost:${PORT}/games/coup`);
});
