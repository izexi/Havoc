// @ts-nocheck
import Schedule from '../structures/bases/Schedule';
import GiveawayEntity from '../structures/entities/GiveawayEntity';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';
import Havoc from '../client/Havoc';
import Regex from '../util/Regex';
import Util from '../util/Util';
import { MessageEmbed } from 'discord.js';
import ms = require('ms');
import { SECONDS, MINUTES, HOURS, DAYS } from '../util/Constants';

export default class Mute extends Schedule<GiveawayEntity> {
  edits: Map<GiveawayEntity['id'], NodeJS.Timer> = new Map();

  active: Set<GiveawayEntity['message']> = new Set();

  constructor(client: Havoc) {
    super(client, GiveawayEntity, 'giveaways');
  }

  timeLeft(end: Date) {
    return end.getTime() - Date.now();
  }

  scheduleEdits(giveaway: GiveawayEntity) {
    this.edits.set(
      giveaway.id,
      this.client.setInterval(async () => {
        const timeLeft = giveaway.end.getTime() - Date.now();
        if (
          (timeLeft <= SECONDS(3) && timeLeft % SECONDS(1) <= SECONDS(1)) ||
          (timeLeft <= MINUTES(3) && timeLeft % MINUTES(1) <= SECONDS(1)) ||
          Math.abs(timeLeft - HOURS(1)) <= SECONDS(1) ||
          timeLeft >= DAYS(1)
        ) {
          const channel = this.client.channels.cache.get(
            giveaway.channel
          ) as HavocTextChannel;
          const message = await channel?.messages
            .fetch(giveaway.message)
            .catch(() => null);
          if (!message) return;
          if (message.embeds[0].footer?.text?.includes('ended')) return;

          if (
            timeLeft >= DAYS(1) &&
            message.embeds[0].description.match(
              /\nTime remaining: (.+)$/
            )![1] === `**${ms(timeLeft, { long: true })}**`
          )
            return;
          const embed = new MessageEmbed(message.embeds[0])
            .setColor(timeLeft <= SECONDS(3) ? 'RED' : 'ORANGE')
            .setDescription(
              message.embeds[0].description.replace(
                /\nTime remaining: (.+)$/,
                `\nTime remaining: **${ms(Math.max(timeLeft, SECONDS(1)), {
                  long: true
                })}**`
              )
            );
          return message.edit(message.content, embed);
        }
      }, SECONDS(1))
    );
  }

  async start(
    guildId: HavocGuild['id'],
    entityProps: Exclude<EntityProps<T>, 'guild'>
  ) {
    const giveaway = await super.start(guildId, entityProps);
    this.active.add(giveaway.message);
    this.scheduleEdits(giveaway);
  }

  async end(giveaway: GiveawayEntity) {
    const channel = this.client.channels.cache.get(
      giveaway.channel
    ) as HavocTextChannel;
    const message = await channel?.messages
      .fetch(giveaway.message)
      .catch(() => null);

    if (message) {
      if (message.embeds[0].footer!.text!.includes('ended')) return;

      const reaction = message.reactions.cache.get('🎉');
      if (!reaction) return;

      const winner = await reaction.users.fetch().then(users =>
        users
          .filter(user => user.id !== this.client.user!.id)
          .random(giveaway.winners)
          .filter(user => user)
      );
      if (!winner.length) {
        return message.edit(
          '🎉 **GIVEAWAY ENDED** 🎉',
          message.embeds[0]
            .setDescription(`**Winner:** Could not be determined`)
            .setFooter(
              `Giveaway ID: ${
                message.embeds[0].footer?.text?.match(Regex.id)![0]
              } | Giveaway ended at:`
            )
            .setColor('RED')
            .setTimestamp(new Date())
        );
      }

      await message.edit(
        '🎉 **GIVEAWAY ENDED** 🎉',
        message.embeds[0]
          .setDescription(
            `**${Util.plural('Winner', winner.length)}:** ${winner
              .map(u => u.tag)
              .join(', ')}`
          )
          .setFooter(
            `Giveaway ID: ${
              message.embeds[0].footer!.text!.match(Regex.id)![0]
            } | Giveaway ended at:`
          )
          .setColor('RED')
          .setTimestamp(new Date())
      );

      const embed = message.constructEmbed({
        setDescription: `🎉 Congratulations **${winner
          .map(user => user.tag)
          .join(', ')}**! You won the [giveaway](${message.url}) for ${
          message.embeds[0].title
        } 🎉`,
        setColor: 'GOLD'
      });
      await message.sendEmbed(embed, winner.map(u => u.toString()).join(', '));

      Promise.all(
        winner.map(user => {
          const dmEmbed = new MessageEmbed(message.embeds[0])
            .setColor('GOLD')
            .setDescription(
              `🎉 Congratulations **${user.tag}**! You won the [giveaway](${message.url}) for **${message.embeds[0].title}** 🎉`
            );
          delete dmEmbed.footer;
          delete dmEmbed.title;
          return user.send(dmEmbed).catch(() => null);
        })
      ).catch(() => null);
    }

    const giveaways = await giveaway.guild.giveaways.init();
    const editInterval = this.edits.get(giveaway.id);
    if (editInterval) {
      this.client.clearInterval(editInterval);
      this.tasks.delete(giveaway.id);
    }

    await this.dequeue(giveaway, giveaways);
  }

  async load() {
    const giveaways = await this.client.db.guildRepo
      .findAll({ populate: ['giveaways'] })
      .then(guilds => guilds.flatMap(({ giveaways }) => giveaways.getItems()));
    await Promise.all(
      giveaways.map(giveaway => {
        this.schedule(giveaway);
        this.scheduleEdits(giveaway);
      })
    );
  }
}
