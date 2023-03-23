<script lang="ts">
  import type { Stream } from "misskey-js";
  import type { Note } from "misskey-js/built/entities";
  import { createEventDispatcher, onMount } from "svelte";
  import { type UserData, moment, type TimelineOptions } from "../lib/userdata";
  import Body from "./note/Body.svelte";
  import ReactionDeck from "./note/ReactionDeck.svelte";

  export let user: UserData;
  export let note: Note;
  export let stream: Stream = null;
  export let timelineOptions: TimelineOptions = null;
  export let compact = false;

  let showReactionDeck = false;
  let collapse = false;

  let noteElement: HTMLDivElement;

  const dispatch = createEventDispatcher();

  const renoteRequest = (e: Event) => {
    dispatch("renoteRequest");
  };

  const replyRequest = (e: Event) => {
    dispatch("replyRequest");
  };

  onMount(() => {
    if (!stream) return;

    if (
      timelineOptions.noteOption.noteCollapse === true &&
      noteElement.getBoundingClientRect().height >
        timelineOptions.noteOption.noteHeight
    )
      collapse = true;
  });

  $: reactionId = () => {
    if (note.renote && !note.text) return note.renote.id;
    else return note.id;
  };

  const reactionDeckBreakRequest = (e: CustomEvent<string>) => {
    showReactionDeck = false;
  };
</script>

<div
  class="card card-bordered bg-base-100 w-full shadow-sm hover:border-neutral-focus"
  bind:this={noteElement}
>
  <div class="card-body {!compact ? '-my-6 -mx-4' : ' -my-2'}">
    <Body {note} {user} {compact} {collapse} option={timelineOptions.noteOption} />
    {#if !compact}
      <div class="divider -my-3" />
      <div class="flex -mb-1 z-10">
        <div class="basis-1/5 tooltip" data-tip="返信">
          <button
            class="btn btn-ghost btn-block btn-xs fill-base-content"
            on:click={replyRequest}
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
        <div class="basis-1/5 tooltip" data-tip="リアクション">
          <button
            class="btn btn-ghost btn-block btn-xs fill-base-content"
            on:click={() => (showReactionDeck = !showReactionDeck)}
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="h-4 w-4"
              ><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg
            >
          </button>
        </div>
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
    {#if showReactionDeck}
      <ReactionDeck
        customReactionDeck={timelineOptions.reactionDeck}
        {user}
        noteId={reactionId()}
        on:breakRequest={reactionDeckBreakRequest}
      />
    {/if}
  </div>
</div>
