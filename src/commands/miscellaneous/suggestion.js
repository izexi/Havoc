const Command = require("../../structures/Command");
const Prompt = require("../../structures/Prompt");
const Util = require("../../util/Util");
const { SnowflakeUtil: { generate } } = require("discord.js");

const getSuggestionChannel = async (msg) => {
	const { suggestion } = await msg.guild.config;
	if (!suggestion) {
		msg.response = await msg.sendEmbed({
			setDescription: `**${msg.author.tag}** a suggestion channel hasn't been configured.
			${msg.member.permissions.has("MANAGE_GUILD") ? "U" : "You will need to ask someone with the `Manage Guild` permission to u"}se \`${msg.prefix}suggestion config\` to set one up.`,
		});
		return null;
	}
	const { channel } = suggestion;
	const suggestionChannel = msg.guild.channels.get(channel);
	if (!suggestionChannel) {
		msg.response = await msg.sendEmbed({
			setDescription: `**${msg.author.tag}** the suggestion channel that was in the configuration doesn't exist.
			${msg.member.permissions.has("MANAGE_GUILD") ? "U" : "You will need to ask someone with the `Manage Guild` permission to u"}se \`${msg.prefix}suggestion config\` to set one up.`,
		});
		return null;
	}
	return suggestionChannel;
};

const review = async (_msg, approve) => {
	const suggestionChannel = await getSuggestionChannel(_msg);
	if (!suggestionChannel) return;
	let [messageID, ...reason] = _msg.args.slice(2);
	if (!messageID) {
		await new Promise((res) => {
			new Prompt({
				msg: _msg,
				initialMsg: ["enter the ID of the suggestion which you can find on the footer of the suggestion's embed, followed by the reason of approval (optional)"],
			}).on("promptResponse", ([response]) => {
				[messageID, ...reason] = response.split(/ +/).filter((s) => s);
				res();
			});
		});
	}
	const invalidID = () => _msg.sendEmbed({
		setDescription: `**${_msg.author.tag}** you have entered an invalid Suggestion ID.`,
		setImage: "https://i.imgur.com/IK7JkVw.png",
	});
	reason = reason.join(" ");
	suggestionChannel.messages.fetch(messageID).then(async (msg) => {
		const [embed] = msg.embeds;
		if (!embed || !embed.footer || !embed.footer.text.startsWith("Suggestion") || msg.author.id !== _msg.client.user.id) return _msg.response = await invalidID();
		if (embed.fields[1].value !== "Open") {
			return _msg.response = await _msg.sendEmbed({
				setDescription: `**${_msg.author.tag}** _msg suggestion has already been ${embed.fields[1].value.split(" -")[0].replace(/./, (firstLetter) => firstLetter.toLowerCase())}.`,
			});
		}
		embed.fields[1].value = `${approve ? "Approved" : "Denied"} by ${_msg.author.tag}${reason ? ` - ${reason}` : ""}`;
		embed.setColor(approve ? "GREEN" : "RED");
		msg.edit(embed).then(() => {
			const [userID] = embed.author.name.match(Util.idRegex);
			embed.setAuthor(`💡Your suggestion in ${msg.guild.name} has been ${reason ? "accepted" : "denied"}💡`);
			embed.setDescription(`\n\nClick [here](${msg.url}) to view it.`);
			_msg.client.users.fetch(userID).then((user) => user.send(embed));
		});
	}).catch(async () => _msg.response = await invalidID());
};

class Suggestion extends Command {
	constructor() {
		super(__filename, {
			description: "Creates a suggestion that will either be approved or denied.",
			aliases: new Set(["s", "suggest"]),
			subCommands: new Set(["config", "approve", "deny"]),
			prompt: {
				initialMsg: ["enter the suggestion that you would like to create."],
			},
			opts: 0b1000,
		});
	}

	async run() {
		const suggestionChannel = await getSuggestionChannel(this);
		if (!suggestionChannel) return;
		await this.delete();
		const suggestion = this.text.length > 1853 ? await Util.haste(this.text, "txt") : this.text;
		const suggestionMessage = await suggestionChannel.send(this.constructEmbed({
			addField: [
				["Suggestion:", suggestion],
				["Status:", "Open"],
			],
			setAuthor: [`💡Suggestion from ${this.author.tag} (${this.author.id})💡`, this.author.pfp],
			setColor: "YELLOW",
			setFooter: `Suggestion ID: ${generate(new Date())}`,
		}));
		await suggestionMessage.edit(suggestionMessage.embeds[0].setFooter(`Suggestion ID: ${suggestionMessage.id}`));
		await suggestionMessage.react("416985886509498369");
		await suggestionMessage.react("416985887616925726");
		const embed = this.constructEmbed({
			setAuthor: `💡Your suggestion in ${this.guild.name} has been submitted💡`,
			addField: [
				["Suggestion:", suggestion],
				["Status:", "Open"],
			],
			setDescription: `\n\nClick [here](${suggestionMessage.url}) to view it.\nYou will be notified about the status of approval/denial.`,
			setFooter: `Suggestion ID: ${suggestionMessage.id}`,
			setColor: "YELLOW",
		});
		this.author.send(embed).catch(() => {
			this.sendEmbed({
				// eslint-disable-next-line max-len
				setDescription: `**${this.author.tag}** your suggestion has been submitted, click [here](${suggestionMessage.url}) to view it.\nI was unable to DM you so you will need to enable them if you will be notified about the status of approval/denial.`,
			});
		});
	}

	async approve() {
		this.delete.then(() => review(this, true));
	}

	async deny() {
		this.delete.then(() => review(this, false));
	}

	async config() {
		new Prompt({
			msg: this,
			initialMsg: ["what would you like to configure from suggestions?\nEnter `channel` / `role`."],
			invalidResponseMsg: "You will need to enter either `channel` or `role`.",
			validateFn: (msg) => ["channel", "role"].includes(msg.content.toLowerCase()),
		}).on("promptResponse", async ([option]) => {
			const { suggestion } = await this.guild.config;
			if (option.toLowerCase() === "channel") {
				new Prompt({
					msg: this,
					initialMsg: ["mention the channel, or enter the ID of the channel that would like the suggestions to be created on."],
					invalidResponseMsg: `You will need to mention the channel (e.g: ${this.channel}) or enter the channel's ID (e.g: ${this.channel.id}).`,
					validateFn: (msg) => msg.mentions.channels.size || msg.guild.channels.has(msg.content),
				}).on("promptResponse", async ([channel]) => {
					await this.guild.updateConfig({ suggestion: { ...suggestion, channel: channel.match(/\d+/)[0] } });
					this.sendEmbed({
						setDescription: `**${this.author.tag}** I have updated the suggestions channel to ${channel.startsWith("<") ? channel : `<#${channel}>`} for this server.`,
					});
				});
			}
			else {
				const randomRole = this.guild.roles.random();
				new Prompt({
					msg: this,
					initialMsg: ["mention the role, or enter the name of the role that you would like to give access for deny/approving suggestions."],
					invalidResponseMsg: `You will need to mention the channel (e.g: ${randomRole}) or enter the role's name (e.g: ${randomRole.name}).`,
					validateFn: (msg) => msg.mentions.roles.size || msg.guild.roles.some((role) => role.name.toLowerCase() === msg.content),
				}).on("promptResponse", async ([role]) => {
					const roleID = (role.match(Util.idRegex) || [this.guild.roles.find((_role) => _role.name.toLowerCase() === role).id])[0];
					await this.guild.updateConfig({ suggestion: { ...suggestion, role: roleID } });
					this.sendEmbed({
						setDescription: `**${this.author.tag}** I have updated the suggestions denial/approval role to <@&${roleID}> for this server.
						Members with the \`Manage Server\` or \`Administrator\` permission will also have access.`,
					});
				});
			}
		});
	}
}

module.exports = Suggestion;