
import { writable } from "svelte/store";
import { Stream, api } from "misskey-js";
import type { Channels } from "misskey-js/built/streaming.types"
import type { Note } from "misskey-js/built/entities";

export type userData = {
    ok: boolean
    id: number
    sessionId: string
    token: string
    userName: string
    hostUrl: string
    stream?: Stream
    cli?: any
    emojis?: any
}

export type timelineOptions = {
    id: number,
    userDataIndex?: number
    channel?: keyof Channels
    channelName?: string
    color?: string
    width?: string
    showNoteNum?: number
    bufferNoteNum?: number
    initialNotes?: Array<Note>
}

export type settingsType = {
    theme?: string
}

export const settings = writable<settingsType>({
    theme: "light"
})
export const userDataArray = writable<Array<userData>>([])
export const timelines = writable<Array<timelineOptions>>([])

export const setCookie = (userData: userData) => {
    const cookieBuff: userData = {
        id: userData.id,
        sessionId: userData.sessionId,
        token: userData.token,
        hostUrl: userData.hostUrl,
        userName: userData.userName,
        ok: userData.ok
    }

    document.cookie = `${cookieBuff.id}=${encodeURIComponent(JSON.stringify(cookieBuff))}; Max-Age=50000000`
}

export const getCookie = async (): Promise<Array<userData>> => {
    const cookies = document.cookie;

    if (cookies === '') return [];

    const strArr = cookies.split("; ");
    const users: Array<userData> = []

    strArr.forEach(elem => {
        users.push(JSON.parse(decodeURIComponent(elem.replace(/\d+=/, ""))))
    })

    for (let i = 0; i < users.length; i++) {
        try {
            users[i].cli = new api.APIClient({
                origin: `https://${users[i].hostUrl}`,
                credential: users[i].token
            })
            users[i].stream = new Stream(`https://${users[i].hostUrl}`, {
                token: users[i].token,
            })

            users[i].emojis = (await users[i].cli.request("emojis")).emojis;
        } catch (err) {
            console.log(err);
            window.alert(`${users[i].hostUrl}との認証に失敗しました。`);
            users[i].ok = false;
        }
    }

    console.log(users)
    return users
}

export const selfUrl = () => {
    if (import.meta.env.MODE === "development") return "https://localhost:5173"
    else return "https://uboar.github.io/missli"
} 