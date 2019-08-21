import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';
import Time from '../../util/Time';
import PollSchedule from '../../schedules/Poll';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

export default class Poll extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Create a poll with options.',
			args: [{
				type: 'question',
				prompt: {
					initialMsg: 'enter the question that you would like to poll (optional - you may specify a time limit using the `time` flag suffix the time with `w`/`d`/`h`/`m`/`s`, e.g: `3m5s` would be 3 minutes and 5 seconds.)\nE.g: \`pick one -time=10m\` will create a poll with the question "pick one" thaht will end in 10 minutes.',
					invalidResponseMsg: 'you need to enter the question prefixed with `q:` followed by the options prefixed with `a:` and seperated by `;`'
				}
			},
			{
				optional: true,
				type: 'options',
				prompt: {
					initialMsg: 'enter the options seperated by `;`, e.g: `yes;no` would be options yes and no',
					invalidResponseMsg: 'you need to enter the question prefixed with `q:` followed by the options prefixed with `a:` and seperated by `;`'
				}
			}],
			flags: new Set(['time']),
			usage: ['q:[question] a:[option1; option2; etc...] <{prefix}time=time>'],
			examples: {
				'q:is havoc the best bot ever a:yes; yes': 'starts a poll with the question "is havoc the best bot ever" with the options "yes" and "yes"',
				'q:is havoc the best bot ever a:yes; yes {prefix}time=10m': 'starts a poll with the question "is havoc the best bot ever" with the options "yes" and "yes" that will last for 10 minutes'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { question, options }, flag }: { msg: HavocMessage; target: { question: string; options: string }; flag: string }) {
		const invalidResponses = [];
		let time = 0;
		const formattedOptions = (options || 'Yes;No').split(';').map((opt, i) => `${Util.emojiNumber(i + 1)} ${opt}`);
		if (flag) time = Time.parse(flag.slice(5));
		if (time > 12096e+5) invalidResponses.push('the maximum time allowed is 2 weeks');
		if (formattedOptions.length > 10) invalidResponses.push('the maximum amount of options allowed are 10');
		if (invalidResponses.length) {
			return msg.respond(invalidResponses.join(' ,'));
		}
		const embed = msg.constructEmbed({
			setAuthor: [`Poll started by ${msg.author.tag}`, msg.author.pfp],
			setDescription: `${question}\n\n${formattedOptions.join('\n')}`,
			setFooter: time
				? (time > 60000 ? 'Ending at:' : `Ending in ${ms(time, { 'long': true })}`)
				: 'Started at:'
		});
		if (time > 60000) embed.setTimestamp(Date.now() + time);
		// eslint-disable-next-line promise/catch-or-return
		msg.sendEmbed(embed).then(async m => {
			if (m.deleted) return;
			await Promise.all(Array.from({ length: formattedOptions.length }, async (_, i) => m.react(Util.emojiNumber(i + 1))));
			if (!time) return;
			if (time < 10000) {
				setTimeout(async () => m.endPoll(options.length), time);
			} else {
				await this.scheduler.add('poll',
					new PollSchedule(this, Date.now() + (time as number), {
						channel: m.channel.id,
						message: m.id,
						options: formattedOptions.length
					}));
			}
		});
	}
}
