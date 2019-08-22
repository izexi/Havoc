import { MessageEmbed } from 'discord.js';
import HavocClient from '../client/Havoc';
import HavocTextChannel from '../extensions/TextChannel';
import Util from '../util/Util';

export default function(this: HavocClient, error: Error, shardID: number) {
	(this.channels.get('614043112662368277') as HavocTextChannel).send(
		new MessageEmbed()
			.setTitle(`Shard ${shardID} encountered an error`)
			.setDescription(Util.codeblock(error.stack || error.toString()))
			.setColor('RED')
			.setTimestamp()
	).catch(() => null);
}
