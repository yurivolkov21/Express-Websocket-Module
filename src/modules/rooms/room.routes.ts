import { Router } from "express";
import { RoomDatabase } from "./room.database.js";
import { RoomService } from "./room.service.js";
import { RoomController } from "./room.controller.js";

const router = Router();

const db = new RoomDatabase();
const service = new RoomService(db);
const controller = new RoomController(service);

router.get("/", controller.list);
router.post("/", controller.create);

export const roomRouter = router;
