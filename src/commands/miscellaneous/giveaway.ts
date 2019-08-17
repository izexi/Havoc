import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { handleMessage } from '../../events/message';
import Responses from '../../util/Responses';

export default class Giveaway extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Creates a giveaway with options.',
			aliases: new Set(['g']),
			args: [{
				key: 'subCommand',
				type: (msg: HavocMessage) => {
					const option = msg.arg;
					if (['start', 'end', 'reroll', 'config'].includes(option)) return option;
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
			},
			usage: [
				'[start] [time] [number of winners] [prize]',
				`[config] [channel] [${Responses.usage('channel')}]`,
				`[config] [role] [${Responses.usage('role')}]`,
				'[end] [giveaway ID]',
				'[reroll] [giveaway ID]'
			],
			examples: {
				'start 2d 5 nothing': 'starts a giveaway for 5 possible winners that rewards "nothing" ending in 2 days',
				'config channel {channel}': 'changes the giveaway channel to the corresponding channel (future giveaways will take place in this channel)',
				'config role {role}': 'changes the giveaway role to the corresponding role (anyone with this role can start/config/end/reroll giveaways)',
				'end {id}': 'ends the giveaway with the corresponding ID',
				'reroll {id}': 'rerolls the giveaway with the corresponding ID'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { subCommand } }: { msg: HavocMessage; target: { subCommand: string } }) {
		msg.args = msg.args.filter(arg => !['start', 'end', 'reroll', 'config'].includes(arg));
		handleMessage(this, msg, this.commands.get(`giveaway-${subCommand}`)!);
	}
}
