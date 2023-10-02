import { Vector2, Vector3 } from "@censor1337/cfx-core/shared";
import { Shape } from "../Shape";

class ShapePolygon implements Shape {
	public readonly points: ReadonlyArray<Vector2>;

	constructor(points: Vector2[]) {
		this.points = points;
	}

	public isPointIn(pos: Vector3) {
		let inside = false;

		const points = this.points;
		for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
			const { x: currentX, y: currentY } = points[i];
			const { x: prevX, y: prevY } = points[j];

			const intersect = currentY > pos.y !== prevY > pos.y && pos.x < ((prevX - currentX) * (pos.y - currentY)) / (prevY - currentY) + currentX;
			if (intersect) inside = !inside;
		}

		return inside;
	}

	public get center(): Vector2 {
		let vec = new Vector2(0, 0);
		for (const point of this.points) {
			vec = vec.add(point);
		}
		return vec.div(this.points.length);
	}

	public get triangles(): Vector2[][] {
		const center = this.center;
		const triangles: Vector2[][] = [];
		for (let i = 0; i < this.points.length; i++) {
			triangles.push([center, this.points[i], this.points[(i + 1) % this.points.length]]);
		}
		return triangles;
	}

	public get point(): Vector2 {
		return new Vector2(this.center.x, this.center.y);
	}
}

export { ShapePolygon };
