import { Server, Origins } from 'boardgame.io/server';
import { CoupGame } from '../src/game/CoupGame';

const PORT = Number(process.env.PORT ?? 8001);

const server = Server({
  games: [CoupGame],
  origins: [
    Origins.LOCALHOST_IN_DEVELOPMENT,
    // Add your production domain here when deploying:
    // 'https://coup-web.vercel.app',
  ],
});

// Simple health-check endpoint so uptime monitors can keep the instance warm.
server.router.get('/health', (ctx) => {
  ctx.status = 200;
  ctx.body = { status: 'ok' };
});

server.run(PORT, () => {
  console.log(`boardgame.io server listening on http://localhost:${PORT}`);
  console.log(`Lobby API: http://localhost:${PORT}/games/coup`);
});
