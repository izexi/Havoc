import chalk from 'chalk';

export default {
	log(text: any, type = '') {
		console.log(`[${chalk(new Date().toLocaleTimeString())}]${type ? ` ${type}` : ''} ${text}`);
	},
	status(text: string) {
		this.log(text, `[${chalk.green('STATUS')}]`);
	},

	file(text: string) {
		this.log(text, `[${chalk.yellow('FILE')}]`);
	},

	command(text: string) {
		this.log(text, `[${chalk.cyan('COMMAND')}]`);
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
