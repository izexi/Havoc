import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Reload extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Restart me.'
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		// eslint-disable-next-line promise/catch-or-return
		msg.respond('<a:Restarting:411680219636826112> Restarting...', false).then(async () => {
			this.db.category = 'restart';
			await this.db.set('restart', msg.channel.id);
			process.exit();
		});
	}
}
