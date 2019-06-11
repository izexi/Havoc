import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';

export default class Help extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'Shows a list of all avaiable commands, or detailed info about a specific command.',
			aliases: new Set(['h']),
			args: [{ type: 'command' }]
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: Command } }) {
		const command = target;
		if (command && command.category !== 'dev') {
			const embed = msg.constructEmbed({
				setTitle: `Command info for  **\`${command.name}\`**\n⠀`,
				addField: [
					['❯Description', command.description, true],
					['❯Category', Util.captialise(command.category), true]
				],
				attachFiles: [`src/assets/images/${command.category}.png`],
				setThumbnail: `attachment://${command.category}.png`
			});
			if (command.aliases) {
				embed.addField('❯Aliases', [...command.aliases].map(alias => `\`${alias}\``).join(', '));
			}
			return msg.response = await msg.sendEmbed(embed);
		}
		const emojis: { [key: string]: string } = {
			emojis: '<:emojis:466978216339570701>',
			fun: '<:fun:407988457772810241>',
			miscellaneous: '<:miscellaneous:404688801903017984>',
			moderation: '<:moderation:407990341157912587>',
			server: '🛠',
			donators: '💸',
			music: '🎶',
			image: '🖼'
		};
		const commands = this.commands.filter(c => c.category !== 'dev');
		const categories: Set<string> = commands.reduce((uniqueCategories, { category }) => uniqueCategories.add(category), new Set());
		const fields = [...categories].reduce((arr: string[][], commandCategory) => {
			arr.push([
				`${emojis[commandCategory]} ${Util.captialise(commandCategory)}`,
				commands
					.filter(({ category }) => category === commandCategory)
					.map(c => `\`${c.name}\``).join(', ')
			]);
			return arr;
		}, []);
		msg.response = await msg.sendEmbed({
			setDescription: `You can view more info about a command by doing \`${msg.prefix}help [command name]\`\nClick **[here](https://discord.gg/3Fewsxq)** to join the support server here\nClick **[here](https://discordapp.com/oauth2/authorize?client_id=${this.user!.id}&scope=bot&permissions=2146958591)** to invite me to your server\n⠀`,
			addField: fields
		});
	}
}
