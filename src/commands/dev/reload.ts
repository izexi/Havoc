import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';

export default class Reload extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Reloads a command.',
			aliases: new Set(['r']),
			target: 'command',
			prompt: {
				initialMsg: ['enter the command name or an alias of the command.'],
				validateFn: (msg: HavocMessage, str: string): boolean => msg.client.commands.has(str),
				invalidResponseMsg: 'Command doesn\'t exist'
			}
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: Command } }) {
		const command = target;
		try {
			msg.response = await msg.sendEmbed({
				setDescription: `**${msg.author.tag}**, Attempting to reload \`${command.name}\`...`
			});
			msg.client.commands.handler.reload(command);
			msg.response.edit(msg.response.embeds[0].setDescription(`**${msg.author.tag}**, \`${command.name}\` has been reloaded.`));
		} catch (error) {
			msg.sendEmbed({
				setDescription: `**${msg.author.tag}**, there was an error while attempting to reload \`${command.name}\`.\n${Util.codeblock(error.stack)}`
			});
		}
	}
}
