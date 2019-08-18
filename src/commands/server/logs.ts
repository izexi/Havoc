import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Logs extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Configure the logs for the server.',
			args: [{
				key: 'subCommand',
				type: (msg: HavocMessage) => {
					const option = msg.arg;
					if (['enable', 'update', 'disable'].includes(option)) return option;
				},
				prompt: {
					initialMsg: 'would you like to `enable`, `update` or `disable` logs for this server? (enter the according option)',
					invalidResponseMsg: 'You will need to enter either `enable`, `update` or `disable`'
				}
			}],
			userPerms: { flags: 'MANAGE_GUILD' },
			usage: [
				'[enable | updated] [{channel}]',
				'[disable]'
			],
			examples: {
				'enable {channel}': 'enables logs in the server for the corresponding channel',
				'disable': 'disables logs in the server'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { subCommand } }: { msg: HavocMessage; target: { subCommand: string } }) {
		msg.args = msg.args.filter(arg => !['enable', 'update', 'disable'].includes(arg));
		this.commands.handler.handle(msg, this.commands.get(`logs-${subCommand.replace(/update/i, 'enable')}`)!);
	}
}
