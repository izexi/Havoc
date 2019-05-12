import { Structures } from 'discord.js';
import { promisify } from 'util';
import HavoClient from './Havoc';
const readdir = promisify(require('fs').readdir);

// eslint-disable-next-line promise/catch-or-return
readdir('src/extensions').then((extensions: string[]) => {
	extensions.forEach((extension: string) => {
		extension = extension.slice(0, -3);
		Structures.extend(extension, (): Function => require(`./extensions/${extension}`).default);
	});
});

new HavoClient();
