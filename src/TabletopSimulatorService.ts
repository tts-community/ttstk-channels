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
    }

    public async Open ()
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
        socket.on("data", (data)=>{
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