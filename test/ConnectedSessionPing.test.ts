import { TabletopSimulatorClient } from '../src/TabletopSimulatorClient';
import { TabletopSimulatorService } from '../src/TabletopSimulatorService';

describe('TabletopSimulatorClient', () => {
    it('Can Send Messages to an Active TTS Instance', async () => {
        var client = new TabletopSimulatorClient();
        let executeCommand = `print("hello world ${Date.now().toString()}")`;
        console.log(`Sent execute lua command: "${executeCommand}`);
        await client.ExecuteLuaAsync(executeCommand);
        client.Close();
    });
});

describe('TabletopSimulatorService', () => {
    it('Can handle messages sent to it.', async (done) => {
        var promise = new Promise(resolve => {
            var service = new TabletopSimulatorService();
            service.on('printmessage', (message:string) => {
                console.log(`Received response: "${message}"`);
                service.Close();
                done();
                resolve();
            });
            service.Open();
        });

        await promise;
    });
});
