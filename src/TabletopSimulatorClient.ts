import * as net from "net";
import { ScriptState } from "./domain/ScriptState";

// Client Messages
export enum ClientMessageId
{
    None = -1,
    GetLuaScripts = 0,
    SaveAndPlay = 1,
    Custom = 2,
    ExecuteLua = 3,
}

class GetLuaScriptsClientMessage
{
    messageID: ClientMessageId = ClientMessageId.GetLuaScripts;

    constructor() {
    }

    public toString = () : string =>
    {
        return JSON.stringify({
            messageID: this.messageID
         });
    }
}

class SaveAndPlayClientMessage
{
    messageID: ClientMessageId = ClientMessageId.SaveAndPlay;

    constructor(public readonly scriptStates: ScriptState[]) {
    }

    public toString = () : string =>
    {
        return JSON.stringify({
            messageID: this.messageID,
            scriptStates: this.scriptStates
         });
    }
}

class CustomClientMessage
{
    messageID: ClientMessageId = ClientMessageId.Custom;

    constructor(public readonly customMessage: object) {
    }

    public toString = () : string =>
    {
        return JSON.stringify({
            messageID: this.messageID,
            customMessage: this.customMessage
         });
    }
}

class ExecuteLuaClientMessage
{
    private static returnIdCounter:number = 1;

    messageID: ClientMessageId = ClientMessageId.ExecuteLua;

    constructor(public readonly script:string, public readonly guid:string = "-1", public readonly returnID = ExecuteLuaClientMessage.returnIdCounter++) {
    }

    public toString = () : string =>
    {
        return JSON.stringify({
            messageID: this.messageID,
            guid: this.guid,
            returnID: this.returnID,
            script: this.script
         });
    }
}

type ClientMessage = GetLuaScriptsClientMessage | SaveAndPlayClientMessage | CustomClientMessage | ExecuteLuaClientMessage;

export class TabletopSimulatorClient {
    private readonly REMOTE_DOMAIN = "localhost";
    private readonly REMOTE_PORT = 39999;
    private connection: net.Socket;
    private connected: boolean = false;

    constructor() {
        this.connection = new net.Socket(); // dead socket.
        this.connected = false;
    }

    public GetLuaScriptsAsync = () => this.sendMessageAsync(new GetLuaScriptsClientMessage());

    public SaveAndPlayAsync = (scriptStates: ScriptState[]) => this.sendMessageAsync(new SaveAndPlayClientMessage(scriptStates));

    public CustomMessageAsync = (customMessage: object) => this.sendMessageAsync(new CustomClientMessage(customMessage));

    public ExecuteLuaAsync = (scriptBody: string) => this.sendMessageAsync(new ExecuteLuaClientMessage(scriptBody));

    public Close = () => {
        if (this.connected) {
            this.connection.end();
        }
    }

    private sendMessageAsync = async (clientMessage: ClientMessage) => {
        if (!this.connected) {
            this.connection = this.createConnection();
            this.connected = true;
        }

        this.connection.write(clientMessage.toString());

        await new Promise(resolve => {
            this.connection.on('close', async () => {
                this.connected = false;
                resolve();
            });
        });
    }

    private createConnection = (): net.Socket => {
        var connection = net.createConnection(this.REMOTE_PORT, this.REMOTE_DOMAIN)
            .on('data', this.onDataHandler)
            .on('error', this.onError)
            .on('end', this.onEnd)
            .on('close', this.onClose)
            .on('timeout', this.onTimeout);

        return connection;
    }

    private onDataHandler = (data: Buffer) => {
        console.log(`Client received data '${data.toJSON().toString()}'`)
    }

    private onError = (error: Error) => {
        console.error(error);
        console.log(error.stack);
    }

    private onEnd = () => {
        this.connected = false;
    }

    private onClose = () => {
        this.connected = false;
    }

    private onTimeout = () => {
        console.log("Connection timed out.");
    }
}