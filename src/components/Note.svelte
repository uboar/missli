<script lang="ts">
  import type { Stream } from "misskey-js";
  import type { Note } from "misskey-js/built/entities";
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { type userData, moment } from "../lib/userdata";
  import Mfm from "./Mfm.svelte";
  import Media from "./note/Media.svelte";
  import Reaction from "./note/Reaction.svelte";
  import User from "./note/User.svelte";

  export let user: userData;
  export let note: Note;
  export let stream: Stream = null;
  export let compact = false;

  const dispatch = createEventDispatcher();

  const renoteRequest = (e: Event) => {
    dispatch("renoteRequest");
  };

  const replyRequest = (e: Event) => {
    dispatch("replyRequest");
  };

  const destroyEmoji = (emojiName: string, reactions: [key: number]) => {
    // console.log("break")
    // delete reactions[emojiName]
    // reactions = reactions
  };

  onMount(() => {
    if (!stream) return;
    stream.send("subNote", {
      id: note.id,
    });
  });
  onDestroy(() => {
    if (!stream) return;
    stream.send("unsubNote", {
      id: note.id,
    });
  });
</script>

<div
  class="card card-bordered bg-base-100 w-full my-2 shadow-sm hover:border-neutral-focus"
>
  <div class="card-body {!compact ? '-my-6 -mx-4' : ' -my-2'}">
    <User
      user={note.user}
      hostUrl={user.hostUrl}
      isRenote={note.renote && !note.text}
    />
    {#if note.replyId}
      <a
        class="badge badge-sm -mb-1"
        href={`https://${user.hostUrl}/notes/${note.replyId}`}
        target="_blank"
        rel="noreferrer">↩️返信</a
      >
    {/if}

    {#if note.cw}
      <a
        class="alert shadow-md mb-2"
        href={`https://${user.hostUrl}/notes/${note.id}`}
        target="_blank"
        rel="noreferrer"
      >
        <div class="-m-2">
          <div class="badge badge-warning">CW</div>
          <div class=" link link-hover">
            {note.cw}
          </div>
        </div>
      </a>
    {:else}
      {#if note.text}
        <p class="text-ellipsis overflow-hidden">
          <Mfm
            bind:text={note.text}
            hostUrl={user.hostUrl}
            localEmojis={user.emojis}
            remoteEmojis={note.emojis}
          />
        </p>
      {/if}

      {#if note.poll}
        <a
          class="btn btn-xs btn-info"
          href={`https://${user.hostUrl}/notes/${note.id}`}
          target="_blank"
          rel="noreferrer"
        >
          投票
        </a>
      {/if}

      {#if !compact}
        <!-- メディア内容 -->
        <Media files={note.files} />
        <!-- リノート内容 -->
        {#if note.renote}
          <div class="card card-bordered border-accent rounded p-1 -mt-2">
            <User user={note.renote.user} hostUrl={user.hostUrl} />
            {#if note.renote.text}
              <p class="text-ellipsis overflow-hidden">
                <Mfm
                  text={note.renote.text}
                  hostUrl={user.hostUrl}
                  localEmojis={user.emojis}
                  remoteEmojis={note.renote.emojis}
                />
              </p>
            {/if}

            <!-- メディア内容 -->
            <Media files={note.renote.files} />

            <!-- リアクション -->
            <div class="flex flex-row flex-wrap">
              {#each Object.entries(note.renote.reactions) as [name, num]}
                <Reaction
                  {user}
                  {name}
                  {num}
                  on:destroy={() => {
                    destroyEmoji(name, note.renote.reactions);
                  }}
                  noteId={note.renote.id}
                  reactionEmojis={note.renote.reactionEmojis}
                />
              {/each}
            </div>
          </div>
        {/if}

        <!-- リアクション -->
        {#if note.reactions}
          <div>
            {#each Object.entries(note.reactions) as [name, num]}
              <Reaction
                {user}
                {name}
                {num}
                on:destroy={() => {
                  destroyEmoji(name, note.reactions);
                }}
                noteId={note.id}
                reactionEmojis={note.reactionEmojis}
              />
            {/each}
          </div>
        {/if}
        <div class="divider -my-3" />
        <div class="flex -mb-1 z-10">
          <div class="basis-1/5 tooltip" data-tip="返信">
            <button
              class="btn btn-ghost btn-block btn-xs fill-base-content"
              on:click={replyRequest}
              on:keypress={replyRequest}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="h-4 w-4"
                ><path
                  d="M10,9V5L3,12L10,19V14.9C15,14.9 18.5,16.5 21,20C20,15 17,10 10,9Z"
                /></svg
              >
            </button>
          </div>
          <div class="basis-1/5 tooltip" data-tip="リノート/引用リノート">
            <button
              class="btn btn-ghost btn-block btn-xs fill-base-content"
              on:click={renoteRequest}
              on:keypress={renoteRequest}
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="h-4 w-4"
                ><path
                  d="M6,5.75L10.25,10H7V16H13.5L15.5,18H7A2,2 0 0,1 5,16V10H1.75L6,5.75M18,18.25L13.75,14H17V8H10.5L8.5,6H17A2,2 0 0,1 19,8V14H22.25L18,18.25Z"
                /></svg
              >
            </button>
          </div>
          <div class="basis-1/5" />
          <div class="basis-1/5" />
          <a
            class="basis-1/5 text-xs link pt-1"
            href={`https://${user.hostUrl}/notes/${note.id}`}
            target="_blank"
            rel="noreferrer"
          >
            {moment(note.createdAt).fromNow()}
          </a>
        </div>
      {/if}
    {/if}
  </div>
</div>
