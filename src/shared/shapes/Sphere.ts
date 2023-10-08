import { Vector3 } from "@censor1337/cfx-core/shared";
import { Shape } from "../Shape";

class ShapeSphere implements Shape {
	public readonly point: Vector3;
	public readonly radius: number;
	public readonly pos: Vector3;

	constructor(point: Vector3, radius: number) {
		this.point = point;
		this.radius = radius;
		this.pos = point;
	}

	public isPointIn(pos: Vector3): boolean {
		return pos.distanceTo(this.point) <= this.radius;
	}
}

export { ShapeSphere };
