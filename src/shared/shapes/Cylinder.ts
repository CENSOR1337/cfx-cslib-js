import { Vector3 } from "@censor1337/cfx-core/shared";
import { Shape } from "../Shape";

class ShapeCylinder implements Shape {
	public readonly point: Vector3;
	public readonly radius: number;
	public readonly height: number;
	public readonly pos: Vector3;

	constructor(point: Vector3, radius: number, height: number) {
		this.point = point;
		this.radius = radius;
		this.height = height;
		this.pos = point;
	}

	public isPointIn(pos: Vector3): boolean {
		const { x, y, z } = this.point;
		const { x: px, y: py, z: pz } = pos;

		const dx = px - x;
		const dy = py - y;
		const dz = pz - z;

		const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

		return dist <= this.radius && py >= y && py <= y + this.height;
	}
}

export { ShapeCylinder };
