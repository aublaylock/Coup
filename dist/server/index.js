"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const koa_static_1 = __importDefault(require("koa-static"));
const server_1 = require("boardgame.io/server");
const CoupGame_1 = require("../src/game/CoupGame");
const PORT = Number(process.env.PORT ?? 8001);
const server = (0, server_1.Server)({
    games: [CoupGame_1.CoupGame],
    origins: [
        server_1.Origins.LOCALHOST_IN_DEVELOPMENT,
        // Render sets RENDER_EXTERNAL_URL to the service's public URL.
        ...(process.env.RENDER_EXTERNAL_URL ? [process.env.RENDER_EXTERNAL_URL] : []),
    ],
});
// Serve the built client (dist/client) so the app and server share one origin.
server.app.use((0, koa_static_1.default)(path_1.default.resolve(__dirname, '../client')));
// Simple health-check endpoint so uptime monitors can keep the instance warm.
server.router.get('/health', (ctx) => {
    ctx.status = 200;
    ctx.body = { status: 'ok' };
});
server.run(PORT, () => {
    console.log(`boardgame.io server listening on http://localhost:${PORT}`);
    console.log(`Lobby API: http://localhost:${PORT}/games/coup`);
});
