
import { writable } from "svelte/store";
import { Stream } from "misskey-js";
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
}

export type timelineOptions = {
    id: number,
    userDataIndex: number
    channel: keyof Channels
    channelName: string
    color: string
    width: string
    showNoteNum: number
    bufferNoteNum: number
    initialNotes?: Array<Note>
}

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

export const getCookie = (): Array<userData> => {
    const cookies = document.cookie;

    console.log(cookies)
    
    if(cookies === '') return [];

    const strArr = cookies.split("; ");
    const users: Array<userData> = []

    try {
        strArr.forEach(elem => {
            users.push(JSON.parse(decodeURIComponent(elem.replace(/\d+=/, ""))))
        })

        for (let i = 0; i < users.length; i++) {
            users[i].stream = new Stream(`https://${users[i].hostUrl}`, {
                token: users[i].token,
            })
        }
    } catch (err) {
        window.alert("クッキーの読み込みでエラーが発生しました。")
    }
    return users
}

export const selfUrl = () => {
    if (import.meta.env.MODE === "development") return "https://localhost:5173"
    else return "https://uboar.github.io/missli"
} 