import { createServer } from "express-zod-api";
import { serverConfig } from "./server-config.js";
import { routing } from "./router.js";

createServer(serverConfig, routing);
