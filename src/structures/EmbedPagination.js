const Prompt = require("./Prompt");

class EmbedPagination {
	/**
	 * @param {Object} options
	 * @param {import("discord.js").Message} options.msg
	 * @param {string} options.title
	 * @param {string[]} options.descriptionsArr
	 * @param {number} options.maxPerPage
	 * @param {number} [options.page = 1]
	 * @param {{url: string, text: string}} [options.hastebin]
	 */
	constructor(options) {
		this.msg = options.msg;
		this.title = options.title;
		this.descriptionsArr = options.descriptionsArr;
		this.maxPerPage = options.maxPerPage;
		this.page = this.validatePageInt(options.page) && options.page || 1;
		this.hastebin = options.hastebin;
		this.setup();
	}

	get totalPages() {
		return Math.ceil(this.descriptionsArr.length / this.maxPerPage);
	}

	validatePageInt(str) {
		return Number.isInteger(+str) && str > 0 && str <= this.totalPages;
	}

	pageEmbed(page, paginate = true) {
		return this.msg.constructEmbed({
			setTitle: `${this.title}${paginate ? ` - Page ${page} of ${this.totalPages}` : ""}`,
			setDescription : this.descriptionsArr.slice((page * this.maxPerPage) - this.maxPerPage, page * this.maxPerPage).join("\n"),
		});
	}

	async setup() {
		let emojis = ["⏮", "◀", "⬇", "▶", "⏭", "✅"];
		if (this.hastebin) emojis = [...emojis.slice(0, -1), "📜", emojis[5]];
		if (this.totalPages === 1) return await this.msg.channel.send(this.pageEmbed(this.page, false));
		this.embedMsg = await this.msg.channel.send(this.pageEmbed(this.page));
		for (const emoji of emojis) await this.embedMsg.react(emoji);
		const collector = this.embedMsg.createReactionCollector(
			(reaction, user) => emojis.includes(reaction.emoji.name) && user.id === this.msg.author.id,
			{ time: 150000 }
		);
		collector.on("collect", async (reaction) => {
			reaction.users.remove(this.msg.author);
			switch(reaction.emoji.name) {
				case "⏮":
					if (this.page !== 1) {
						this.embedMsg.edit(this.pageEmbed(this.page = 1));
					}
					break;
				case "◀":
					if (this.page > 1) {
						this.embedMsg.edit(this.pageEmbed(--this.page));
					}
					break;
				case "⬇":
					new Prompt({
						msg: this.msg,
						initialMsg: "enter the page you like to jump to.",
						invalidResponseMsg: `You need to enter a number between 1 to ${this.totalPages}, e.g: entering \`2\` will jump to page 2.`,
						validateFn: (str) => Number.isInteger(+str) && str > 0 && str <= this.totalPages,
					}).on("promptResponse", (page) => this.embedMsg.edit(this.pageEmbed(+page)));
					break;
				case "▶":
					if (this.page < this.totalPages) {
						this.embedMsg.edit(this.pageEmbed(++this.page));
					}
					break;
				case "⏭":
					if (this.page !== this.totalPages) {
						this.embedMsg.edit(this.pageEmbed(this.page = this.totalPages));
					}
					break;
				case "📜":
					if (!this.hastebin) return;
					this.msg.sendEmbed({
						setDescription: `**${this.msg.author.tag}** click [here](${this.hastebin.url}) for ${this.hastebin.text}`,
					});
					break;
				case "✅":
					collector.stop();
					break;
			}
		});
		collector.on("end", () => this.embedMsg.reactions.removeAll());
	}

}

module.exports = EmbedPagination;