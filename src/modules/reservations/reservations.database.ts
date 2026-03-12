import { ObjectId } from "mongodb";
import { getDb } from "../../database/mongo.js";
import { ApiError } from "../../utils/http.js";
import type { ReservationDoc, ReservationEntity } from "./reservations.model.js";

export class ReservationDatabase {
    private col() {
        return getDb().collection<ReservationDoc>("reservations");
    }

    private async checkConflict(
        roomId: string,
        start: Date,
        end: Date,
        excludeId?: string
    ): Promise<void> {
        // Overlap condition: existing.start < new.end AND existing.end > new.start
        const filter: Record<string, unknown> = {
            roomId,
            start: { $lt: end },
            end: { $gt: start },
        };
        if (excludeId) {
            filter["_id"] = { $ne: new ObjectId(excludeId) };
        }
        const conflict = await this.col().findOne(filter);
        if (conflict) {
            throw new ApiError(409, {
                message: "Time slot conflicts with an existing reservation",
                details: {
                    conflictingId: conflict._id.toHexString(),
                    start: conflict.start,
                    end: conflict.end,
                },
            });
        }
    }

    async list(filter: { roomId?: string; from?: Date; to?: Date }): Promise<ReservationEntity[]> {
        const query: Record<string, unknown> = {};
        if (filter.roomId) query["roomId"] = filter.roomId;
        if (filter.from) query["end"] = { $gt: filter.from };
        if (filter.to) query["start"] = { $lt: filter.to };
        return this.col()
            .find(query)
            .sort({ start: 1 })
            .toArray() as Promise<ReservationEntity[]>;
    }

    async create(doc: ReservationDoc): Promise<ReservationEntity> {
        await this.checkConflict(doc.roomId, doc.start, doc.end);
        const res = await this.col().insertOne(doc);
        return { ...doc, _id: res.insertedId };
    }

    async findById(id: string): Promise<ReservationEntity | null> {
        let objectId: ObjectId;
        try { objectId = new ObjectId(id); }
        catch { throw new ApiError(400, { message: "Invalid reservation ID" }); }
        return this.col().findOne({ _id: objectId }) as Promise<ReservationEntity | null>;
    }

    async updateById(
        id: string,
        roomId: string,
        start: Date,
        end: Date,
        set: Partial<ReservationDoc>
    ): Promise<ReservationEntity | null> {
        let objectId: ObjectId;
        try { objectId = new ObjectId(id); }
        catch { throw new ApiError(400, { message: "Invalid reservation ID" }); }
        await this.checkConflict(roomId, start, end, id);
        return this.col().findOneAndUpdate(
            { _id: objectId },
            { $set: set },
            { returnDocument: "after" }
        ) as Promise<ReservationEntity | null>;
    }

    async deleteById(id: string): Promise<boolean> {
        let objectId: ObjectId;
        try { objectId = new ObjectId(id); }
        catch { throw new ApiError(400, { message: "Invalid reservation ID" }); }
        const res = await this.col().deleteOne({ _id: objectId });
        return res.deletedCount === 1;
    }
}
