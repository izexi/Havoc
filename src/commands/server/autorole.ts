import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { handleMessage } from '../../events/message';

export default class Autorole extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Configure the autorole (role to give members on joins) for the server.',
			args: [{
				key: 'subCommand',
				type: (msg: HavocMessage) => {
					const option = msg.arg;
					if (['enable', 'update', 'disable'].includes(option)) return option;
				},
				prompt: {
					initialMsg: 'would you like to `enable`, `update` or `disable` the autorole for this server? (enter the according option)',
					invalidResponseMsg: 'You will need to enter either `enable`, `update` or `disable`'
				}
			}],
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg, target: { subCommand } }: { msg: HavocMessage; target: { subCommand: string } }) {
		msg.args = msg.args.filter(arg => !['enable', 'update', 'disable'].includes(arg));
		handleMessage(this, msg, this.commands.get(`autorole-${subCommand.replace(/update/i, 'enable')}`)!);
	}
}
