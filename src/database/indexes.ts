import { getDb } from "./mongo.js";

export async function ensureIndexes(): Promise<void> {
    const db = getDb();

    await db.collection("rooms").createIndex({ name: 1 }, { unique: true });

    await db.collection("reservations").createIndexes([
        { key: { roomId: 1 } },
        { key: { start: 1, end: 1 } },
        { key: { roomId: 1, start: 1, end: 1 } },
    ]);
}
