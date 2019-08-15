import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class Info extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Supports me and unlock donator commands.'
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		msg.sendEmbed({
			setDescription:
				`Donate to me by clicking **[here](https://www.patreon.com/user?u=15028160)** (join [this server](https://discord.gg/3Fewsxq) to receive your rewards) 
				  • $1      Donator role in the support server
				  • $5      All of the above & Get access to animated emoji commands
				  • $10      All of the above & the emojify command
				  • $15+      All of the above & your own custom command
				All donations will be used towards hosting costs for the bot. Donations are NOT required or expected, but are much appreciated`
		});
	}
}
