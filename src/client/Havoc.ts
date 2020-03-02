import { Client } from 'discord.js';
import Database from '../structures/Database';
import GuildConfig from '../structures/entities/GuildConfig';
import Logger from '../util/Logger';

export default class Havoc extends Client {
  db = new Database();

  constructor(options = {}) {
    super(options);
    this.init().catch(error => Logger.error('Havoc#init()', error));
  }

  async init() {
    this.db.init().catch(error => Logger.error('Database#init()', error));
  }
}
