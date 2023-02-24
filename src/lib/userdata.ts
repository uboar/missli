
import { writable } from "svelte/store";
import type { Stream } from "misskey-js";
import type { Channels } from "misskey-js/built/streaming.types"
import type { Note } from "misskey-js/built/entities";

export type userData = {
    ok: boolean
    sessionId: string
    token: string
    user: any
    hostUrl: string
    stream: Stream
}

export type timeline = {
    userDataIndex: number
    channel: keyof Channels
    channelName: string
    notes: Array<Note>
}

export const userDataArray = writable<Array<userData>>([])
export const timelines = writable<Array<timeline>>([])

export const selfUrl = () => {
    if (import.meta.env.MODE === "development") return "http://localhost:5173"
    else return "https://uboar.github.io/missli"
} 