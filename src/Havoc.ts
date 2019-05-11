import { Client, ClientOptions } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { token } = require('../config.json');

export default class HavocClient extends Client {
	public constructor(options: ClientOptions = {}) {
		super(options);
		this.init();
	}

	private init(): void {
		this.login(token)
			.then((): void => console.log(`Logged in as ${this.user!.tag}`))
			.catch((err): void => console.log('Error while logging in', err));
	}
}
