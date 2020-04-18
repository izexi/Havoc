import { Guild, WebhookClient } from 'discord.js';

export default class extends Guild {
  prefix = process.env.PREFIX!;

  tags = new Map();

  bcPrefixes = ['!', '.', '?'];

  logs?: {
    id: string;
    token: string;
  };

  welcomer?: string;

  get logHook() {
    return this.logs ? new WebhookClient(this.logs.id, this.logs.token) : null;
  }
}
