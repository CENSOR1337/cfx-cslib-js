import { Entity } from "./Entity";
import { Vector3, Event } from "@censor1337/cfx-api/server";
import * as cfx from "@censor1337/cfx-api/server";

export class Player extends Entity {
	public readonly type = "player";
	public static readonly type = "player";
	public readonly source: number;

	public static get all(): Array<Player> {
		const players = new Array<Player>();
		const num = cfx.getNumPlayerIndices();
		for (let i = 0; i < num; i++) {
			const playerId = cfx.getPlayerFromIndex(i);
			const player = Player.fromSource(playerId);
			players.push(player);
		}
		return players;
	}

	constructor(src: number | string) {
		const source = typeof src === "string" ? Number(src) : src;
		super(source);
		this.source = source;
	}

	/*
	 * this is override function in Entity class
	 * this function return player ped handle
	 */
	public get handle(): number {
		return cfx.getPlayerPed(this.sourceStr);
	}

	public static fromSource(src: number | string): Player {
		return new Player(src);
	}

	private get sourceStr(): string {
		return String(this.source);
	}

	public get src(): number {
		return this.source;
	}

	public get ped(): number {
		return cfx.getPlayerPed(this.sourceStr);
	}

	public get identifiers(): string[] {
		const identifiers = new Array<string>();
		const num = cfx.getNumPlayerIdentifiers(this.sourceStr);
		for (let i = 0; i < num; i++) {
			identifiers.push(cfx.getPlayerIdentifier(this.sourceStr, i));
		}
		return identifiers;
	}

	public get endPoint(): string {
		return cfx.getPlayerEndpoint(this.sourceStr);
	}

	public get name(): string {
		return cfx.getPlayerName(this.sourceStr);
	}

	public get ping(): number {
		return cfx.getPlayerPing(this.sourceStr);
	}

	public get pos(): Vector3 {
		return cfx.getEntityCoords(this.ped);
	}

	public get rot(): Vector3 {
		return cfx.getEntityRotation(this.ped);
	}

	public get isMuted(): boolean {
		return cfx.mumbleIsPlayerMuted(this.source);
	}

	public set isMuted(isMuted: boolean) {
		cfx.mumbleSetPlayerMuted(this.source, isMuted);
	}

	public isAceAllowed(object: string): boolean {
		return cfx.isPlayerAceAllowed(this.sourceStr, object);
	}

	public drop(reason: string): void {
		cfx.dropPlayer(this.sourceStr, reason);
	}

	public emit(eventName: string, ...args: any[]): void {
		Event.emitClient(eventName, this.source, ...args);
	}
}
