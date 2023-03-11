import type { Note } from "misskey-js/built/entities";
import { get, writable } from "svelte/store";
import { timelines } from "./userdata";


export const notesBuffer = writable<Array<Array<Note>>>([]);

export const initialNotesBuffer = () => {
  const arr = get(timelines).map(() => [] as Array<Note>)
  notesBuffer.set(arr);
}