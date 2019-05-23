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
			target: 'command'
		});
	}

	public async run(this: HavocClient, { msg, targetObj: { target } }: { msg: HavocMessage; targetObj: { target: Command } }) {
		const command = target;
		if (command) {
			const usage: { [key: string]: string } = {
				user: '@Username#0000 | userID | username#0000 | username | nickname | partial nickname/username',
				string: 'text',
				emoji: '<(a):name:id> | id | unicode',
				command: 'command name'
			};
			const embed = msg.constructEmbed({
				setTitle: `Command info for  **\`${command.name}\`**\n⠀`,
				addField: [
					['❯Description', command.description, true],
					['❯Category', Util.captialise(command.category), true]
				],
				attachFiles: [`src/images/${command.category}.png`],
				setThumbnail: `attachment://${command.category}.png`
			});
			if (command.aliases) {
				embed.addField('❯Aliases', [...command.aliases].map(alias => `\`${alias}\``).join(', '));
			}
			if (command.target) {
				const args = command.opts & (1 << 3);
				embed.addField('❯Usage', `\`${msg.prefix}${command.name} ${args ? '[' : '<'}${usage[command.target]}${args ? ']' : '>'}\``);
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
		const categories = this.commands.reduce((uniqueCategories, { category }): Set<string> => uniqueCategories.add(category), new Set());
		const fields = [...categories].reduce((arr: string[][], commandCategory) => {
			arr.push([
				`${emojis[commandCategory]} ${commandCategory.replace(/./, (firstLetter: string) => firstLetter.toUpperCase())}`,
				this.commands
					.filter(({ category }) => category === commandCategory)
					.map(c => `\`${c.name}\``).join(', ')
			]);
			return arr;
		}, []);
		msg.response = await msg.sendEmbed({
			setDescription: `You can view more info about a command by doing \`${msg.prefix}help [command name]\`
                Click **[here](https://discord.gg/3Fewsxq)** to join the support server here
				Click **[here](https://discordapp.com/oauth2/authorize?client_id=${this.user!.id}&scope=bot&permissions=2146958591)** to invite me to your server
				⠀`,
			addField: fields
		});
	}
}
