import { ObjectId } from "mongodb";

export type RoomDoc = {
    name: string;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
};

export type RoomEntity = RoomDoc & { _id: ObjectId };