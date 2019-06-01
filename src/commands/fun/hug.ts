import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';

export default class Hug extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: '🙅'
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const hugs = ['<:pepehuggggg:462329011041730560>', '<:GWcmeisterPeepoHug:462329160283586561>', '<:FeelsHugPleaseMan:462329262603632641>', '<:FeelsHappyHugMan:462329120844414976>'];
		msg.response = await msg.channel.send(hugs[Util.randomInt(0, hugs.length)]) as HavocMessage;
		setTimeout(async () => msg.response!.edit('🙅').catch(() => null), 2000);
	}
}
