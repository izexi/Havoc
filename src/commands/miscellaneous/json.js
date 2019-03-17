const Command = require("../../structures/Command");
const fetch = require("node-fetch");
const { isURL } = require("validator");
const { haste } = require("../../util/Util");

class Json extends Command {
	constructor() {
		super(__filename, {
			description: "View a pretty printed JSON that is parsed from the entered URL.",
			prompt: {
				initialMsg: ["enter the URL."],
			},
			opts: 0b1011,
		});
	}

	async run() {
		const possibleURL = this.text || this.promptResponse[0];
		if (!isURL(possibleURL)) {
			return this.response = await this.sendEmbed({
				setDescription: `**${this.author.tag}** \`${possibleURL}\` isn't a valid URL.`,
			});
		}
		const msg = this;
		const description = fetch(possibleURL)
			.then(async (res) => {
				if (!res.headers.get("content-type").includes("application/json")) {
					return `**${msg.author.tag}** I couldn't find any JSON to parse on \`${msg.text}\`.`;
				}
				const json = JSON.stringify((await res.json()), null, 4);
				return json.length > 2036 ? (await haste(json, "json")) :
					"```json\n" + json + "\n```";
			})
			.catch((err) => `**${msg.author.tag}** I ran into an error while trying to access \`${msg.text}\` \n\`${err}\``);
		this.response = await this.sendEmbed({
			setDescription: (await description),
		});
	}
}

module.exports = Json;