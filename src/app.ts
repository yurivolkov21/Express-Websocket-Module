import express from "express";
import { roomRouter } from "./modules/rooms/room.routes.js";
import { reservationRouter } from "./modules/reservations/reservations.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export function createApp() {
    const app = express();

    app.use(express.json());

    app.use("/api/rooms", roomRouter);
    app.use("/api/reservations", reservationRouter);

    app.use(errorMiddleware);

    return app;
}
