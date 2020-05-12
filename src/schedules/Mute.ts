import Schedule from '../structures/bases/Schedule';
import Havoc from '../client/Havoc';
import MuteEntity from '../structures/entities/MuteEntity';
import { getMuteRole } from '../commands/moderation/Mute';
import ms = require('ms');
import { NOOP } from '../util/CONSTANTS';

export default class Mute extends Schedule<MuteEntity> {
  constructor(client: Havoc) {
    super(client, MuteEntity, 'mutes');
  }

  schedule(mute: MuteEntity) {
    if (mute.end) super.schedule(mute);
    return mute;
  }

  async end(mute: MuteEntity) {
    const guild = this.client.guilds.cache.get(mute.guild.id);
    const member = await guild?.members.fetch(mute.member).catch(NOOP);
    const muteRole = await getMuteRole(guild);

    if (member && muteRole)
      member.roles.remove(
        muteRole,
        `Duration for ${ms(
          new Date(mute.end!).getTime() - new Date(mute.start).getTime()
        )} mute by ${(await this.client.users.fetch(mute.muter)).tag} has ended`
      );

    const mutes = await mute.guild.mutes.init();
    await this.dequeue(mute, mutes);
  }

  async load() {
    const mutes = await this.client.db.guildRepo
      .findAll({ populate: ['mutes'] })
      .then((guilds) => guilds.flatMap(({ mutes }) => mutes.getItems()));
    await Promise.all(mutes.map(this.schedule.bind(this)));
  }
}
