import * as net from 'net';
import {EventEmitter} from 'events';

import {TtsMessage} from "./domain/TabletopSimulatorTcpContracts";

export type MessageHandler = (message: TtsMessage) => void;

export class TabletopSimulatorService extends EventEmitter {
    private readonly LISTENER_DOMAIN = "localhost";
    private readonly LISTENER_PORT = 39998;
    private readonly server:net.Server;

    constructor(private handler: MessageHandler)
    {
        super();
        this.server = net.createServer(this.Listen);
        this.server.on('error', (error)=> console.error(error));
    }

    public Open ()
    {
        try
        {
            this.server.listen(this.LISTENER_PORT, this.LISTENER_DOMAIN);
        }
        catch (err)
        {
            console.log(err);
        }
    }

    private Listen = (socket:net.Socket) =>
    {
        socket.on('data', (data)=>{
            let message:TtsMessage = JSON.parse(data.toString());
            this.handler(message);
        });
        socket.on('error', (err)=> console.warn(err?.message));
    }

    public Close()
    {
        this.server.close((err)=>console.warn(err?.message));
    }
}