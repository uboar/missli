<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import Note from "./Note.svelte";
    import type { userData, timelineOptions } from "../lib/userdata";
    import type { Note as NoteType } from "misskey-js/built/entities";
    import type { Connection } from "misskey-js/built/streaming";
    import { timelines } from "../lib/userdata";

    export let dummy: boolean = false;
    export let user: userData = null;
    export let options: timelineOptions;

    let streamChannel: Connection;
    let showOptions = false;

    let color = "#808080";

    let notes: Array<NoteType> = [];

    onMount(() => {
        if (options.initialNotes) notes = options.initialNotes;
        if (dummy) return;

        if (!user) return;
        if (!options) return;
        streamChannel = user.stream.useChannel(options.channel);
        streamChannel.on("note", (payload: NoteType) => {
            console.log(payload);
            notes = [payload, ...notes];
        });
    });

    const timelineDelete = () => {
        timelines.update((val) => {
            const ret = val.filter((v) => v.id !== options.id);
            console.log(ret);
            return ret;
        });
    };

    onDestroy(() => {
        showOptions = false;
        streamChannel.dispose();
    });
</script>

<div
    class="missli-timeline bg-base-200 relative rounded"
    style="width:{options.width}"
>
    <div class="absolute w-full flex justify-center z-10">
        <button
            class="btn btn-xs bg-base-200 btn-outline w-10/12 my-1"
            style="color: {color}"
            on:click={() => {
                showOptions = !showOptions;
            }}
            on:keypress={() => {
                showOptions = !showOptions;
            }}
        >
            {options.channelName}
        </button>
    </div>
    <div
        class="flex w-full timeline-body absolute pt-8 h-full overflow-y-scroll z-0 overflow-x-hidden"
    >
        {#if showOptions}
            <div class="relative w-full p-2">
                <h3 class="border-b">タイムライン設定</h3>
                <div class="form-control mt-4">
                    <span class="label-text">タイムラインの名前</span>
                    <input
                        type="text"
                        class="input input-sm"
                        bind:value={options.channelName}
                    />
                    <div class="flex flex-row my-8">
                        <span class="label-text mr-8">タイムラインの色</span>
                        <input type="color" bind:value={color} />
                    </div>
                    <span class="label-text">タイムラインの大きさ</span>
                    <div class="btn-group">
                        <button
                            class="btn w-1/3"
                            on:click={() => {
                                options.width = "24rem";
                            }}>小</button
                        >
                        <button
                            class="btn w-1/3"
                            on:click={() => {
                                options.width = "36rem";
                            }}>中</button
                        >
                        <button
                            class="btn w-1/3"
                            on:click={() => {
                                options.width = "48rem";
                            }}>大</button
                        >
                    </div>
                    <div class="w-full flex justify-center absolute bottom-0">
                        <button
                            class="btn btn-error btn-outline w-10/12 mt-4 absolute bottom-0"
                            on:click={timelineDelete}>タイムラインを削除</button
                        >
                    </div>
                    <span class="label-text">ノートの表示件数</span>
                    <input
                        type="number"
                        class="input input-sm"
                        bind:value={options.showNoteNum}
                    />
                    <span class="label-text">ノートのバッファ件数</span>
                    <input
                        type="number"
                        class="input input-sm"
                        bind:value={options.bufferNoteNum}
                    />
                </div>
            </div>
        {:else}
            <div class="relative w-full z-10">
                {#each notes as note (note.id)}
                    <Note {note} hostUrl={user.hostUrl} />
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .missli-timeline {
        height: 90dvh;
    }
</style>
