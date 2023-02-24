<script lang="ts">
    import { onMount } from "svelte";
    import Note from "./Note.svelte";
    import type { userData } from "../lib/userdata";
    import type { Note as NoteType } from "misskey-js/built/entities";
    import type { Connection } from "misskey-js/built/streaming";
import type { Channels } from "misskey-js/built/streaming.types"

    export let dummy: boolean = false;
    export let user: userData = null;
    export let timelineName: string = "タイムライン";
    export let channel: keyof Channels = "globalTimeline"
    let streamChannel: Connection;

    export let notes: Array<NoteType> = [];

    onMount(() => {
        if (!dummy) {
            if (!user) return;
            streamChannel = user.stream.useChannel(channel)
            streamChannel.on("note", (payload: NoteType) => {
                console.log(payload)
                notes = [payload, ...notes];
            });
        }
    });
</script>

<div class="missli-timeline w-96 bg-base-200 relative rounded">
    <div
        class="absolute w-full flex justify-center bg-base-100 border-b border-b-base-300 z-10"
    >
        <btn class="btn btn-xs btn-outline w-10/12 my-1">
            {timelineName}
        </btn>
    </div>
    <div class="flex w-full timeline-body absolute pt-8 h-full overflow-y-scroll z-0">
        <div class="relative w-full">
            {#each notes as note}
                <Note {note} />
            {/each}
        </div>
    </div>
</div>

<style>
    .missli-timeline {
        height: 90dvh;
    }
</style>
