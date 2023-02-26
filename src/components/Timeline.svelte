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

    const defaultOption: timelineOptions = {
        id: new Date().valueOf(),
        userDataIndex: 0,
        channel: "globalTimeline",
        channelName: "タイムライン",
        color: "#808080",
        width: "24rem",
        showNoteNum: 100,
        bufferNoteNum: 1000,
        initialNotes: [],
    };

    let notes: Array<NoteType> = [];
    let beginNotes = 0;
    let scrollPos: HTMLElement

    $: showNotes = notes.slice(beginNotes, options.showNoteNum + beginNotes);

    onMount(() => {
        options = {
            ...defaultOption,
            ...options,
        };

        if (options.initialNotes.length > 0) notes = options.initialNotes;
        if (dummy) return;

        if (!user) return;
        if (!options) return;
        streamChannel = user.stream.useChannel(options.channel);
        streamChannel.on("note", (payload: NoteType) => {
            notes = [payload, ...notes].slice(0, options.bufferNoteNum);
        });
    });

    const timelineDelete = () => {
        if (streamChannel) streamChannel.dispose();
        showOptions = false;
        timelines.update((val) => {
            const ret = val.filter((v) => v.id !== options.id);
            return ret;
        });
        location.href = window.location.origin + window.location.pathname;
    };

    onDestroy(() => {
        showOptions = false;
        if (streamChannel) streamChannel.dispose();
    });
</script>

<div class="h-full bg-base-200 relative rounded" style="width:{options.width}">
    <div class="absolute w-full flex justify-center z-10">
        <button
            class="btn btn-xs bg-base-200 btn-outline w-10/12 my-1"
            style="color: {options.color}"
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
        bind:this={scrollPos}
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
                        <input type="color" bind:value={options.color} />
                    </div>
                    <span class="label-text">タイムラインの大きさ</span>
                    <div class="btn-group">
                        <button
                            class="btn btn-outline btn-sm w-1/4"
                            on:click={() => {
                                options.width = "24rem";
                            }}>小</button
                        >
                        <button
                            class="btn btn-outline btn-sm w-1/4"
                            on:click={() => {
                                options.width = "36rem";
                            }}>中</button
                        >
                        <button
                            class="btn btn-outline btn-sm w-1/4"
                            on:click={() => {
                                options.width = "48rem";
                            }}>大</button
                        >
                        <button
                            class="btn btn-outline btn-sm w-1/4"
                            on:click={() => {
                                options.width = "100vw";
                            }}>画面幅</button
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

                    <button
                        class="btn btn-error btn-block mt-4"
                        on:click={timelineDelete}>タイムラインを削除</button
                    >
                    <div class="w-full flex justify-center absolute bottom-0">
                        <button
                            class="btn btn-primary btn-outline w-10/12 my-4"
                            on:click={() => {
                                showOptions = !showOptions;
                            }}
                            on:keypress={() => {
                                showOptions = !showOptions;
                            }}>閉じる</button
                        >
                    </div>
                </div>
            </div>
        {:else}
            <div class="relative w-full z-10">
                {#if beginNotes > 0}
                    <button
                        class="btn btn-block btn-secondary my-2"
                        on:click={() => {
                            scrollPos.scrollTop = 0;
                            beginNotes = 0;
                        }}
                        on:keypress={() => {
                            scrollPos.scrollTop = 0;
                            beginNotes = 0;
                        }}>最初に戻る</button
                    >
                {/if}
                {#each showNotes as note (note.id)}
                    <Note {note} {user}/>
                {/each}
                {#if beginNotes > 0}
                    <button
                        class="btn btn-block btn-secondary my-2"
                        on:click={() => {
                            scrollPos.scrollTop = 0;
                            beginNotes = 0;
                        }}
                        on:keypress={() => {
                            scrollPos.scrollTop = 0;
                            beginNotes = 0;
                        }}>最初に戻る</button
                    >
                {/if}
                {#if notes.length > options.showNoteNum && notes.length - options.showNoteNum > beginNotes}
                    <button
                        class="btn btn-block btn-primary my-2"
                        on:click={() => {
                            beginNotes += options.showNoteNum / 2;
                        }}
                        on:keypress={() => {
                            beginNotes += options.showNoteNum / 2;
                        }}>もっと表示</button
                    >
                {/if}
            </div>
        {/if}
    </div>
</div>
