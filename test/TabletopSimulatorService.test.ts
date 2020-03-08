import { TabletopSimulatorService } from '../src/TabletopSimulatorService';

describe('TabletopSimulatorService', () => {
  it('Can handle messages sent to it.', async (done) => {
    var promise = new Promise(resolve => {
      var service = new TabletopSimulatorService((_) => {
        done();
        service.Close();
        resolve();
      });

      service.Open();
    });
    await promise;
  });
});