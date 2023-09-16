import { Vector3 } from "@censor1337/cfx-api/client";
import { Collision as CollisionBase } from "../shared/Collision";
import { randomUUID } from "./utils/uuid";
import * as cfx from "@censor1337/cfx-api/client";
import * as natives from "@censor1337/cfx-core/natives";

export abstract class Collision extends CollisionBase {
	constructor(pos: Vector3) {
		const id = randomUUID();
		super(id, pos);
	}

	protected isEntityValid(entity: number) {
		if (!natives.doesEntityExist(entity)) return false;
		if (!this.isEntityInside(entity)) return false;
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

		return entities;
	}

	protected abstract isPositionInside(pos: Vector3): boolean;
	protected abstract isEntityInside(entity: number): boolean;
}
