import * as dotenv from 'dotenv';
import HavoClient from './client/Havoc';
import Logger from './util/Logger';

dotenv.config();

const Havoc = new HavoClient();

Havoc.login(process.env.TOKEN);
Havoc.on('ready', () => Logger.log('ready'));
