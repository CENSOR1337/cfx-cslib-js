import { Vector3 } from "@censor1337/cfx-api/client";
import { Collision as CollisionBase } from "../../shared";
import { randomUUID } from "../utils/uuid";
import { Shape } from "../../shared";
import * as cfx from "@censor1337/cfx-api/client";
import * as natives from "@censor1337/cfx-core/natives";

export class Collision extends CollisionBase {
	constructor(shape: Shape) {
		const id = randomUUID();
		super(id, shape);
	}

	protected isEntityValid(entity: number) {
		if (!this.isEntityIn(entity)) return false;
		return true;
	}

	protected getRevelantEntities(): Array<number> {
		const entities = new Array<number>();
		const players = cfx.getActivePlayers();

		for (const player of players) {
			const ped = natives.getPlayerPed(player);
			entities.push(ped);
		}

		if (!this.playersOnly) {
			const vehicles = cfx.getGamePool("CVehicle");
			const objects = cfx.getGamePool("CObject");
			const peds = cfx.getGamePool("CPed");

			entities.push(...vehicles);
			entities.push(...objects);
			entities.push(...peds);
		}

		return entities.filter((entity) => this.isEntityValid(entity));
	}

	public isEntityIn(entity: number): boolean {
		const position = natives.getEntityCoords(entity, false);
		return this.isPointIn(position);
	}
}
