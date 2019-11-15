import HavocClient from '../client/Havoc';
import { addBreadcrumb, setContext, captureException } from '@sentry/node';
import Logger from '../util/Logger';

export default function(this: HavocClient, info: string) {
  Logger.log(info);
  addBreadcrumb({
    message: 'debug',
    data: { info }
  });
  setContext('debug', { info });
  captureException(info);
}
