import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';
import Logger from '../../util/Logger';

export default class Reload extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Reloads a command.',
			aliases: new Set(['r']),
			args: [{
				type: 'command',
				prompt: {
					initialMsg: 'enter the command name or an alias of the command.',
					invalidResponseMsg: 'Command doesn\'t exist'
				}
			}]
		});
	}

	public async run(this: HavocClient, { msg, target: { command } }: { msg: HavocMessage; target: { command: Command } }) {
		try {
			msg.respond(`attempting to reload \`${command.name}\`...`, false).then(m => {
				msg.client.commands.handler.reload(command);
				m.edit(m.embeds[0].setDescription(`**${msg.author.tag}**, \`${command.name}\` has been reloaded.`));
			}).catch(err => Logger.error(`Error while reloading ${command.name}`, err));
		} catch (error) {
			msg.respond(`there was an error while attempting to reload \`${command.name}\`.\n${Util.codeblock(error.stack)}`);
		}
	}
}
