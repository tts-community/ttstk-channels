import { TabletopSimulatorClient } from '../src/TabletopSimulatorClient';

describe('TabletopSimulatorClient', () => {
  it('Can Send Messages to an Active TTS Instance', async () => { 
      var client = new TabletopSimulatorClient();
      await client.ExecuteLuaAsync('print("hello world")');
      client.Close();
  });
});
  