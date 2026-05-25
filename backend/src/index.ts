import { app } from "@/app.js";
import { logger } from "@/lib/logger.js";
import { setupSocket } from "@/socket/index.js";
import { setIO, type TypedServer } from "@/socket/io.js";
import http from "node:http";
import { Server } from "socket.io";

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const port = Number(process.env.PORT) || 3000;

const server = http.createServer(app);
const io: TypedServer = new Server(server, {
  cors: { origin: clientOrigin },
});

setupSocket(io);
setIO(io);

server.listen(port, () => {
  logger.info(`backend ready on :${port}`);
});
