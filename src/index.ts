import {TabletopSimulatorService} from './TabletopSimulatorService';
import {TabletopSimulatorClient} from './TabletopSimulatorClient';
import {TtsMessage, TtsMessageId} from './domain/TabletopSimulatorTcpContracts';
import * as readline from 'readline';

var service = new TabletopSimulatorService(logMessage);

interface CustomMessageObjectPayload
{
    guid:string,
    type:'object',
    value:string
}

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
            let objectPayload = message.customMessage as CustomMessageObjectPayload
            console.log(JSON.parse(objectPayload.value));
            break;
        case TtsMessageId.ReturnValue:
            if (message.returnValue != undefined)
            {
                console.log(`>>${message.returnID}>> ${message.returnValue}`);
            }
            break;
        case TtsMessageId.GameSaved:
            console.log("Game has been saved");
            break;
        case TtsMessageId.ObjectCreated:
            console.log(`Object has been created[${message.guid}]`);
            break;
        default:
            console.error('what happened?!');
    }
}

const rl = readline.createInterface(process.stdin, process.stdout);
var client = new TabletopSimulatorClient();

async function main ()
{
    service.Open();

    console.log ("Entering Command REPL.");
    CommandRepl();
}

async function CommandRepl()
{
    rl.setPrompt('?>');

    let promise = new Promise<void>((resolve) =>{
        rl.on('line', (line)=>
        {
            let statement = line.trim();
            switch(statement) {
                case '':
                case 'exit':
                    rl.close();
                    break;
                default:
                    console.log (`Sending Command '${statement}'`);
                    client.ExecuteLuaAsync(statement);
                    console.log ('Command Sent');
                    break;
            }
            rl.prompt();
        });
        
        rl.on('close', ()=> {
            console.log('Exiting...'); 
            resolve();
        });
    });

    rl.prompt();
    return promise;
}

main();