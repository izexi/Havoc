import chalk from 'chalk';
import HavocGuild from '../extensions/Guild';

export default {
	log(text: any, type = '') {
		console.log(`[${chalk(new Date().toLocaleTimeString())}]${type ? ` ${type}` : ''} ${text}`);
	},
	status(text: string) {
		this.log(text, `[${chalk.green('STATUS')}]`);
	},

	info(text: string) {
		this.log(text, `[${chalk.yellow('INFO')}]`);
	},

	command(text: string) {
		this.log(text, `[${chalk.cyan('COMMAND')}]`);
	},

	joined(guild: HavocGuild) {
		this.log(`Joined ${guild.name} (${guild.id}) with ${guild.memberCount} members`, `[${chalk.bgGreen('JOINED')}]`);
	},

	left(guild: HavocGuild) {
		this.log(`Left ${guild.name} (${guild.id})`, `[${chalk.bgRed('LEFT')}]`);
	},

	ping(text: string) {
		this.log(text, `[${chalk.magenta('PING')}]`);
	},

	error(text: string, err: any) {
		this.log(text, `[${chalk.red('ERROR')}]`);
		console.error(err);
	},

	unhandledRejection(rej: any) {
		this.log(`[${chalk.red('UNHANDLEDREJECTION')}]`);
		console.warn(rej);
	}
};
