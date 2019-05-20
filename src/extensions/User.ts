import { User } from 'discord.js';

export default class HavocUser extends User {
	public get pfp() { // to make life easier
		return this.displayAvatarURL();
	}
}
