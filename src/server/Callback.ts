import { Player } from "./Player";
import { randomUUID } from "./utils/uuid";
import { Event } from "@censor1337/cfx-api/server";
import { Callback as CallbackShared } from "../shared/Callback";

export class Callback extends CallbackShared {
	public static emit<T>(eventName: string, player: Player, ...args: any[]): Promise<T> {
		const cbId = randomUUID();
		const promise = new Promise<T>((resolve, reject) => {
			Event.onceClient(cbId, (source: number, data: any) => {
				resolve(data as T);
			});
		});
		player.emit(`${this.clientNamespace}:${eventName}`, cbId, ...args);
		return promise;
	}

	public static register(eventName: string, handler: (player: Player, ...args: any[]) => void): Event {
		return Event.onClient(`${this.serverNamespace}:${eventName}`, (source: number, cbId: string, ...args: any[]) => {
			const player = Player.fromSource(source);
			player.emit(cbId, handler(player, ...args));
		});
	}
}
