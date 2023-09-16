import { Vector3 } from "@censor1337/cfx-api/client";
import { Collision } from "./Collision";
import * as natives from "@censor1337/cfx-core/natives";

export class CollisionSphere extends Collision {
	radius: number;
	constructor(pos: Vector3, radius: number) {
		super(pos);
		this.radius = radius;
	}

	protected isPositionInside(pos: Vector3): boolean {
		return this.pos.distanceTo(pos) <= this.radius;
	}

	protected isEntityIn(entity: number) {
		const position = natives.getEntityCoords(entity, false);
		return this.isPositionInside(position);
	}
}
