import { ObjectId } from "mongodb";

export type ReservationDoc = {
    roomId: string;
    title: string;
    start: Date;
    end: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
};

export type ReservationEntity = ReservationDoc & { _id: ObjectId };