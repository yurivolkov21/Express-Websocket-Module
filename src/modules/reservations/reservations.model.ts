export type ReservationDoc = {
    id: string;
    roomId: string;
    title: string;
    start: Date;
    end: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}