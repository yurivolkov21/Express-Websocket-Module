import type { RoomService } from "./room.service.js";
import { ok } from "../../utils/http.js";
import type { ActionController } from "../../types/express.js";
import type { RoomEntity } from "./room.model.js";

export class RoomController {
    constructor(private readonly roomService: RoomService) {}

    private toDto(room: RoomEntity) {
        return {
            id: room._id.toString(),
            name: room.name,
            capacity: room.capacity,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
        };
    }

    list: ActionController = async (_req, res) => {
        const rooms = await this.roomService.list();
        res.json(ok(rooms.map(r => this.toDto(r))));
    };

    create: ActionController = async (req, res) => {
        const room = await this.roomService.create(req.body as unknown);
        res.status(201).json(ok(this.toDto(room)));
    };
}
