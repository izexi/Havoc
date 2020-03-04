import Regex from '../../util/Regex';
import { Message, MessageEmbed } from 'discord.js';
import HavocGuild from './HavocGuild';
import Havoc from '../../client/Havoc';
import Util from '../../util/Util';

interface EmbedMethods {
  addField: [string, string];
  attachFiles: string;
  setAuthor: [string, string];
  setColor: string;
  setDescription: string;
  setFooter: [string, string];
  setImage: string;
  setThumbnail: string;
  setTitle: string;
  setURL: string;
  [key: string]: string | [string, string];
}

export default class extends Message {
  client!: Havoc;

  guild!: HavocGuild | null;

  args = this.content.split(/ +/);

  public _patch(data: object) {
    // @ts-ignore
    super._patch(data);
  }

  get prefix() {
    if (!this.guild) return process.env.PREFIX;
    const [matchedPrefix] =
      this.content.match(
        Regex.prefix(this.client.user!.id, this.guild.prefix)
      ) ?? [];
    return matchedPrefix;
  }

  public constructEmbed(methods: EmbedMethods) {
    const embed = new MessageEmbed()
      .setColor(this.guild ? this.member!.displayColor || 'WHITE' : '')
      .setTimestamp();
    if (methods.setDescription) {
      const [image] =
        methods.setDescription.match(/\bhttps:\/\/i\.imgur\.com\/[^\s]+/) ?? [];
      if (image) {
        methods.setDescription = methods.setDescription.replace(image, '');
        methods.setImage = image;
      }
    }
    Object.entries(methods).forEach(([method, values]) =>
      // @ts-ignore
      Util.arrayify(values).map(value => embed[method](...value))
    );
    if (
      !methods.setFooter &&
      (!embed.footer || !embed.footer.text) &&
      (!embed.description || !embed.description.includes(this.author!.tag)) &&
      this.author.id !== this.client.user?.id
    ) {
      embed.setFooter(
        `Requested by ${this.author?.tag}`,
        this.author?.displayAvatarURL()
      );
    }
    return embed;
  }
}
