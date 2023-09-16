import { Resource as ResourceShared } from "../shared/Resource";
import { Event } from "@censor1337/cfx-api/client";
import { Callback } from "./Callback";

class ResourceCallback extends Callback {
	public static emit<T>(eventName: string, ...args: any[]): Promise<T> {
		return super.emit(Resource.getEventName(eventName), ...args);
	}

	public static register(eventName: string, handler: (...args: any[]) => void): Event {
		return super.register(Resource.getEventName(eventName), handler);
	}
}

export class Resource extends ResourceShared {
	public static readonly Callback = ResourceCallback;

	public static on(eventName: string, handler: (...args: any[]) => void): Event {
		return Event.on(this.getEventName(eventName), handler);
	}

	public static once(eventName: string, handler: (...args: any[]) => void): Event {
		return Event.once(this.getEventName(eventName), handler);
	}

	public static emitServer(eventName: string, ...args: any[]) {
		return Event.emitServer(this.getEventName(eventName), ...args);
	}

	public static onServer(eventName: string, handler: (...args: any[]) => void): Event {
		return Event.onServer(this.getEventName(eventName), handler);
	}

	public static onceServer(eventName: string, handler: (...args: any[]) => void): Event {
		return Event.onceServer(this.getEventName(eventName), handler);
	}
}
