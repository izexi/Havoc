import { Counter, Gauge, register } from 'prom-client';
import { createServer } from 'http';
import { parse } from 'url';
import Havoc from '../client/Havoc';
import { SECONDS, MEGABYTES, PROM_PORT, HTTP_OK } from '../util/CONSTANTS';

export default class {
  client: Havoc;

  started = false;

  constructor(client: Havoc) {
    this.client = client;
    this.start();
  }

  prometheus = {
    messagesCounter: new Counter({
      name: 'havoc_message_counter',
      help: 'Counter of recieved messages'
    }),
    memoryGauge: new Gauge({
      name: 'havoc_memory_gauge',
      help: 'Gauge for memory being used'
    }),
    register
  };

  start() {
    createServer((req, res) => {
      if (req.url && parse(req.url).pathname === '/metrics') {
        res.writeHead(HTTP_OK, {
          'Content-Type': this.prometheus.register.contentType
        });
        res.write(this.prometheus.register.metrics());
      }
      res.end();
    })
      .listen(PROM_PORT)
      .once('listening', () => {
        this.client.logger.info('Listening', { origin: 'createServer()' });

        setInterval(
          () =>
            this.prometheus.memoryGauge.set(
              MEGABYTES(process.memoryUsage().heapUsed)
            ),
          SECONDS(1)
        ).unref();
      });
  }
}
