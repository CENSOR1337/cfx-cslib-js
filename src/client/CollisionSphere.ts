import { Vector3 } from "cfx-client";
import { Collision } from "./Collision";
import * as natives from "cfx-natives";

export class CollisionSphere extends Collision {
	radius: number;
	constructor(pos: Vector3, radius: number) {
		super(pos);
		this.radius = radius;
	}

	protected isPositionInside(pos: Vector3): boolean {
		return this.pos.distance(pos) <= this.radius;
	}

	protected isEntityInside(entity: number) {
		const position = natives.getEntityCoords(entity, false);
		return this.isPositionInside(position);
	}
}
