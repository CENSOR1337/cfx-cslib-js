import { LocalEntity } from "./LocalEntity";
import { Vector3 } from "@censor1337/cfx-api/client";
import { EntityType } from "./LocalEntity";

export class LocalPed extends LocalEntity {
	constructor(modelHash: string | number, position: Vector3, rotation: Vector3) {
		super(modelHash, position, rotation, EntityType.Ped);
	}
}
