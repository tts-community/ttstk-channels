import * as net from "net";
import {TtsMessage} from "./domain/TabletopSimulatorTcpContracts";

export type MessageHandler = (message: TtsMessage) => void;

export class TabletopSimulatorService {
    private readonly LISTENER_DOMAIN = "localhost";
    private readonly LISTENER_PORT = 39998;
    private readonly server:net.Server;

    constructor(private handler: MessageHandler)
    {
        this.server = net.createServer(this.Listen);
        this.server.on('close', ()=> console.log("Server closed"));
        this.server.on('connection', (socket)=> console.log(`A connection has been established. Port ${socket.remotePort}`));
        this.server.on('listening', ()=> console.log('The server has been bound to a listener.'));
        this.server.on('error', (error)=> console.error(error)); // handle reconnection?
        this.server.close(()=> console.log("Server closed"));
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
        console.log(`${socket.remoteAddress}:${socket.remotePort}`);
        socket.on('connect', ()=> console.log("client connected"));
        socket.on('data', (data)=>{
            let message:TtsMessage = JSON.parse(data.toString());
            this.handler(message);
        });
        socket.on('close',  ()=> console.log("connection closed"));
        socket.on('error', (err)=> console.warn(err?.message));
    }

    public Close()
    {
        this.server.close((err)=>console.warn(err?.message));
    }
}