import { Player } from "./Player";
import { Event as EventShared } from "cfx-server";
import * as cfx from "cfx-server";

// export class Events extends EventShared {
// 	protected static getObjectClass(obj: any): any {
// 		const objType = obj.type;
// 		if (!objType) return obj;

// 		switch (objType) {
// 			case Player.type: {
// 				return Player.fromSource(obj.source);
// 			}
// 		}

// 		return super.getObjectClass(obj);
// 	}

// 	public static emitClient(eventName: string, target: number | string | Player, ...args: any[]): void {
// 		if (target instanceof Player) {
// 			target = target.src;
// 		}
// 		cfx.Event.emitAllClients(eventName, target, ...args);
// 	}
// }
