/* eslint-disable no-console */
import * as chalk from 'chalk';
import { Guild } from 'discord.js';

export default {
  log(text: { toString(): string }, type = '') {
    console.log(
      `[${chalk(new Date().toLocaleTimeString())}]${
        type ? ` ${type}` : ''
      } ${text}`
    );
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

  joined(guild: Guild) {
    this.log(
      `Joined ${guild.name} (${guild.id}) with ${guild.memberCount} members`,
      `[${chalk.bgGreen('JOINED')}]`
    );
  },

  left(guild: Guild) {
    this.log(`Left ${guild.name} (${guild.id})`, `[${chalk.bgRed('LEFT')}]`);
  },

  ping(text: string) {
    this.log(text, `[${chalk.magenta('PING')}]`);
  },

  error(text: string, err: Error) {
    this.log(text, `[${chalk.red('ERROR')}]`);
    console.error(err);
  },

  unhandledRejection(rej: Error) {
    this.log(`[${chalk.red('UNHANDLEDREJECTION')}]`);
    console.warn(rej);
  }
};
