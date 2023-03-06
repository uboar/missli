<script lang="ts">
  import { onMount, onDestroy, tick, createEventDispatcher } from "svelte";
  import Note from "./Note.svelte";
  import type {
    userData,
    timelineOptions,
    postNote as postNoteType,
  } from "../lib/userdata";
  import type { Note as NoteType } from "misskey-js/built/entities";
  import type { Connection } from "misskey-js/built/streaming";
  import { timelines } from "../lib/userdata";
  import uniqBy from "lodash/uniqBy";
  import TimelineOptions from "./timeline/TimelineOptions.svelte";
  import TimelinePostNote from "./timeline/TimelinePostNote.svelte";
  import TimelineNotify from "./timeline/TimelineNotify.svelte";
  import type { Endpoints } from "misskey-js";

  export let dummy: boolean = false;
  export let user: userData = null;
  export let options: timelineOptions;

  let streamChannel: Connection;

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
    reactionDeck: [],
    isCollapsed: false,
  };

  const NAV = {
    none: 0,
    note: 1,
    notify: 2,
    settings: 3,
  };

  let notes: Array<NoteType> = [];
  let beginNotes = 0;
  let scrollPos: HTMLElement = document.createElement("div");
  let errFlg = false;
  let showNav = NAV.none;
  let postNote: postNoteType = {
    text: "",
    visibility: "public",
    localOnly: false,
    cw: null,
  };
  let unRead = false;

  let renoteNote: NoteType | null = null;
  const renoteRequest = async (note: NoteType) => {
    renoteNote = null;
    replyNote = null;
    await tick();
    if (note.renote && !note.text) {
      renoteNote = note.renote;
      postNote.localOnly = note.renote.localOnly;
      postNote.visibility = note.renote.visibility;
    } else {
      renoteNote = note;
      postNote.localOnly = note.localOnly;
      postNote.visibility = note.visibility;
    }
    showNav = NAV.note;
  };

  let replyNote: NoteType | null = null;
  const replyRequest = async (note: NoteType) => {
    renoteNote = null;
    replyNote = null;
    await tick();
    if (note.renote && !note.text) {
      replyNote = note.renote;
      postNote.localOnly = note.renote.localOnly;
      postNote.visibility = note.renote.visibility;
    } else {
      replyNote = note;
      postNote.localOnly = note.localOnly;
      postNote.visibility = note.visibility;
    }
    showNav = NAV.note;
  };

  $: showNotes = notes.slice(beginNotes, options.showNoteNum + beginNotes);

  const timelineTypeEnum: Record<string, keyof Endpoints> = {
    globalTimeline: "notes/global-timeline",
    hybridTimeline: "notes/hybrid-timeline",
    localTimeline: "notes/local-timeline",
    homeTimeline: "notes/timeline",
  };

  const moreNote = async () => {
    if (timelineTypeEnum[options.channel] == null) {
      notes = uniqBy(
        [
          ...notes,
          ...(await user.cli.request("channels/timeline", {
            untilId: notes[notes.length - 1].id,
            channelId: options.channel,
          })),
        ],
        "id"
      ).slice(0, options.bufferNoteNum);
    } else {
      notes = uniqBy(
        [
          ...notes,
          ...(await user.cli.request(timelineTypeEnum[options.channel], {
            untilId: notes[notes.length - 1].id,
          })),
        ],
        "id"
      ).slice(0, options.bufferNoteNum);
    }
  };

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
     * 初期タイムラインの取得
     */
    if (timelineTypeEnum[options.channel] == null) {
      notes = uniqBy(
        [
          ...(await user.cli.request("channels/timeline", {
            channelId: options.channel,
          })),
          ...notes,
        ],
        "id"
      );
      /**
       * チャンネルに接続
       */
      streamChannel = user.stream.useChannel("channel", {
        channelId: options.channel,
      });
      postNote.channelId = options.channel;
    } else {
      notes = uniqBy(
        [
          ...(await user.cli.request(timelineTypeEnum[options.channel])),
          ...notes,
        ],
        "id"
      );
      /**
       * チャンネルに接続
       */
      streamChannel = user.stream.useChannel(options.channel);
    }
    streamChannel.on("note", (payload: NoteType) => {
      notes = uniqBy([payload, ...notes].slice(0, options.bufferNoteNum), "id");
      if (options.isCollapsed) unRead = true;
    });

    /**
     * ノート情報の更新
     */
    user.stream.on("noteUpdated", async (e) => {
      await tick();
      const noteIndex = notes.findIndex((v) => v.id === e.id);
      if (noteIndex < 0) {
        console.error("can't find note data");
        return;
      }
      if (notes[noteIndex]["reactionEmojis"] == null)
        notes[noteIndex]["reactionEmojis"] = {};
      if (notes[noteIndex]["reactions"] == null)
        notes[noteIndex]["reactions"] = {};

      try {
        if (e.type === "reacted") {
          if (
            e.body.reaction.indexOf("@.") < 0 &&
            e.body.reaction.indexOf("@") >= 0
          ) {
            notes[noteIndex].reactionEmojis[e.body.emoji.name] =
              e.body.emoji.url;
          } else {
            if (notes[noteIndex].reactions[e.body.reaction] == null) {
              notes[noteIndex].reactions[e.body.reaction] = 1;
            } else {
              notes[noteIndex].reactions[e.body.reaction]++;
            }
          }
        } else if (e.type === "unreacted") {
          if (
            e.body.reaction.indexOf("@.") < 0 &&
            e.body.reaction.indexOf("@") >= 0
          ) {
            notes[noteIndex].reactionEmojis[e.body.emoji.name] =
              e.body.emoji.url;
          }
          notes[noteIndex].reactions[e.body.reaction]--;
        } else if (e.type === "deleted") {
          notes.splice(noteIndex, 1);
          notes = [...notes];
        }
      } catch (e) {
        console.error(e);
      }
    });
  });

  const dispatch = createEventDispatcher();

  const swapLeft = () => {
    const self = $timelines.findIndex((v) => v.id === options.id);
    if ($timelines.length === 1) return;
    if (self === 0) return;
    $timelines.splice(self - 1, 2, $timelines[self], $timelines[self - 1]);
    dispatch("breakRequest");
  };
  const swapRight = () => {
    const self = $timelines.findIndex((v) => v.id === options.id);
    if ($timelines.length === 1) return;
    if (self === $timelines.length - 1) return;
    $timelines.splice(self, 2, $timelines[self + 1], $timelines[self]);
    dispatch("breakRequest");
  };

  const timelineDelete = () => {
    if (streamChannel) streamChannel.dispose();
    showNav = NAV.none;
    timelines.update((val) => {
      const ret = val.filter((v) => v.id !== options.id);
      return ret;
    });
    dispatch("breakRequest");
  };

  onDestroy(() => {
    showNav = NAV.none;
    if (streamChannel) streamChannel.dispose();
  });
</script>

{#if !options.isCollapsed}
  <div
    class="h-full bg-base-300 relative rounded"
    style="width:{options.width}"
  >
    <div class="absolute w-full flex justify-center z-10">
      <div class="flex flex-col w-full ml-8">
        <button
          class="btn btn-xs bg-base-100 btn-outline btn-block my-1 normal-case"
          style="color: {options.color}"
          on:click={() => (scrollPos.scrollTop = 0)}
        >
          {options.channelName}
        </button>
      </div>
      <button
        class="btn btn-xs bg-base-100 my-1 mr-8 ml-2 btn-outline btn-square"
        style="color: {options.color}"
        on:click={() => (options.isCollapsed = true)}
      >
        ❮
      </button>
    </div>
    <div
      class="w-full timeline-body absolute pt-8 h-full overflow-y-scroll z-0 overflow-x-hidden inline-flex overscroll-none"
      bind:this={scrollPos}
      style:--color={options.color + "20"}
    >
      {#if !errFlg}
        <!-- オプション -->
        {#if showNav === NAV.settings}
          <TimelineOptions
            bind:options
            on:deleteRequest={() => timelineDelete()}
            on:swapLeft={swapLeft}
            on:swapRight={swapRight}
            on:getNoteRequest={() => console.log(notes)}
          />
        {:else}
          <!-- ノート表示 -->
          <div class="relative w-full z-10">
            {#each showNotes as note (note.id)}
              <Note
                {note}
                {user}
                timelineOptions={options}
                stream={user.stream}
                on:renoteRequest={() => renoteRequest(note)}
                on:replyRequest={() => replyRequest(note)}
              />
            {/each}
            <button
              class="btn btn-block btn-secondary my-2"
              on:click={() => {
                scrollPos.scrollTop = 0;
                beginNotes = 0;
              }}>最初に戻る</button
            >
            {#if notes.length > options.showNoteNum && notes.length - options.showNoteNum > beginNotes}
              <button
                class="btn btn-block btn-primary my-2"
                on:click={() => {
                  beginNotes += options.showNoteNum / 2;
                }}>もっと表示</button
              >
            {:else}
              <button class="btn btn-block btn-primary my-2" on:click={moreNote}
                >もっと表示(追加読み込み)</button
              >{/if}
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
      {#if showNav === NAV.note}
        <TimelinePostNote
          bind:user
          bind:postNote
          bind:replyNote
          bind:renoteNote
          on:breakRequest={() => (showNav = NAV.none)}
        />
      {/if}
      {#if showNav === NAV.notify}
        <TimelineNotify bind:user />
      {/if}
      <div class="flex my-1 justify-around">
        <!-- 通知ボタン -->
        <div
          class="tooltip"
          data-tip={showNav === NAV.notify ? "閉じる" : "通知"}
        >
          <div class="indicator">
            {#if user.notifyUnOpen}
              <span class="indicator-item flex">
                <span
                  class="animate-ping absolute top-0 right-0 inline-flex h-4 w-4 rounded-full bg-secondary opacity-75"
                />
                <span
                  class="absolute inline-flex top-0 right-0 rounded-full h-4 w-4 bg-secondary"
                />
              </span>
            {/if}
            <button
              class="btn btn-circle btn-outline fill-base-content hover:fill-base-100"
              on:click={() =>
                (showNav = showNav === NAV.notify ? NAV.none : NAV.notify)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="h-8 w-8"
                ><path
                  d={showNav === NAV.notify
                    ? "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                    : "M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"}
                /></svg
              >
            </button>
          </div>
        </div>
        <!-- ノートボタン -->
        <div
          class="tooltip"
          data-tip={showNav === NAV.note ? "閉じる" : "ノート"}
        >
          <button
            class="btn btn-circle btn-primary fill-base-100"
            on:click={() =>
              (showNav = showNav === NAV.note ? NAV.none : NAV.note)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="h-8 w-8"
              ><path
                d={showNav === NAV.note
                  ? "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  : "M2,21L23,12L2,3V10L17,12L2,14V21Z"}
              /></svg
            >
          </button>
        </div>

        <!-- 設定ボタン -->
        <div
          class="tooltip"
          data-tip={showNav === NAV.settings ? "閉じる" : "タイムラインの設定"}
        >
          <button
            class="btn btn-circle btn-outline fill-base-content hover:fill-base-100"
            on:click={() =>
              (showNav = showNav === NAV.settings ? NAV.none : NAV.settings)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="h-8 w-8"
              ><path
                d={showNav === NAV.settings
                  ? "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  : "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"}
              /></svg
            >
          </button>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div
    class="h-full bg-base-300 relative rounded w-8 grid place-content-center"
  >
    <div class="indicator -rotate-90">
      {#if unRead}
        <span class="indicator-item flex">
          <span
            class="animate-ping absolute top-0.5 right-0.5 inline-flex h-4 w-4 rounded-full bg-secondary opacity-75"
          />
          <span
            class="absolute inline-flex top-0.5 right-0.5 rounded-full h-4 w-4 bg-secondary"
          />
        </span>
      {/if}
      <button
        class="badge badge-outline link link-hover animate-none"
        style="color: {options.color}; width: 70vh"
        on:click={() => {
          options.isCollapsed = false;
          unRead = false;
        }}>{options.channelName}</button
      >
    </div>
  </div>
{/if}

<style>
  div::-webkit-scrollbar-track {
    background-color: var(--color);
  }
</style>
