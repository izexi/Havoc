import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';
import HavocTextChannel from '../../extensions/TextChannel';
import { stripIndents } from 'common-tags';

export default class LogsEnable extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0000,
			description: 'Configure logs for the server.',
			userPerms: { flags: ['MANAGE_GUILD', 'MANAGE_WEBHOOKS'] }
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const events = Util.logEvents;
		const { disabledLogs } = msg.guild;
		const constructEmbed = () => events.reduce((e, event, i) =>
			e.addField(`\`${(i + 1)}\`) ${Util.captialise(event)}`, disabledLogs.has(i) ? '<:disabled:468708113453809664> Off' : '<:enabled:468708094323589121> On', true)
		, msg.constructEmbed({ setTitle: `Logs configuration for ${msg.guild.name}` }));
		const validateEvent = (_option: string | number): string | undefined => {
			if (events.includes(_option.toString())) return _option.toString();
			if (Number(_option)) {
				_option = Number(_option);
				if (_option > 0 && _option <= events.length) return events[_option - 1];
			}
		};
		const prompt = await msg.channel.send(stripIndents`**${msg.author}** enter the number according to the action you would like to enable/disable.
					E.g: if \`Channel creations\` is \`On\` and you would like to disable it enter \`channel creations\` or \`1\`.
					Enter \`cancel\` to cancel this command and enter \`done\` if you have finished using this command.`, constructEmbed());
		await prompt.react('464034357955395585');
		(msg.channel as HavocTextChannel).prompts.add(msg.author.id);
		let countdown = 55;
		const interval: NodeJS.Timeout = setInterval(async () => {
			if (!countdown) return clearInterval(interval);
			if (!prompt.deleted) await prompt.edit(prompt.embeds[0].setFooter(`You have ${countdown -= 5} seconds left to enter an option.`));
		}, 5000);
		const collector = msg.channel.createMessageCollector(m => m.author.id === msg.author.id, { time: 60000 });
		collector.on('collect', async message => {
			const _option = message.content.toLowerCase();
			const event = validateEvent(_option);
			await message.delete();
			if (event) {
				const index = events.indexOf(event);
				const state = disabledLogs.has(index) ? 'enabled' : 'disabled';
				this.db.category = 'disabledLogs';
				if (!disabledLogs.delete(index)) disabledLogs.add(index);
				await this.db.set(msg.guild.id, [...disabledLogs]);
				await prompt.edit(constructEmbed());
				await msg.respond(`I have ${state} logs for \`${Util.captialise(event)}\``).then(async m => m.delete({ timeout: 3000 }));
			} else if (_option === 'cancel' || _option === 'done') {
				collector.stop(_option);
			} else {
				await msg.sendEmbed({
					setDescription: `**${msg.author}** you have entered an invalid type of log type, you need to either enter the type itself or the according number (which you can see on \`${msg.prefix}view\`
							E.g: if \`Channel creations\` is \`On\` and you would like to disable it enter \`channel creations\` or \`1\``
				}).then(async m => m.delete({ timeout: 5000 }));
			}
		}).on('end', async (_, reason) => {
			let footer;
			let emoji;
			clearInterval(interval);
			await prompt.reactions.removeAll();
			if (reason === 'time') {
				await msg.respond(`60 seconds is over.`).then(async m => m.delete({ timeout: 3000 }));
				footer = 'Command timed out.';
				emoji = '⏲';
			} else if (reason === 'cancel') {
				footer = 'Command was cancelled.';
				emoji = '464034188652183562';
			} else {
				footer = 'Command has been executed.';
				emoji = '464033586748719104';
			}
			await prompt.edit(msg.author.toString(), prompt.embeds[0].setFooter(footer));
			prompt.react(emoji);
		});
	}
}
