import type messages from "../../messages/pt.json";

declare module "next-intl" {
	interface AppConfig {
		Messages: typeof messages;
	}
}
