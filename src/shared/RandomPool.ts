interface IRandomPoolItem<V> {
	probability: number;
	value: V;
}

class RandomPool<V> {
	public readonly itemMap = new Map<number, IRandomPoolItem<V>>();
	private _cumulative = 0;
	private currentId = 0;

	public get items(): Array<IRandomPoolItem<V>> {
		return Array.from(this.itemMap.values());
	}

	public get cumulative(): number {
		return this._cumulative;
	}

	private calculateCumulative(): void {
		let cumulative = 0;
		for (const [id, item] of this.itemMap) {
			cumulative += item.probability;
		}
		this._cumulative = cumulative;
	}

	public add(probability: number, value: V): number {
		const id = this.currentId++;
		const item = { probability, value };
		this.itemMap.set(id, item);
		this.calculateCumulative();
		return id;
	}

	public remove(id: number): void {
		const item = this.itemMap.get(id);
		if (!item) return;
		this.itemMap.delete(id);
		this.calculateCumulative();
	}

	public random(): V | undefined {
		if (this.cumulative == 0) return undefined;
		const randVal = Math.random() * this.cumulative;
		let cumulative = 0;
		for (const [id, item] of this.itemMap) {
			cumulative += item.probability;
			if (randVal <= cumulative) {
				return item.value;
			}
		}
		return undefined;
	}
}

export { RandomPool };
