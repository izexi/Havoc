const { MessageEmbed, Structures } = require("discord.js");
const { prefix } = require("../../config.json");
const Util = require("../util/Util");

module.exports = Structures.extend("Message", (Message) => {
	class HavocMessage extends Message {
		constructor(...args) {
			super(...args);
		}

		_init() {
			this.prefix = this.guild ? this._parsedPrefix : prefix;
			this.mentionPrefix = Util.mentionPrefixRegex(this.client.user.id).test(this.prefix);
			this.args = this.content.substring(this.prefix).split(/ +/).filter((s) => s);
			this.text = this.args.slice(1).join(" ");
		}

		_patch(data) {
			super._patch(data);
			this._init();
		}

		get _parsedPrefix() {
			const matchedPrefix = this.content.match(Util.prefixRegex(this.client.user.id, this.guild.prefix));
			if (!matchedPrefix) return "";
			return matchedPrefix[0];
		}

		get firstMention() {
			if (!this.mentions.users.size) return null;
			if (this.mentionPrefix && this.mentions.users.size === 1) return null;
			const userMentionRegex = Util.userMentionRegex;
			const mentionedIDs = (this.content.match(userMentionRegex) || []).map((mention) => mention.replace(userMentionRegex, "$1"));
			return this.client.users.fetch(mentionedIDs[this.mentionPrefix | 0])
				.then((user) => user)
				.catch(() => null);
		}

		get argOffset() {
			return this.mentionPrefix | 0;
		}

		patch(data) {
			super.patch(data);
			this._init();
		}

		delete() {
			return this.deleted ? null : super.delete();
		}

		edit(...args) {
			return this.deleted ? null : super.edit(...args);
		}

		cachedMember(user) {
			return this.guild.members.fetch(user)
				.then((member) => member)
				.catch(() => {
					return {};
				});
		}

		isMentioned(data) {
			data = data.id || data;
			return this.mentions.users.has(data) || this.mentions.channels.has(data) || this.mentions.roles.has(data);
		}

		assignCommand(command) {
			this.command = command;
		}

		constructEmbed(methods) {
			const embed = new MessageEmbed()
				.setColor(this.guild ? this.member.displayColor || "WHITE" : "")
				.setTimestamp();
			Object.keys(methods).forEach((method) => {
				const val = methods[method];
				if (Array.isArray(val)) embed[method](...val);
				else if (typeof val === "object") Object.values(val).map((v) => embed[method](...v));
				else embed[method](val);
			});
			if (!methods.setFooter) {
				embed.setFooter(`Requested by ${this.author.tag}`, this.author.displayAvatarURL());
			}
			return embed;
		}

		async sendEmbed(methods, content) {
			if (this.guild && !this.channel.permissionsFor(await this.guild.me).has("EMBED_LINKS")) {
				return this.response = await this.channel.send(`**${this.author}** I require the \`Embed Links\` permission to execute this command.`);
			}
			const embed = await this.channel.send(content, this.constructEmbed(methods));
			if (this.command.opts & 1) {
				await embed.react("🗑");
				embed.awaitReactions(
					(reaction, user) => reaction.emoji.name === "🗑" && user.id === this.author.id,
					{
						time: 1800,
						max: 1,
						errors: ["time"],
					}
				).then(async () => {
					await embed.delete();
					if (this.guild) this.delete();
				}).catch(() => {
					if (!embed.deleted) embed.reactions.get("🗑").users.remove(embed.author);
				});
			}
			return embed;
		}

		async endPoll(options) {
			const emojiObj = Util.emojiNumbers;
			const reactionCount = new Map();
			const totalReactions = await this.reactions.reduce(async (total, reaction) => {
				if (total instanceof Promise) total = await total;
				if (Object.keys(emojiObj).find((emoji) => emojiObj[emoji] === reaction.emoji.name) <= options) {
					const count = reaction.count - (await reaction.users.fetch()).has(this.client.user.id) | 0;
					reactionCount.set(reaction.emoji.name, count);
					total += count;
				}
				return total;
			}, 0);
			await this.reactions.removeAll();
			const oldDesc = this.embeds[0].description.split("\n");
			const newDesc = oldDesc.slice(2).reduce((desc, opt) => {
				console.log(Object.values(emojiObj).find((emoji) => opt.includes(emoji)), reactionCount);
				const reacationCount = reactionCount.get(Object.values(emojiObj).find((emoji) => opt.includes(emoji)));
				desc.push(
					opt + " - **" + ((reacationCount / totalReactions) * 100 || 0).toFixed(2).replace(/\.00/, "") +
							"% (" + reacationCount + ")**"
				);
				return desc;
			}, oldDesc.slice(0, 2));
			await this.edit(
				this.embeds[0]
					.setFooter("Poll ended")
					.setDescription(newDesc.join("\n"))
			);
		}
	}

	return HavocMessage;
});