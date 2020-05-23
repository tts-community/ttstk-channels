import { TabletopSimulatorService } from './TabletopSimulatorService';
import { TabletopSimulatorClient } from './TabletopSimulatorClient';
import { ScriptState } from 'domain/ScriptState';

import * as readline from 'readline';

var service = new TabletopSimulatorService();
service.on('newobjectmessage', (scriptStates: ScriptState[]) => console.log(JSON.stringify(scriptStates)));
service.on('newgamemessage', (scriptStates: ScriptState[]) => console.log(JSON.stringify(scriptStates)));
service.on('printmessage', (message: string) => console.log(`~|${message}`));
service.on('errormessage', (error: string, guid: string, errorMessagePrefix: string) => console.log(`[${guid}] Error: ${errorMessagePrefix} ${error}`));
service.on('custommessage', (message: object) => console.log(JSON.parse((message as CustomMessageObjectPayload).value)));
service.on('returnvaluemessage', (returnID: number, returnValue: any) => { if (returnValue != undefined) { console.log(`>>${returnID}>> ${returnValue}`); } });
service.on('savedmessage', () => console.log("Game has been saved"));
service.on('objectcreatedmessage', (guid: string) => console.log(`Object has been created[${guid}]`));
service.on('error', (error: Error)=> console.error(error));

interface CustomMessageObjectPayload {
    guid: string,
    type: 'object',
    value: string
}

const rl = readline.createInterface(process.stdin, process.stdout);
var client = new TabletopSimulatorClient();

async function main() {
    service.Open();

    console.log("Entering Command REPL.");
    CommandRepl();
}

async function CommandRepl() {
    rl.setPrompt('?>');

    let promise = new Promise<void>((resolve) => {
        rl.on('line', (line) => {
            let statement = line.trim();
            switch (statement) {
                case '':
                case 'exit':
                    rl.close();
                    break;
                default:
                    console.log(`Sending Command '${statement}'`);
                    client.ExecuteLuaAsync(statement);
                    console.log('Command Sent');
                    break;
            }
            rl.prompt();
        });

        rl.on('close', () => {
            console.log('Exiting...');
            resolve();
        });
    });

    rl.prompt();
    return promise;
}

main();