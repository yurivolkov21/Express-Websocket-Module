import { Router } from "express";
import { ReservationDatabase } from "./reservations.database.js";
import { ReservationService } from "./reservations.service.js";
import { ReservationController } from "./reservations.controller.js";

const router = Router();

const db = new ReservationDatabase();
const service = new ReservationService(db);
const controller = new ReservationController(service);

router.get("/", controller.list);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export const reservationRouter = router;
