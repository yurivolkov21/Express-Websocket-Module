import { ApiError } from "../../utils/http.js";
import type { ReservationDatabase } from "./reservations.database.js";
import type { ReservationEntity, ReservationDoc } from "./reservations.model.js";

export class ReservationService {
    constructor(private readonly reservationDb: ReservationDatabase) {}

    private parseIsoDate(value: unknown, field: string): Date {
        if (typeof value !== "string" || value.trim() === "") {
            throw new ApiError(400, { message: `${field} must be a valid ISO date string` });
        }
        const d = new Date(value);
        if (isNaN(d.getTime())) {
            throw new ApiError(400, { message: `${field} is not a valid ISO date` });
        }
        return d;
    }

    async list(query: { roomId?: string; from?: string; to?: string }): Promise<ReservationEntity[]> {
        const filter: { roomId?: string; from?: Date; to?: Date } = {};
        if (query.roomId) filter.roomId = query.roomId;
        if (query.from) {
            const d = new Date(query.from);
            if (isNaN(d.getTime())) throw new ApiError(400, { message: "from is not a valid ISO date" });
            filter.from = d;
        }
        if (query.to) {
            const d = new Date(query.to);
            if (isNaN(d.getTime())) throw new ApiError(400, { message: "to is not a valid ISO date" });
            filter.to = d;
        }
        return this.reservationDb.list(filter);
    }

    async create(body: unknown): Promise<ReservationEntity> {
        if (typeof body !== "object" || body === null) {
            throw new ApiError(400, { message: "Invalid request body" });
        }
        const b = body as Record<string, unknown>;
        const roomId = b["roomId"];
        const title = b["title"];
        const createdBy = b["createdBy"];

        if (typeof roomId !== "string" || roomId.trim() === "") {
            throw new ApiError(400, { message: "roomId is required" });
        }
        if (typeof title !== "string" || title.trim() === "") {
            throw new ApiError(400, { message: "title is required" });
        }
        if (typeof createdBy !== "string" || createdBy.trim() === "") {
            throw new ApiError(400, { message: "createdBy is required" });
        }

        const start = this.parseIsoDate(b["start"], "start");
        const end = this.parseIsoDate(b["end"], "end");
        if (end <= start) throw new ApiError(400, { message: "end must be after start" });

        const now = new Date();
        return this.reservationDb.create({
            roomId: roomId.trim(),
            title: title.trim(),
            start,
            end,
            createdBy: createdBy.trim(),
            createdAt: now,
            updatedAt: now,
        });
    }

    async update(id: string, body: unknown): Promise<ReservationEntity> {
        if (typeof body !== "object" || body === null) {
            throw new ApiError(400, { message: "Invalid request body" });
        }
        const existing = await this.reservationDb.findById(id);
        if (!existing) throw new ApiError(404, { message: "Reservation not found" });

        const b = body as Record<string, unknown>;
        const set: Partial<ReservationDoc & { updatedAt: Date }> = {};

        if ("roomId" in b) {
            const v = b["roomId"];
            if (typeof v !== "string" || v.trim() === "") throw new ApiError(400, { message: "roomId must be a non-empty string" });
            set.roomId = v.trim();
        }
        if ("title" in b) {
            const v = b["title"];
            if (typeof v !== "string" || v.trim() === "") throw new ApiError(400, { message: "title must be a non-empty string" });
            set.title = v.trim();
        }
        if ("createdBy" in b) {
            const v = b["createdBy"];
            if (typeof v !== "string" || v.trim() === "") throw new ApiError(400, { message: "createdBy must be a non-empty string" });
            set.createdBy = v.trim();
        }
        if ("start" in b) set.start = this.parseIsoDate(b["start"], "start");
        if ("end" in b) set.end = this.parseIsoDate(b["end"], "end");

        const resolvedStart = set.start ?? existing.start;
        const resolvedEnd = set.end ?? existing.end;
        if (resolvedEnd <= resolvedStart) throw new ApiError(400, { message: "end must be after start" });

        const resolvedRoomId = set.roomId ?? existing.roomId;
        set.updatedAt = new Date();

        const updated = await this.reservationDb.updateById(id, resolvedRoomId, resolvedStart, resolvedEnd, set);
        if (!updated) throw new ApiError(404, { message: "Reservation not found" });
        return updated;
    }

    async delete(id: string): Promise<void> {
        const found = await this.reservationDb.deleteById(id);
        if (!found) throw new ApiError(404, { message: "Reservation not found" });
    }
}
