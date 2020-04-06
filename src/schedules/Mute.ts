import Schedule from '../structures/bases/Schedule';
import Havoc from '../client/Havoc';
import GuildEntity from '../structures/entities/GuildEntity';
import MuteEntity from '../structures/entities/MuteEntity';
import { getMuteRole } from '../commands/moderation/Mute';
import HavocGuild from '../structures/extensions/HavocGuild';
import ms = require('ms');
import { EntityProps } from '../structures/Database';

export default class Mute extends Schedule<MuteEntity> {
  constructor(client: Havoc) {
    super(client);
  }

  async add(
    { id }: HavocGuild,
    mute: Exclude<EntityProps<MuteEntity>, 'guild'>
  ) {
    const guild = await this.client.db.findOrInsert(GuildEntity, id);
    await guild.mutes.init();
    const muteEntity = new MuteEntity({ ...mute, guild });

    guild.mutes.add(muteEntity);
    await this.client.db.flush();
    this.enqueue(muteEntity);
  }

  async end(mute: MuteEntity) {
    const guild = this.client.guilds.cache.get(mute.guild.id);
    const member = await guild?.members.fetch(mute.member).catch(() => null);
    const muteRole = await getMuteRole(guild);

    if (member && muteRole)
      member.roles.remove(
        muteRole,
        `Duration for ${ms(
          new Date(mute.end!).getTime() - new Date(mute.start).getTime()
        )} mute by ${(await this.client.users.fetch(mute.muter)).tag} has ended`
      );

    await this.delete(mute);
  }

  async delete(mute: MuteEntity) {
    const mutes = await mute.guild.mutes.init();
    mutes.remove(mute);
    await this.client.db.flush();
  }

  enqueue(mute: MuteEntity) {
    if (mute.end)
      this.client.setTimeout(
        () => this.end(mute),
        new Date(mute.end).getTime() - Date.now()
      );
  }

  async load() {
    const mutes = await this.client.db.guildRepo
      .find({ mutes: { end: { $ne: null } } }, { populate: ['mutes'] })
      .then(guilds => guilds.flatMap(({ mutes }) => mutes.getItems()));
    await Promise.all(mutes.map(this.enqueue.bind(this)));
  }
}
