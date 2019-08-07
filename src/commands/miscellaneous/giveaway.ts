import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { handleMessage } from '../../events/message';

export default class Giveaway extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Creates a giveaway with options.',
			aliases: new Set(['g']),
			args: [{
				key: 'subCommand',
				type: (msg: HavocMessage) => {
					if (['start', 'end', 'reroll', 'config'].includes(msg.arg.toLowerCase())) return msg.arg.toLowerCase();
				},
				prompt: {
					initialMsg: 'would you like to `start`, `end`, `reroll` or `config` a giveaway? (enter the according option)',
					invalidResponseMsg: 'You will need to enter either `start`, `end` or `reroll`'
				}
			}],
			userPerms: {
				role: async (msg: HavocMessage) => {
					const { giveaway } = await msg.guild.config;
					const { role }: { role: string } = giveaway || {};
					return role;
				},
				flags: 'MANAGE_GUILD'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { subCommand } }: { msg: HavocMessage; target: { subCommand: string } }) {
		msg.args = msg.args.filter(arg => !['start', 'end', 'reroll', 'config'].includes(arg));
		handleMessage(this, msg, this.commands.get(`giveaway-${subCommand}`)!);
	}
}
