<script lang="ts">
  import { onMount, onDestroy, tick, createEventDispatcher } from "svelte";
  import Note from "./Note.svelte";
  import type {
    UserData,
    TimelineOptions as Option,
    PostNote as postNoteType,
  } from "../types/type";

  import type { Note as NoteType } from "@misskey-js/entities";
  import type { Connection } from "@misskey-js/streaming";
  import { timelines, settings } from "@/lib/userdata";
  import TimelineOptions from "@/components/timeline/TimelineOptions.svelte";
  import TimelinePostNote from "@/components/timeline/TimelinePostNote.svelte";
  import TimelineNotify from "@/components/timeline/TimelineNotify.svelte";
  import {
    fixChannelData,
    getOldNotes,
    initializeTimeline,
    notesUpdate,
    onNote,
  } from "../lib/channel";
  import TimelineLinks from "./timeline/TimelineLinks.svelte";

  const dispatch = createEventDispatcher();

  export let dummy: boolean = false;
  export let user: UserData = null;
  export let options: Option;

  let streamChannel: Connection;

  const defaultOption: Option = {
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
    notesBuffer: [],
    isCollapsed: false,
    autoCollapse: true,
    lowRate: false,
    noteOption: {
      mediaHide: false,
      mediaSize: 256,
      reactionSize: 16,
      reactionHide: false,
      cwShow: false,
      nsfwShow: false,
      noteCollapse: true,
      noteHeight: 512,
    },
  };

  const NAV = {
    none: 0,
    note: 1,
    notify: 2,
    settings: 3,
    links: 4,
  };

  let subscribedNotesId: Array<string> = [];
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

  options = {
    ...defaultOption,
    ...options,
  };

  options.noteOption = {
    ...defaultOption.noteOption,
    ...options.noteOption,
  };

  options = fixChannelData(options);
  if (options.initialNotes.length > 0)
    options.notesBuffer = options.initialNotes;

  $: showNotes = options.notesBuffer.slice(
    beginNotes,
    options.showNoteNum + beginNotes
  );

  $: getTimelineTip = () => {
    if (options.channel === "homeTimeline") {
      return `${user.hostUrl}のホームタイムライン`;
    } else if (options.channel === "localTimeline") {
      return `${user.hostUrl}のローカルタイムライン`;
    } else if (options.channel === "hybridTimeline") {
      return `${user.hostUrl}のソーシャルタイムライン`;
    } else if (options.channel === "globalTimeline") {
      return `${user.hostUrl}のグローバルタイムライン`;
    } else if (options.channel === "channel") {
      return `${user.hostUrl}のチャンネル`;
    } else if (options.channel === "antenna") {
      return `${user.hostUrl}のアンテナ`;
    } else if (options.channel === "userList") {
      return `${user.hostUrl}のリスト`;
    } else if (options.channel === "roleTimeline") {
      return `${user.hostUrl}のロールタイムライン`;
    } else {
      return "不明";
    }
  };
  $: getTimelineSvgPath = () => {
    if (options.channel === "homeTimeline") {
      return "M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22";
    } else if (options.channel === "localTimeline") {
      return "M10,2C8.89,2 8,2.89 8,4V7C8,8.11 8.89,9 10,9H11V11H2V13H6V15H5C3.89,15 3,15.89 3,17V20C3,21.11 3.89,22 5,22H9C10.11,22 11,21.11 11,20V17C11,15.89 10.11,15 9,15H8V13H16V15H15C13.89,15 13,15.89 13,17V20C13,21.11 13.89,22 15,22H19C20.11,22 21,21.11 21,20V17C21,15.89 20.11,15 19,15H18V13H22V11H13V9H14C15.11,9 16,8.11 16,7V4C16,2.89 15.11,2 14,2H10M10,4H14V7H10V4M5,17H9V20H5V17M15,17H19V20H15V17Z";
    } else if (options.channel === "hybridTimeline") {
      return "M13.13 22.19L11.5 18.36C13.07 17.78 14.54 17 15.9 16.09L13.13 22.19M5.64 12.5L1.81 10.87L7.91 8.1C7 9.46 6.22 10.93 5.64 12.5M19.22 4C19.5 4 19.75 4 19.96 4.05C20.13 5.44 19.94 8.3 16.66 11.58C14.96 13.29 12.93 14.6 10.65 15.47L8.5 13.37C9.42 11.06 10.73 9.03 12.42 7.34C15.18 4.58 17.64 4 19.22 4M19.22 2C17.24 2 14.24 2.69 11 5.93C8.81 8.12 7.5 10.53 6.65 12.64C6.37 13.39 6.56 14.21 7.11 14.77L9.24 16.89C9.62 17.27 10.13 17.5 10.66 17.5C10.89 17.5 11.13 17.44 11.36 17.35C13.5 16.53 15.88 15.19 18.07 13C23.73 7.34 21.61 2.39 21.61 2.39S20.7 2 19.22 2M14.54 9.46C13.76 8.68 13.76 7.41 14.54 6.63S16.59 5.85 17.37 6.63C18.14 7.41 18.15 8.68 17.37 9.46C16.59 10.24 15.32 10.24 14.54 9.46M8.88 16.53L7.47 15.12L8.88 16.53M6.24 22L9.88 18.36C9.54 18.27 9.21 18.12 8.91 17.91L4.83 22H6.24M2 22H3.41L8.18 17.24L6.76 15.83L2 20.59V22M2 19.17L6.09 15.09C5.88 14.79 5.73 14.47 5.64 14.12L2 17.76V19.17Z";
    } else if (options.channel === "globalTimeline") {
      return "M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z";
    } else if (options.channel === "channel") {
      return "M8.16,3L6.75,4.41L9.34,7H4C2.89,7 2,7.89 2,9V19C2,20.11 2.89,21 4,21H20C21.11,21 22,20.11 22,19V9C22,7.89 21.11,7 20,7H14.66L17.25,4.41L15.84,3L12,6.84L8.16,3M4,9H17V19H4V9M19.5,9A1,1 0 0,1 20.5,10A1,1 0 0,1 19.5,11A1,1 0 0,1 18.5,10A1,1 0 0,1 19.5,9M19.5,12A1,1 0 0,1 20.5,13A1,1 0 0,1 19.5,14A1,1 0 0,1 18.5,13A1,1 0 0,1 19.5,12Z";
    } else if (options.channel === "antenna") {
      return "M12 7.5C12.69 7.5 13.27 7.73 13.76 8.2S14.5 9.27 14.5 10C14.5 11.05 14 11.81 13 12.28V21H11V12.28C10 11.81 9.5 11.05 9.5 10C9.5 9.27 9.76 8.67 10.24 8.2S11.31 7.5 12 7.5M16.69 5.3C17.94 6.55 18.61 8.11 18.7 10C18.7 11.8 18.03 13.38 16.69 14.72L15.5 13.5C16.5 12.59 17 11.42 17 10C17 8.67 16.5 7.5 15.5 6.5L16.69 5.3M6.09 4.08C4.5 5.67 3.7 7.64 3.7 10S4.5 14.3 6.09 15.89L4.92 17.11C3 15.08 2 12.7 2 10C2 7.3 3 4.94 4.92 2.91L6.09 4.08M19.08 2.91C21 4.94 22 7.3 22 10C22 12.8 21 15.17 19.08 17.11L17.91 15.89C19.5 14.3 20.3 12.33 20.3 10S19.5 5.67 17.91 4.08L19.08 2.91M7.31 5.3L8.5 6.5C7.5 7.42 7 8.58 7 10C7 11.33 7.5 12.5 8.5 13.5L7.31 14.72C5.97 13.38 5.3 11.8 5.3 10C5.3 8.2 5.97 6.64 7.31 5.3Z";
    } else if (options.channel === "userList") {
      return "M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z";
    } else if (options.channel === "roleTimeline") {
      return "M17,3H14V5H17V21H7V5H10V3H7A2,2 0 0,0 5,5V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V5A2,2 0 0,0 17,3M12,7A2,2 0 0,1 14,9A2,2 0 0,1 12,11A2,2 0 0,1 10,9A2,2 0 0,1 12,7M16,15H8V14C8,12.67 10.67,12 12,12C13.33,12 16,12.67 16,14V15M16,18H8V17H16V18M12,20H8V19H12V20M13,5H11V1H13V5Z";
    } else {
      return "M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.67,14.17C13,15 13,16 13,17H10C10,15.33 10,13.92 10.67,12.92C11.33,11.92 12.67,11.33 13.5,10.67C15.92,8.43 15.32,5.26 12,5A3,3 0 0,0 9,8H6A6,6 0 0,1 12,2Z";
    }
  };

  onMount(async () => {
    if (dummy) return;

    if (!user || !options || !user.ok) {
      errFlg = true;
      return;
    }

    if (options.channel === "channel") postNote.channelId = options.channelId;

    streamChannel = await initializeTimeline(user, options, subscribedNotesId);
    options.notesBuffer = options.notesBuffer;

    /**
     * ノートの受信
     */
    streamChannel.on("note", async (payload: NoteType) => {
      onNote(user, options, subscribedNotesId, payload);
      options.notesBuffer = options.notesBuffer;
      if (options.isCollapsed) unRead = true;
    });

    /**
     * ノート情報の更新
     */
    user.stream.on("noteUpdated", async (e) => {
      notesUpdate(user, options, subscribedNotesId, e);
      options.notesBuffer = options.notesBuffer;
      await tick();
    });
  });

  onDestroy(() => {
    showNav = NAV.none;
    if (streamChannel) streamChannel.dispose();
  });

  const moreNote = async () => {
    await getOldNotes(
      user,
      options,
      subscribedNotesId,
      options.notesBuffer[options.notesBuffer.length - 1].id
    );
    options.notesBuffer = options.notesBuffer;
  };

  const swapLeft = () => {
    const self = $timelines.findIndex((v) => v.id === options.id);
    if ($timelines.length === 1) return;
    if (self === 0) return;
    const timelinesBuffer = [...$timelines];
    timelinesBuffer.splice(
      self - 1,
      2,
      timelinesBuffer[self],
      timelinesBuffer[self - 1]
    );
    $timelines = timelinesBuffer;
    dispatch("breakRequest");
  };
  const swapRight = () => {
    const self = $timelines.findIndex((v) => v.id === options.id);
    if ($timelines.length === 1) return;
    if (self === $timelines.length - 1) return;
    const timelinesBuffer = [...$timelines];
    timelinesBuffer.splice(
      self,
      2,
      timelinesBuffer[self + 1],
      timelinesBuffer[self]
    );
    $timelines = timelinesBuffer;
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

  /**
   * @description リノートボタンが押された時
   * @param note
   */
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
  let renoteNote: NoteType | null = null;

  /**
   * @description 返信ボタンが押された時
   * @param note
   */
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

  /**
   * @description 一番下までスクロールした際に自動で次のノートを取得する
   */
  const autoGet = () => {
    if ($settings.autoGetOldNotes) {
      if (
        scrollPos.scrollTop >=
        scrollPos.scrollHeight - scrollPos.clientHeight
      ) {
        moreNote();
      }
    }
  };

  let replyNote: NoteType | null = null;

  $: iconSize = options.width !== "12rem" ? "8" : "4";
</script>

{#if !options.isCollapsed}
  <div
    class="relative h-full rounded bg-base-300"
    style="width:{options.width}"
  >
    <div class="absolute z-10 flex w-full justify-center">
      <div class="tooltip tooltip-bottom" data-tip={getTimelineTip()}>
        <button
          class="btn btn-square btn-outline btn-xs mx-3 my-1 bg-base-100"
          style="color: {options.color}; fill:{options.color}"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="h-3 w-3"><path d={getTimelineSvgPath()} /></svg
          >
        </button>
      </div>
      <div class="flex w-full flex-col">
        <button
          class="btn btn-outline btn-xs btn-block my-1 bg-base-100 normal-case"
          style="color: {options.color}"
          on:click={() => (scrollPos.scrollTop = 0)}
        >
          {options.channelName}
        </button>
      </div>
      <div class="tooltip tooltip-bottom" data-tip="タイムラインを畳む">
        <button
          class="btn btn-square btn-outline btn-xs mx-3 my-1 bg-base-100"
          style="color: {options.color}"
          on:click={() => (options.isCollapsed = true)}
        >
          ❮
        </button>
      </div>
    </div>
    <div
      class="timeline-body absolute z-0 inline-flex h-full w-full overflow-x-hidden overflow-y-scroll overscroll-y-none overscroll-x-auto pt-8"
      bind:this={scrollPos}
      on:scroll={autoGet}
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
            on:getNoteRequest={() => console.log(options.notesBuffer)}
          />
        {:else}
          <!-- ノート表示 -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="relative z-10 w-full"
            on:mousedown={() => {
              if (options.autoCollapse) showNav = NAV.none;
            }}
          >
            {#each showNotes as note (note.id)}
              <div class="z-20 my-1">
                <Note
                  {note}
                  {user}
                  timelineOptions={options}
                  stream={user.stream}
                  on:renoteRequest={() => renoteRequest(note)}
                  on:replyRequest={() => replyRequest(note)}
                />
              </div>
            {/each}
            <button
              class="btn btn-secondary btn-block my-2"
              on:click={() => {
                scrollPos.scrollTop = 0;
                beginNotes = 0;
              }}>最初に戻る</button
            >
            {#if options.notesBuffer.length > options.showNoteNum && options.notesBuffer.length - options.showNoteNum > beginNotes}
              <button
                class="btn btn-primary btn-block my-2"
                on:click={() => {
                  beginNotes += options.showNoteNum / 2;
                }}>もっと表示</button
              >
            {:else}
              <button class="btn btn-primary btn-block my-2" on:click={moreNote}
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
      class="absolute bottom-0 z-50 w-full border-b-2 border-t-2 bg-base-200 bg-opacity-95"
      style="border-color:{options.color}"
    >
      <!-- タイムラインのフッター -->
      {#if showNav === NAV.note}
        <TimelinePostNote
          bind:user
          bind:postNote
          bind:replyNote
          bind:renoteNote
          bind:option={options}
          on:breakRequest={() => (showNav = NAV.none)}
        />
      {/if}
      {#if showNav === NAV.notify}
        <TimelineNotify bind:user />
      {/if}
      {#if showNav === NAV.links}
        <TimelineLinks {options} {user} />
      {/if}
      <div>
        <div class="btn-group w-full">
          <!-- 通知ボタン -->
          <button
            class="btn btn-outline tooltip w-1/3 fill-base-content hover:fill-base-100"
            data-tip={showNav === NAV.notify ? "閉じる" : "通知"}
            on:click={() =>
              (showNav = showNav === NAV.notify ? NAV.none : NAV.notify)}
          >
            <div class="group indicator">
              {#if user.notifyUnOpen}
                <span class="indicator-item flex">
                  <span
                    class="absolute right-0 top-0 inline-flex h-4 w-4 animate-ping rounded-full bg-secondary opacity-75"
                  />
                  <span
                    class="absolute right-0 top-0 inline-flex h-4 w-4 rounded-full bg-secondary"
                  />
                </span>
              {/if}
              <div class="z-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  class="h-{iconSize}"
                  ><path
                    d={showNav === NAV.notify
                      ? "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                      : "M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"}
                  /></svg
                >
              </div>
            </div>
          </button>
          <!-- ノートボタン -->
          <button
            class="btn btn-primary tooltip w-1/3 fill-base-100"
            on:click={() =>
              (showNav = showNav === NAV.note ? NAV.none : NAV.note)}
            data-tip={showNav === NAV.note ? "閉じる" : "ノート"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="h-{iconSize} w-full"
              ><path
                d={showNav === NAV.note
                  ? "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  : "M2,21L23,12L2,3V10L17,12L2,14V21Z"}
              /></svg
            >
          </button>
          <!-- リンクボタン -->
          <button
            class="btn btn-outline tooltip w-1/6 fill-base-content hover:fill-base-100"
            data-tip={showNav === NAV.links ? "閉じる" : "リンク"}
            on:click={() =>
              (showNav = showNav === NAV.links ? NAV.none : NAV.links)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class={options.width === "12rem" ? "-ml-2 h-4 w-4" : "h-8 w-8"}
              ><path
                d={showNav === NAV.links
                  ? "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  : "M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"}
              /></svg
            >
          </button>
          <!-- 設定ボタン -->
          <button
            class="btn btn-outline tooltip w-1/6 fill-base-content hover:fill-base-100"
            data-tip={showNav === NAV.settings
              ? "閉じる"
              : "タイムラインの設定"}
            on:click={() =>
              (showNav = showNav === NAV.settings ? NAV.none : NAV.settings)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class={options.width === "12rem" ? "-ml-2 h-4 w-4" : "h-8 w-8"}
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
    class="relative grid h-full w-8 place-content-center rounded bg-base-300"
  >
    <div
      class="tooltip tooltip-bottom absolute right-1 top-0"
      data-tip="タイムラインを開く"
    >
      <button
        class="btn btn-square btn-outline btn-xs mt-1"
        style="color: {options.color};"
        on:click={() => {
          options.isCollapsed = false;
          unRead = false;
        }}>❯</button
      >
    </div>
    <div class="indicator -rotate-90">
      {#if unRead}
        <span class="indicator-item flex">
          <span
            class="absolute right-0.5 top-1 inline-flex h-4 w-4 animate-ping rounded-full bg-secondary opacity-75"
          />
          <span
            class="absolute right-0.5 top-1 inline-flex h-4 w-4 rounded-full bg-secondary"
          />
        </span>
      {/if}
      <button
        class="btn btn-outline no-animation btn-xs normal-case"
        style="color: {options.color}; width: 75vh"
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
