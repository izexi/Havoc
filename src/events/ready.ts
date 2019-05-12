import Logger from '../util/Logger';
import { Client } from 'discord.js';

export default function(this: Client) {
	this.user!.setActivity('you', { type: 'WATCHING' });
	Logger.log(`${this.user!.tag} is ready in ${this.guilds.size} guilds!`);
}
