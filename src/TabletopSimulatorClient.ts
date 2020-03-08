import * as net from "net";
import { ExecuteLuaClientMessage, GetLuaScriptsClientMessage, SaveAndPlayClientMessage, ScriptState, CustomClientMessage, ClientMessage } from "./domain/TabletopSimulatorTcpContracts"

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
        //    .on('connect', this.onConnectHandler)
            .on('data', this.onDataHandler)
        //    .on('drain', this.onDrain)
            .on('error', this.onError)
            .on('end', this.onEnd)
            .on('close', this.onClose)
        //    .on('lookup', this.onLookup)
            .on('timeout', this.onTimeout);

        return connection;
    }

    private onConnectHandler = () => {
        console.log(`Client connected to ${this.REMOTE_DOMAIN}:${this.REMOTE_PORT}`)
    }

    private onDataHandler = (data: Buffer) => {
        console.log(`Client received data '${data.toJSON().toString()}'`)
    }

    private onDrain = () => {
        console.log('Client connection drained.');
    }

    private onError = (error: Error) => {
        console.error(error);
        console.log(error.stack);
    }

    private onEnd = () => {
        this.connected = false;
        //console.log("Client Connection Ended");
    }

    private onClose = () => {
        this.connected = false;
        //console.log("Client Connection Closed");
    }

    private onLookup = (error: Error, address: string, family: string | number, host: string) => {
        if (error != null) {
            console.error(error);
        }
        console.info(`On Lookup Event handled for ${address} ${family} ${host}`)
    }

    private onTimeout = () => {
        console.log("Connection timed out.");
    }
}