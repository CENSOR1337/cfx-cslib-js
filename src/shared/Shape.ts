import { Vector3 } from "@censor1337/cfx-core/shared";

interface Shape {
	isPointIn(pos: Vector3): boolean;
}

export { Shape };
export { ShapeCircle } from "./shapes/Circle";
export { ShapeSphere } from "./shapes/Sphere";
export { ShapePolygon } from "./shapes/Polygon";
export { ShapeCylinder } from "./shapes/Cylinder";
