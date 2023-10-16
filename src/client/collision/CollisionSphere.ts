import { Vector3 } from "@censor1337/cfx-api/client";
import { Collision } from "./Collision";
import { ShapeSphere } from "../../shared";

export class CollisionSphere extends Collision {
	radius: number;
	constructor(pos: Vector3, radius: number, relevantOnly: boolean = false) {
		const shape = new ShapeSphere(pos, radius);
		super(shape, relevantOnly);
		this.radius = radius;
	}
}
