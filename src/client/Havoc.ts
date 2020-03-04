import { Client } from 'discord.js';
import Database from '../structures/Database';
import Logger from '../util/Logger';
import CommandHandler from '../handlers/CommandHandler';

export default class Havoc extends Client {
  db = new Database();

  commandHandler = new CommandHandler();

  constructor(options = {}) {
    super(options);
    this.init().catch(error => Logger.error('Havoc#init()', error));
  }

  async init() {
    this.db.init().catch(error => Logger.error('Database#init()', error));
  }
}
