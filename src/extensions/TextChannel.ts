import { TextChannel, StringResolvable, MessageOptions, MessageAdditions, MessageEmbed } from 'discord.js';
import Util from '../util/Util';

export default class HavocTextChannel extends TextChannel {
	public prompts = new Set();

	public async send(content?: StringResolvable, options?: MessageOptions | MessageAdditions): Promise<any> {
		if (this.type === 'text' && !this.permissionsFor(this.guild.me!)!.has(['VIEW_CHANNEL', 'SEND_MESSAGES'])) return;
		if (options instanceof MessageEmbed) {
			let description = options.description;
			if (description && description.length > 2048) {
				description = await Util.haste(description).catch(() => 'The description was too long to be displayed');
				options.description = description;
			}
		}
		return super.send(content, options);
	}
}
