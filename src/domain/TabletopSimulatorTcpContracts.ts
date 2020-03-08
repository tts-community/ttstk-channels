//Message Constants 
export enum TtsMessageId
{
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

export enum ClientMessageId
{
    None = -1,
    GetLuaScripts = 0,
    SaveAndPlay = 1,
    Custom = 2,
    ExecuteLua = 3,
}

// Common Contract Components
export interface ScriptState
{
    name : string,
    guid : string,
    script : string,
    ui : string
}

// Client Messages
export class GetLuaScriptsClientMessage
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

export class SaveAndPlayClientMessage
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

export class CustomClientMessage
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

export class ExecuteLuaClientMessage
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

export type ClientMessage = GetLuaScriptsClientMessage | SaveAndPlayClientMessage | CustomClientMessage | ExecuteLuaClientMessage;

// Service Messages
export interface NewObjectTtsMessage
{
    messageID: TtsMessageId.NewObject;
    scriptStates: ScriptState[];
}

export interface NewGameTtsMessage
{
    messageID: TtsMessageId.NewGame;
    scriptStates: ScriptState[];
}

export interface PrintTtsMessage
{
    messageID: TtsMessageId.Print;
    message: string;
}

export interface ErrorTtsMessage
{
    messageID: TtsMessageId.Error;
    error: string;
    guid: string;
    errorMessagePrefix: string;
}

export interface CustomTtsMessage
{
    messageID: TtsMessageId.Custom;
    customMessage : object;
}

export interface ReturnValueTtsMessage 
{
    messageID: TtsMessageId.ReturnValue;
    returnID: number;
    returnValue: any;
}

export interface GameSavedTtsMessage
{
    messageID: TtsMessageId.GameSaved;
}

export interface ObjectCreatedTtsMessage 
{
    messageID: TtsMessageId.ObjectCreated;
    guid : string;
}

export type TtsMessage = NewObjectTtsMessage | NewGameTtsMessage |PrintTtsMessage |ErrorTtsMessage |CustomTtsMessage |ReturnValueTtsMessage |GameSavedTtsMessage |ObjectCreatedTtsMessage;