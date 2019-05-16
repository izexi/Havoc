export default {
	prefix(clientID: string, prefix: string) {
		return new RegExp(`^(<@!?${clientID}>|${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*`);
	},
	mentionPrefix(clientID: string) {
		return new RegExp(`^<@!?${clientID}>`);
	}
};
