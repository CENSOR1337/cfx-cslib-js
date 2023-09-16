import { Collision } from "./Collision";
import { Vector3 } from "@censor1337/cfx-api/server";
import * as cfx from "@censor1337/cfx-api/server";

export class CollisionSphere extends Collision {
	radius: number;
	constructor(pos: Vector3, radius: number) {
		super(pos);
		this.radius = radius;
	}

	protected isPointIn(pos: Vector3) {
		return this.pos.distanceTo(pos) <= this.radius;
	}

	protected isEntityIn(entity: number) {
		const position = cfx.getEntityCoords(entity);
		return this.isPointIn(position);
	}
}
