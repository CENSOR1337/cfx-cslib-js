import { randomUUID } from "./utils/uuid";
import { Event } from "@censor1337/cfx-api/server";
import { Callback as CallbackShared } from "../shared/Callback";

export class Callback extends CallbackShared {
	public static emit<T>(eventName: string, source: number, ...args: any[]): Promise<T> {
		const cbId = randomUUID();
		const promise = new Promise<T>((resolve, reject) => {
			Event.onceClient(cbId, (source: number, data: any) => {
				resolve(data as T);
			});
		});
		Event.emitClient(`${this.clientNamespace}:${eventName}`, source, cbId, ...args);
		return promise;
	}

	public static register(eventName: string, handler: (source: number, ...args: any[]) => void): Event {
		return Event.onClient(`${this.serverNamespace}:${eventName}`, (source: number, cbId: string, ...args: any[]) => {
			Event.emit(cbId, handler(source, ...args));
		});
	}
}
