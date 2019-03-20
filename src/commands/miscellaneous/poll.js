const Util = require("../../util/Util");
const Time = require("../../structures/Time");
const Command = require("../../structures/Command");
const ms = require("ms");

class Poll extends Command {
	constructor() {
		super(__filename, {
			description: "Create a poll with options.",
			args: {
				usage: "[time = <_d | _y | _m | _s>] q:<question> a:<option1; option2;...>",
			},
			prompt: {
				initialMsg: [
					"enter the question that you would like to poll along with the time limit (optional - suffix the time with `m`/`h`/`d`, e.g: `3m` would be 3 minutes.)",
					"enter the options seperated by `;`, e.g: `yes;no` would be options yes and no",
				],
			},
			opts: 0b01000,
		});
	}

	async run() {
		let question, options;
		if (this.promptResponse) {
			[question, options] = this.promptResponse;
		}
		else {
			question = (this.text.match(/q:(.*)a:/i) || []);[1];
			options = (this.text.match(/^.*a:(.*)$/i) || [])[1];
		}
		if (!question || !options) {
			return this.response = await this.sendEmbed({
				setDescription: `**${this.author.tag}** you have used this command incorrectly, enter \`${this.prefix}help poll\` for more info`,
			});
		}
		const time = Time.parse(this.text);
		options = options.split(";")
			.filter((opt) => opt)
			.map((opt, i) => `${Util.emojiNumber(i + 1)} ${opt}`);
		const embed = {
			setAuthor: [`Poll started by ${this.author.tag}`, this.author.displayAvatarURL()],
			setDescription: `${question}\n\n${options.join("\n")}`,
			setFooter: time > 60000 ? "Ending at:" : `Ending in ${ms(time, { long: true })}`,
		};
		if (time > 60000) embed.setTimestamp = Date.now() + time;
		this.sendEmbed(embed).then(async (msg) => {
			if (msg.deleted) return;
			for (const [i] of options.entries()) {
				await msg.react(Util.emojiNumber(i + 1));
			}
			if (!time) return;
			if (time < 100000) {
				setTimeout(() => msg.endPoll(), time);
			}
			else {
				this.client.db.category = "poll";
				await this.client.db.set(Date.now() + time, {
					channel: msg.channel.id,
					message: msg.id,
					options: options.length,
				});
			}
		});
	}
}

module.exports = Poll;