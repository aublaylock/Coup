"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("boardgame.io/server");
const CoupGame_1 = require("../src/game/CoupGame");
const PORT = Number(process.env.PORT ?? 8001);
const server = (0, server_1.Server)({
    games: [CoupGame_1.CoupGame],
    origins: [
        server_1.Origins.LOCALHOST_IN_DEVELOPMENT,
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
