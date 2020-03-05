import {TabletopSimulatorService} from './TabletopSimulatorService';
import {TabletopSimulatorClient} from './TabletopSimulatorClient';
import {TtsMessage, TtsMessageId} from './domain/TabletopSimulatorTcpContracts';

var service = new TabletopSimulatorService(logMessage);

function logMessage(message:TtsMessage)
{
    switch (message.messageID) {
        case TtsMessageId.NewObject: 
            console.log(JSON.stringify(message.scriptStates));
            break;
        case TtsMessageId.NewGame: 
            console.log(JSON.stringify(message.scriptStates));
            break;
        case TtsMessageId.Print: 
            console.log(`~|${message.message}`);
            break;
        case TtsMessageId.Error: 
            console.log(`[${message.guid}] Error: ${message.errorMessagePrefix} ${message.error}`);
            break;
        case TtsMessageId.Custom:
            console.log(message.customMessage);
            break;
        case TtsMessageId.ReturnValue:
            console.log(message.returnValue);
            break;
        case TtsMessageId.GameSaved:
            console.log("Game has been saved");
            break;
        case TtsMessageId.ObjectCreated:
            console.log(`Object has been created[${message.guid}]`);
            break;
    }
}

async function main ()
{
    console.log('opening listener service on port 39998');
    service.Open();

    for (var index:number = 0; index < 1000; index++ )
    {
        var client = new TabletopSimulatorClient();
        await client.ExecuteLuaAsync(`print('hello world #${index}')`);
        //client.Close();
        //client.GetLuaScripts();
        //await sleep(1000);
        //client.Close();
        //client.CustomMessage({Iama: "CustomMessage"});
        //client.GetLuaScripts();
    } 
}

main();

// function sleep(ms:number) {
//     return new Promise((resolve) => { 
//       setTimeout(resolve, ms);
//     });
//   }   

// const terminateAfter = (ms: number) => new Promise<void>(resolve => {
//         setTimeout(()=>
//         {
//             service.Close();
//             resolve();
//         },
//         ms);        
//     });