import type { ReservationService } from "./reservations.service.js";
import { ok } from "../../utils/http.js";
import type { ActionController } from "../../types/express.js";
import type { ReservationEntity } from "./reservations.model.js";

export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    private toDto(r: ReservationEntity) {
        return {
            id: r._id.toString(),
            roomId: r.roomId,
            title: r.title,
            start: r.start,
            end: r.end,
            createdBy: r.createdBy,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        };
    }

    list: ActionController = async (req, res) => {
        const q = req.query as Record<string, string | undefined>;
        const reservations = await this.reservationService.list({
            ...(q["roomId"] !== undefined ? { roomId: q["roomId"] } : {}),
            ...(q["from"] !== undefined ? { from: q["from"] } : {}),
            ...(q["to"] !== undefined ? { to: q["to"] } : {}),
        });
        res.json(ok(reservations.map(r => this.toDto(r))));
    };

    create: ActionController = async (req, res) => {
        const reservation = await this.reservationService.create(req.body as unknown);
        res.status(201).json(ok(this.toDto(reservation)));
    };

    update: ActionController = async (req, res) => {
        const { id } = req.params as { id: string };
        const reservation = await this.reservationService.update(id, req.body as unknown);
        res.json(ok(this.toDto(reservation)));
    };

    delete: ActionController = async (req, res) => {
        const { id } = req.params as { id: string };
        await this.reservationService.delete(id);
        res.status(204).send();
    };
}
