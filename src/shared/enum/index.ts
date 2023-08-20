const namespace = "cslib:core";

export function appendNamespace(name: string): string {
	return `${namespace}:${name}`;
}

export function appendInternalNamespace(name: string): string {
	return `${namespace}:internal:${name}`;
}
