<script lang="ts">
  import type { Note as NoteType } from "misskey-js/built/entities";
  import type { userData } from "../../lib/userdata";
  import User from "./User.svelte";
  import Mfm from "../Mfm.svelte";
  import Media from "./Media.svelte";
  import Reaction from "./Reaction.svelte";

  export let user: userData;
  export let note: NoteType;
  export let compact = false;
  export let renoteCount = 0;

  let showCw = false;

  const destroyEmoji = (emojiName: string, reactions: [key: number]) => {
    // console.log("break")
    // delete reactions[emojiName]
    // reactions = reactions
  };
</script>

<User
  user={note.user}
  hostUrl={user.hostUrl}
  isRenote={note.renote && !note.text}
  localEmojis={user.emojis}
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
  <button
    class="alert shadow-md mb-2"
    on:click={() => (showCw = !showCw)}
  >
    <div class="-m-2">
      <div class="badge badge-warning">CW</div>
      <div class=" link link-hover">
        <Mfm
          bind:text={note.cw}
          hostUrl={user.hostUrl}
          localEmojis={user.emojis}
        />
      </div>
    </div>
  </button>
{/if}
{#if !note.cw || showCw}
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

  <!-- メディア内容 -->
  {#if note.files.length > 0 && !compact}
    <Media files={note.files} />
  {/if}
{/if}

{#if !compact}
  <!-- リノート内容 -->
  {#if note.renote && renoteCount > 0}
    <a
      class="btn btn-outline btn-accent btn-sm btn-block"
      href={`https://${user.hostUrl}/notes/${note.renote.id}`}
      target="_blank"
      rel="noreferrer"
    >
      もっとリノートを見る
    </a>
  {:else if note.renote}
    <div class="card card-bordered border-accent rounded p-1">
      <svelte:self {user} note={note.renote} renoteCount={renoteCount + 1} />
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
{/if}
