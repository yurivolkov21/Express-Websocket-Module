import { ApiError } from "../../utils/http.js";
import type { RoomDatabase } from "./room.database.js";
import type { RoomEntity } from "./room.model.js";

export class RoomService {
    constructor(private readonly roomDb: RoomDatabase) {}

    async list(): Promise<RoomEntity[]> {
        return this.roomDb.list();
    }

    async create(body: unknown): Promise<RoomEntity> {
        if (typeof body !== "object" || body === null) {
            throw new ApiError(400, { message: "Invalid request body" });
        }

        const b = body as Record<string, unknown>;
        const name = b["name"];
        const capacity = b["capacity"];

        if (typeof name !== "string" || name.trim() === "") {
            throw new ApiError(400, { message: "name is required and must be a non-empty string" });
        }
        if (typeof capacity !== "number" || !Number.isFinite(capacity) || capacity <= 0) {
            throw new ApiError(400, { message: "capacity must be a positive number" });
        }

        const now = new Date();
        try {
            return await this.roomDb.create({
                name: name.trim(),
                capacity,
                createdAt: now,
                updatedAt: now,
            });
        } catch (err: unknown) {
            if (
                err instanceof Error &&
                "code" in err &&
                (err as { code: unknown }).code === 11000
            ) {
                throw new ApiError(409, { message: `Room "${name.trim()}" already exists` });
            }
            throw err;
        }
    }
}
