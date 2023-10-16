import { Vector2, Vector3 } from "@censor1337/cfx-core/shared";
import { Shape } from "../Shape";

class ShapeCircle implements Shape {
    public readonly point: Vector2;
    public readonly radius: number;
    public readonly pos: Vector3;

    constructor(point: Vector2, radius: number) {
        this.point = point;
        this.radius = radius;
        this.pos = new Vector3(point.x, point.y, 0);
    }

    public isPointIn(pos: Vector2): boolean;
    public isPointIn(pos: Vector3): boolean;
    public isPointIn(pos: Vector2 | Vector3): boolean {
        const point = pos instanceof Vector3 ? new Vector2(pos.x, pos.y) : pos;
        return point.distanceTo(this.point) <= this.radius;
    }
}

export { ShapeCircle };
