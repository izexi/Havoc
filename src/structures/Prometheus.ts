import { Counter, Gauge, register } from 'prom-client';
import { createServer } from 'http';
import { parse } from 'url';
import Havoc from '../client/Havoc';
import { cpu, drive } from 'node-os-utils';
import {
  SECONDS,
  MEGABYTES,
  PROMETHEUS_PORT,
  HTTP_OK
} from '../util/CONSTANTS';

export default class {
  client: Havoc;

  cpuUsage = { user: 0, system: 0 };

  commandCounter = this.createCounter(
    'havoc_command_counter',
    'Counter of processed commands',
    ['command_name']
  );

  eventCounter = this.createCounter(
    'havoc_event_counter',
    'Counter of recieved events',
    ['event_name']
  );

  guildGauge = this.createGauge(
    'havoc_guild_gauge',
    'Gauge for total guild count'
  );

  cpuGauge = this.createGauge('havoc_cpu_gauge', 'Gauge for CPU percentage');

  memoryGauge = this.createGauge(
    'havoc_memory_gauge',
    'Gauge for memory being used'
  );

  driveGauge = this.createGauge(
    'havoc_drive_gauge',
    'Gauge for drive being used'
  );

  register = register;

  constructor(client: Havoc) {
    this.client = client;
    this.start();
  }

  createCounter(name: string, help: string, labelNames?: string[]) {
    return new Counter({ name, help, labelNames });
  }

  createGauge(name: string, help: string) {
    return new Gauge({ name, help });
  }

  start() {
    createServer((req, res) => {
      if (req.url && parse(req.url).pathname === '/metrics') {
        res.writeHead(HTTP_OK, {
          'Content-Type': this.register.contentType
        });
        res.write(this.register.metrics());
      }
      res.end();
    })
      .listen(PROMETHEUS_PORT)
      .once('listening', () => {
        this.client.logger.info(`Listening to ${PROMETHEUS_PORT}`, {
          origin: 'Prometheus#start()'
        });

        setInterval(
          () => this.memoryGauge.set(MEGABYTES(process.memoryUsage().heapUsed)),
          SECONDS(1)
        ).unref();

        setInterval(() => {
          cpu
            .usage()
            .then(percentage => this.cpuGauge.set(Math.round(percentage)));
          drive
            .info('/')
            .then(({ usedGb }) => this.driveGauge.set(Math.round(usedGb)));
        }, SECONDS(5)).unref();
      });
  }
}
