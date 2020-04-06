import { Client } from 'discord.js';
import Database from '../structures/Database';
import Logger from '../util/Logger';
import CommandHandler from '../handlers/CommandHandler';
import MuteSchedule from '../schedules/Mute';
import { once } from 'events';
import Util from '../util/Util';

export default class Havoc extends Client {
  db = new Database();

  commandHandler = new CommandHandler();

  schedules = new Map([['mute', new MuteSchedule(this)]]);

  constructor(options = {}) {
    super(options);
    this.init();
  }

  async init() {
    await this.db.init().catch(error => Logger.error('Database#init()', error));
    await once(this, 'ready');
    Promise.all(
      [...this.schedules.values()].map(schedule => schedule.init())
    ).then(
      () =>
        Logger.status(
          `Initialised ${this.schedules.size} ${Util.plural(
            'schedule',
            this.schedules.size
          )}`
        ),
      error => Logger.error('Schedule#init()', error)
    );
  }
}
