import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Structures } from 'discord.js';
import Havoc from './client/Havoc';

dotenv.config();

const extensionsDir = join(__dirname, 'structures', 'extensions');
fs.readdir(extensionsDir).then(structures => {
  structures.forEach(struct =>
    Structures.extend(
      struct.match(/Havoc([a-z]+).js/i)![1],
      () => require(join(extensionsDir, struct)).default
    )
  );

  const client = new Havoc();
  client.login(process.env.TOKEN);

  process.on('unhandledRejection', rej =>
    client.logger.warn(rej?.toString() ?? '', {
      origin: 'process.on:unhandledRejection'
    })
  );
});
