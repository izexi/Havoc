const { emojiNumbers } = require("../../util/Util");
const Time = require("../../structures/Time");
const Command = require("../../structures/Command");

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
			.map((opt, i) => `${emojiNumbers(i + 1)} ${opt}`);
		this.sendEmbed({
			setDescription: `${question}\n\n${options.join("\n")}`,
			setFooter: `Poll started by ${this.author.tag}${time ? " - Ending at:" : ""}`,
			setTimestamp: Date.now() + time,
		}).then(async (msg) => {
			for (const [i] of options.entries()) {
				await msg.react(emojiNumbers(i + 1));
			}
		});
		// TODO: timed polls
	}
}

module.exports = Poll;