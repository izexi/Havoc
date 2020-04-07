import { Client } from 'discord.js';
import Database from '../structures/Database';
import Logger from '../util/Logger';
import CommandHandler from '../handlers/CommandHandler';
import MuteSchedule from '../schedules/Mute';
import GiveawaySchedule from '../schedules/Giveaway';
import { once } from 'events';
import Util from '../util/Util';

export default class Havoc extends Client {
  db = new Database();

  commandHandler = new CommandHandler();

  schedules = {
    mute: new MuteSchedule(this),
    giveaway: new GiveawaySchedule(this)
  };

  constructor(options = {}) {
    super(options);
    this.init();
  }

  async init() {
    await this.db.init().catch(error => Logger.error('Database#init()', error));
    await once(this, 'ready');

    const schedules = Object.values(this.schedules);
    Promise.all(schedules.map(schedule => schedule.init())).then(
      () =>
        Logger.status(
          `Initialised ${schedules.length} ${Util.plural(
            'schedule',
            schedules.length
          )}`
        ),
      error => Logger.error('Schedule#init()', error)
    );
  }
}
