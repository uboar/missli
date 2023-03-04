<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Note from "./Note.svelte";
  import type { userData, timelineOptions, postNote as postNoteType } from "../lib/userdata";
  import type { Note as NoteType } from "misskey-js/built/entities";
  import type { Connection } from "misskey-js/built/streaming";
  import { timelines } from "../lib/userdata";
  import uniqBy from "lodash/uniqBy";
  import TimelineOptions from "./timeline/TimelineOptions.svelte";
  import TimelinePostNote from "./timeline/TimelinePostNote.svelte";

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
  let showNote = false;
  let postNote: postNoteType = {
    text: "",
    visibility: "public",
    localOnly: false,
    cw: null,
  };

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

    /**
     * ノート情報の更新
     */
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

    /**
     * 初期タイムラインの取得
     */
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

    /**
     * チャンネルに接続
     */
    streamChannel = user.stream.useChannel(options.channel);
    streamChannel.on("note", (payload: NoteType) => {
      notes = uniqBy([payload, ...notes].slice(0, options.bufferNoteNum), "id");
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

<div class="h-full bg-base-300 relative rounded" style="width:{options.width}">
  <div class="absolute w-full flex justify-center z-10">
    <div class="flex flex-col w-full mx-8">
      <button
        class="btn btn-xs bg-base-100 btn-outline btn-block my-1"
        style="color: {options.color}"
        on:click={() => {
          scrollPos.scrollTop = 0;
        }}
        on:keypress={() => {
          scrollPos.scrollTop = 0;
        }}
      >
        {options.channelName}
      </button>
    </div>
  </div>
  <div
    class="w-full timeline-body absolute pt-8 h-full overflow-y-scroll z-0 overflow-x-hidden inline-flex overscroll-none"
    bind:this={scrollPos}
  >
    {#if !errFlg}
      <!-- オプション -->
      {#if showOptions}
        <TimelineOptions
          bind:options
          on:deleteRequest={() => timelineDelete()}
          on:getNoteRequest={() => console.log(notes)}
        />
      {:else}
        <!-- ノート表示 -->
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
          <div class="pt-16" />
        </div>
      {/if}
    {:else}
      <div class="alert alert-error h-10">
        ホストとの通信にエラーが発生しました
      </div>
    {/if}
  </div>
  <div
    class="absolute bottom-0 w-full z-50 bg-base-200 bg-opacity-90 border-b-4"
    style="border-color:{options.color}"
  >
    <!-- タイムラインのフッター -->
    {#if showNote}
      <TimelinePostNote cli={user.cli} bind:postNote />
    {/if}
    <div class="flex my-1 justify-around">
      <!-- ノートボタン -->
      <div class="tooltip" data-tip={showNote ? "閉じる" : "ノート"}>
        <button
          class="btn btn-circle btn-primary fill-base-100"
          on:click={() => (showNote = !showNote)}
          on:keypress={() => (showNote = !showNote)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="h-8 w-8"
            ><path
              d={showNote
                ? "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                : "M2,21L23,12L2,3V10L17,12L2,14V21Z"}
            /></svg
          >
        </button>
      </div>

      <!-- 設定ボタン -->
      <div
        class="tooltip"
        data-tip={showOptions ? "閉じる" : "タイムラインの設定"}
      >
        <button
          class="btn btn-circle fill-base-100"
          on:click={() => (showOptions = !showOptions)}
          on:keypress={() => (showOptions = !showOptions)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="h-8 w-8"
            ><path
              d={showOptions
                ? "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                : "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"}
            /></svg
          >
        </button>
      </div>
    </div>
  </div>
</div>
