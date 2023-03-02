<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Note from "./Note.svelte";
  import type { userData, timelineOptions } from "../lib/userdata";
  import type { Note as NoteType } from "misskey-js/built/entities";
  import type { Connection } from "misskey-js/built/streaming";
  import { timelines } from "../lib/userdata";
  import uniqBy from "lodash/uniqBy";

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
    bufferNoteNum: 250,
    initialNotes: [],
  };

  let notes: Array<NoteType> = [];
  let beginNotes = 0;
  let scrollPos: HTMLElement = document.createElement("div");
  let errFlg = false;

  $: showNotes = notes.slice(beginNotes, options.showNoteNum + beginNotes);

  onMount(async () => {
    options = {
      ...defaultOption,
      ...options,
    };

    if (options.initialNotes.length > 0) notes = options.initialNotes;
    if (dummy) return;

    if (!user || !options || !user.ok) {
      errFlg = true;
      return;
    }

    streamChannel = user.stream.useChannel(options.channel);
    streamChannel.on("note", (payload: NoteType) => {
      notes = uniqBy([payload, ...notes].slice(0, options.bufferNoteNum), "id");
    });
    user.stream.on("noteUpdated", (e) => {
      const noteIndex = notes.findIndex((v) => v.id === e.id);

      if (e.type === "reacted") {
        if (e.body.reaction.indexOf("@.") < 0) {
          if (notes[noteIndex]["reactionEmojis"] === undefined)
            notes[noteIndex]["reactionEmojis"] = {};
          notes[noteIndex].reactionEmojis[e.body.emoji.name] = e.body.emoji.url;
        }
        if (notes[noteIndex].reactions[e.body.reaction] === undefined) {
          notes[noteIndex].reactions[e.body.reaction] = 1;
        } else {
          notes[noteIndex].reactions[e.body.reaction]++;
        }
      } else if (e.type === "deleted") {
        notes.splice(noteIndex, 1);
        notes = [...notes];
      }
    });

    if (options.channel === "globalTimeline")
      notes = uniqBy(
        [...(await user.cli.request("notes/global-timeline")), ...notes],
        "id"
      );
    else if (options.channel === "hybridTimeline")
      notes = uniqBy(
        [...(await user.cli.request("notes/hybrid-timeline")), ...notes],
        "id"
      );
    else if (options.channel === "localTimeline")
      notes = uniqBy(
        [...(await user.cli.request("notes/local-timeline")), ...notes],
        "id"
      );
    else if (options.channel === "homeTimeline")
      notes = uniqBy(
        [...(await user.cli.request("notes/timeline")), ...notes],
        "id"
      );
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

<div class="h-full bg-base-300 relative rounded" style="width:{options.width}">
  <div class="absolute w-full flex justify-center z-10">
    <div class="flex flex-col w-full mx-8">
      <button
        class="btn btn-xs bg-base-300 btn-outline btn-block my-1"
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
  </div>
  <div
    class="w-full timeline-body absolute pt-8 h-full overflow-y-scroll z-0 overflow-x-hidden inline-flex"
    bind:this={scrollPos}
  >
    {#if !errFlg}
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
                class="btn btn-outline btn-sm w-1/5"
                on:click={() => {
                  options.width = "12rem";
                }}>ちび</button
              >
              <button
                class="btn btn-outline btn-sm w-1/5"
                on:click={() => {
                  options.width = "24rem";
                }}>小</button
              >
              <button
                class="btn btn-outline btn-sm w-1/5"
                on:click={() => {
                  options.width = "36rem";
                }}>中</button
              >
              <button
                class="btn btn-outline btn-sm w-1/5"
                on:click={() => {
                  options.width = "48rem";
                }}>大</button
              >
              <button
                class="btn btn-outline btn-sm w-1/5"
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
              class="btn btn-outline btn-secondary mt-4 btn-sm"
              on:click={() => console.log(notes)}
              >ノートのバッファをコンソールに出力</button
            >

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
          {#each showNotes as note (note.id)}
            <Note {note} {user} stream={user.stream} />
          {/each}
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
    {:else}
      <div class="alert alert-error h-10">
        ホストとの通信にエラーが発生しました
      </div>
    {/if}
  </div>
</div>
