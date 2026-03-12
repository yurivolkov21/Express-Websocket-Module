import { ObjectId } from "mongodb";
import { getDb } from "../../database/mongo.js";
import type { RoomDoc, RoomEntity } from "./room.model.js";

export class RoomDatabase {
    private col() {
        return getDb().collection<RoomDoc>("rooms");
    }

    async list(): Promise<RoomEntity[]> {
        return this.col().find({}).toArray() as Promise<RoomEntity[]>;
    }

    async create(doc: RoomDoc): Promise<RoomEntity> {
        const res = await this.col().insertOne(doc);
        return { ...doc, _id: res.insertedId };
    }
}
