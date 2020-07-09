import * as net from 'net';
import { TypedEmitter } from 'tiny-typed-emitter';
import { ScriptState } from "./domain/ScriptState";

// Service Messages
enum TtsMessageId {
    None = -1,
    NewObject = 0,
    NewGame = 1,
    Print = 2,
    Error = 3,
    Custom = 4,
    ReturnValue = 5,
    GameSaved = 6,
    ObjectCreated = 7
}

interface NewObjectTtsMessage {
    messageID: TtsMessageId.NewObject;
    scriptStates: ScriptState[];
}

interface NewGameTtsMessage {
    messageID: TtsMessageId.NewGame;
    scriptStates: ScriptState[];
}

interface PrintTtsMessage {
    messageID: TtsMessageId.Print;
    message: string;
}

interface ErrorTtsMessage {
    messageID: TtsMessageId.Error;
    error: string;
    guid: string;
    errorMessagePrefix: string;
}

interface CustomTtsMessage {
    messageID: TtsMessageId.Custom;
    customMessage: object;
}

interface ReturnValueTtsMessage {
    messageID: TtsMessageId.ReturnValue;
    returnID: number;
    returnValue: any;
}

interface GameSavedTtsMessage {
    messageID: TtsMessageId.GameSaved;
}

interface ObjectCreatedTtsMessage {
    messageID: TtsMessageId.ObjectCreated;
    guid: string;
}

type TtsMessage = NewObjectTtsMessage | NewGameTtsMessage | PrintTtsMessage | ErrorTtsMessage | CustomTtsMessage | ReturnValueTtsMessage | GameSavedTtsMessage | ObjectCreatedTtsMessage;

export interface TabletopSimulatorServiceEvents {
    'newobjectmessage': (scriptStates: ScriptState[]) => void;
    'newgamemessage': (scriptStates: ScriptState[]) => void;
    'printmessage': (message: string) => void;
    'errormessage': (message: string, guid: string, errorMessagePrefix: string) => void;
    'custommessage': (payload: object) => void;
    'returnvaluemessage': (returnID: number, returnValue: any) => void;
    'savedmessage': () => void;
    'objectcreatedmessage': (guid: string) => void;
    'error': (error: Error) => void;
}

export class TabletopSimulatorService extends TypedEmitter<TabletopSimulatorServiceEvents> {
    private readonly LISTENER_DOMAIN = "localhost";
    private readonly LISTENER_PORT = 39998;
    private readonly server: net.Server;

    private body = '';

    constructor() {
        super();
        this.server = net.createServer(this.Listen);
        this.server.on('error', (error) => this.emit('error', error));
    }

    public Open() {
        try {
            this.server.listen(this.LISTENER_PORT, this.LISTENER_DOMAIN);
        }
        catch (err) {
            console.log(err);
        }
    }

    private HandleData = (data: Buffer) => { this.body += data; }

    private HandleMessage = () => {
        let message: TtsMessage = JSON.parse(this.body.toString());

        switch (message.messageID) {
            case TtsMessageId.NewObject:
                this.emit('newobjectmessage', message.scriptStates);
                break;
            case TtsMessageId.NewGame:
                this.emit('newgamemessage', message.scriptStates);
                break;
            case TtsMessageId.Print:
                this.emit('printmessage', message.message);
                break;
            case TtsMessageId.Error:
                this.emit('errormessage', message.error, message.guid, message.errorMessagePrefix);
                break;
            case TtsMessageId.Custom:
                this.emit('custommessage', message.customMessage);
                break;
            case TtsMessageId.ReturnValue:
                this.emit('returnvaluemessage', message.returnID, message.returnValue);
                break;
            case TtsMessageId.GameSaved:
                this.emit('savedmessage');
                break;
            case TtsMessageId.ObjectCreated:
                this.emit('objectcreatedmessage', message.guid);
                break;
            default:
                this.emit('error', new Error(`An error occurred attempting to parse a message from TTS: ${this.body.toString()}`));
                break;
        }
        this.body = '';
    };

    private Listen = (socket: net.Socket) => {
        socket.on('data', this.HandleData);
        socket.on('end', this.HandleMessage);
        socket.on('error', (err) => console.warn(err?.message));
    }

    public Close() {
        this.server.close();
    }
}