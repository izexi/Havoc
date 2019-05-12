import { Message } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prefix } = require('../../config.json');

export default class HavocMessage extends Message {
	public prefix = prefix;
}
