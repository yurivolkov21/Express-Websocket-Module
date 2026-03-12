import { connectMongo } from "./database/mongo.js";
import { ensureIndexes } from "./database/indexes.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

async function bootstrap(): Promise<void> {
    await connectMongo();
    await ensureIndexes();

    const app = createApp();

    app.listen(env.port, () => {
        console.log(`[Server] Listening on http://localhost:${env.port} (${env.nodeEnv})`);
    });
}

bootstrap().catch((err: unknown) => {
    console.error("[bootstrap] failed:", err);
    process.exit(1);
});
