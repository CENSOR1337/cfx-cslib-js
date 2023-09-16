import * as cfx from "@censor1337/cfx-api/shared";
import { Resource } from "./Resource";
const dict = new Map<string, string>();
class Locale {
	public static load(language: string) {
		if (!language) throw new Error("language is required");
		const fileContent = cfx.loadResourceFile(Resource.resourceName, `locales/${language}.json`);
		if (!fileContent) throw new Error(`Locale file ${language}.json not found`);
		const locales = JSON.parse(fileContent);
		for (const localeId in locales) {
			const locale = locales[localeId];
			if (typeof localeId !== "string") throw new Error(`Invalid locale ${localeId}`);
			if (typeof locale !== "string") throw new Error(`Invalid locale ${localeId}`);
			dict.set(localeId, locale);
		}
	}

	public static get(id: string, values?: Record<string, string>): string | undefined {
		if (!dict.has(id)) return undefined;
		let locale = dict.get(id);
		if (!locale) return undefined;
		if (!values) return locale;
		for (const key in values) {
			const value = values[key];
			locale = locale.replace(`\${${key}}`, value);
		}
		return locale;
	}
}

export { Locale };
