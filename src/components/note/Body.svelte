<script lang="ts">
  import type { NoteWrapper } from "@/wrapper/noteWrapper";
  import type { TimelineOptions, UserData } from "@/types/type";
  import User from "@/components/note/User.svelte";
  import Mfm from "@/components/Mfm.svelte";
  import Media from "@/components/note/Media.svelte";
  import Reaction from "@/components/note/Reaction.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  export let user: UserData;
  export let note: NoteWrapper;
  export let compact = false;
  export let renoteCount = 0;
  export let collapse = false;
  export let option: TimelineOptions["noteOption"];

  let showBody = false;
  const dispatch = createEventDispatcher();

  const emojis = () => {
    // Calckey対応
    if (user.emojis.length === 0) {
      // Misskey v12
      return note.emojis;
    } else if (Array.isArray(note.reactionEmojis)) {
      // Calckey
      note.reactionEmojis = [];
      return [...note.emojis, ...note.reactionEmojis, ...user.emojis];
    } else {
      // Misskey v13
      return user.emojis;
    }
  };

  // Calckey対応
  if (note.user.emojis && Array.isArray(note.user.emojis)) {
    let userEmojisBuffer: NoteWrapper["user"]["emojis"] = [];
    note.user.emojis.forEach((elem) => {
      userEmojisBuffer[elem.name] = elem.url;
    });
    note.user.emojis = userEmojisBuffer;
  }

  const destroyEmoji = (emojiName: string, reactions: [key: number]) => {
    // console.log("break")
    // delete reactions[emojiName]
    // reactions = reactions
  };

  onMount(() => {
    if (option.cwShow) showBody = true;
    note.reactions = Object.fromEntries(
      Object.entries(note.reactions).sort((a, b) => b[1] - a[1])
    );
  });
</script>

<div class="flex w-full justify-between">
  <User
    user={note.user}
    hostUrl={user.hostUrl}
    isRenote={note.renote && !note.text}
    localEmojis={user.emojis}
  />
  <div class="flex gap-2">
    {#if note.localOnly}
      <div
        class="tooltip tooltip-left grid items-center fill-base-content"
        data-tip="連合なし"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="h-4 w-4"
          ><path
            d="M14.46 15.88L15.88 14.46L18 16.59L20.12 14.47L21.54 15.88L19.41 18L21.54 20.12L20.12 21.54L18 19.41L15.88 21.54L14.46 20.12L16.59 18L14.47 15.88M20 12C20 8.64 17.93 5.77 15 4.59V5C15 6.1 14.1 7 13 7H11V9C11 9.55 10.55 10 10 10H8V12H14C14.5 12 14.9 12.35 15 12.81C13.2 13.85 12 15.79 12 18C12 19.5 12.54 20.85 13.44 21.9L12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12L21.9 13.44C21.34 12.96 20.7 12.59 20 12.34L20 12M11 19.93V18C9.9 18 9 17.1 9 16V15L4.21 10.21C4.08 10.78 4 11.38 4 12C4 16.08 7.06 19.44 11 19.93Z"
          /></svg
        >
      </div>
    {/if}
    {#if note.visibility === "home"}
      <div
        class="tooltip tooltip-left grid items-center fill-base-content"
        data-tip="ホーム"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          ><path
            d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22"
          /></svg
        >
      </div>
    {:else if note.visibility === "followers"}
      <div
        class="tooltip tooltip-left grid items-center fill-base-content"
        data-tip="フォロワーのみ"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="h-4 w-4"
          ><path
            d="M12,17C10.89,17 10,16.1 10,15C10,13.89 10.89,13 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10C4,8.89 4.89,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
          /></svg
        >
      </div>
    {:else if note.visibility === "specified"}
      <div
        class="tooltip tooltip-left grid items-center fill-base-content"
        data-tip="ダイレクト"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="h-4 w-4"
          >\<path
            d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6M20 6L12 11L4 6H20M20 18H4V8L12 13L20 8V18Z"
          /></svg
        >
      </div>
    {/if}
  </div>
</div>
{#if note.replyId}
  <a
    class="tooltip tooltip-right w-fit"
    data-tip="返信元のノートを開く"
    href={`https://${user.hostUrl}/notes/${note.replyId}`}
    target="_blank"
    rel="noreferrer"
  >
    <span class="badge badge-sm -mb-1">↩️返信</span>
  </a>
{/if}

{#if collapse && ((note.text && note.renote) || !note.renote)}
  <div class="card relative -mt-2 max-h-16 overflow-hidden rounded-none">
    <div class="card-body -mx-4 -my-6 text-left">
      <div class="opacity-60">
        {#if note.text}
          <Mfm
            bind:text={note.text}
            hostUrl={user.hostUrl}
            localEmojis={emojis()}
            remoteEmojis={note.emojis}
            on:unParsedMfm={() => dispatch("unParsedMfm")}
          />
        {/if}
      </div>
    </div>
    <div class="absolute bottom-0 w-full">
      <button
        class="btn-info btn-outline btn-block btn-xs btn bg-base-100 opacity-90"
        on:click={() => (collapse = false)}>ノートを開く</button
      >
    </div>
  </div>
{:else if note.cw != null}
  <button class="alert mb-2 shadow-md" on:click={() => (showBody = !showBody)}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class="-m-2 h-6 w-6 fill-warning"
      ><path
        d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"
      /></svg
    >
    <span class="link-hover link -m-2 overflow-x-hidden">
      <Mfm
        bind:text={note.cw}
        hostUrl={user.hostUrl}
        localEmojis={emojis()}
        remoteEmojis={note.emojis}
        on:unParsedMfm={() => dispatch("unParsedMfm")}
      />
    </span>
  </button>
{/if}
{#if (note.cw == null || showBody) && !collapse}
  {#if note.text}
    <p class="overflow-hidden text-ellipsis">
      <Mfm
        bind:text={note.text}
        hostUrl={user.hostUrl}
        localEmojis={emojis()}
        remoteEmojis={note.emojis}
        on:unParsedMfm={() => dispatch("unParsedMfm")}
      />
    </p>
  {/if}
  {#if note.poll}
    <a
      class="btn-info btn-xs btn"
      href={`https://${user.hostUrl}/notes/${note.id}`}
      target="_blank"
      rel="noreferrer"
    >
      投票
    </a>
  {/if}

  <!-- メディア内容 -->
  {#if note.files.length > 0 && !compact && !collapse}
    <Media files={note.files} {option} />
  {/if}
{/if}

{#if note.channelId}
  <a
    class="link text-xs opacity-40"
    href={`https://${user.hostUrl}/channels/${note.channelId}`}
    target="_blank"
    rel="noreferrer"
    style="color: {note.channel.color}"
    >{note.channel.name}
  </a>
{/if}

{#if !compact}
  <!-- リノート内容 -->
  {#if note.renote && renoteCount > 0}
    <a
      class="btn-accent btn-outline btn-block btn-sm btn"
      href={`https://${user.hostUrl}/notes/${note.renote.id}`}
      target="_blank"
      rel="noreferrer"
    >
      もっとリノートを見る
    </a>
  {:else if note.renote && (!collapse || !note.text)}
    <div class="card-bordered card rounded border-accent p-1">
      <svelte:self
        {user}
        bind:note={note.renote}
        renoteCount={renoteCount + 1}
        {option}
        {collapse}
      />
    </div>
  {/if}

  <!-- リアクション -->
  {#if note.reactions && !collapse && !option.reactionHide}
    <div>
      {#each Object.entries(note.reactions) as [name, num]}
        <Reaction
          {user}
          {name}
          {num}
          emojis={emojis()}
          size={option.reactionSize}
          reactionEmojis={note.reactionEmojis || {}}
          on:destroy={() => {
            destroyEmoji(name, note.reactions);
          }}
          noteId={note.id}
        />
      {/each}
    </div>
  {/if}
{/if}
