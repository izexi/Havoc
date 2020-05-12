import Havoc from '../client/Havoc';

export default function (
  this: Havoc,
  { op: opCode, t: eventName }: { op: number; t: string }
) {
  this.prometheus.eventCounter.inc({ event_name: eventName ?? opCode });
}
