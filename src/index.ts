import { Structures } from 'discord.js';
import HavoClient from './client/Havoc';
import Logger from './util/Logger';
import { init } from '@sentry/node';
const { dsn } = require('.././config.json');

/* import { promisify } from 'util';
const readdir = promisify(require('fs').readdir);
// eslint-disable-next-line promise/catch-or-return
readdir('src/extensions').then((extensions: string[]) => {
	extensions.forEach((extension: string) => {
		console.log(extension);
		extension = extension.slice(0, -3);
		Structures.extend(extension, (): Function => require(`./extensions/${extension}`).default);
	});
}); */

process.on('unhandledRejection', rej => Logger.unhandledRejection(rej));

['Guild', 'Message', 'User', 'TextChannel'].forEach(extension =>
	Structures.extend(extension, (): Function => require(`./extensions/${extension}`).default));

init({ dsn });

new HavoClient({
	disabledEvents: [
		'CHANNEL_PINS_UPDATE',
		'GUILD_INTEGRATIONS_UPDATE',
		'PRESENCE_UPDATE',
		'TYPING_START',
		'WEBHOOKS_UPDATE'
	]
});
