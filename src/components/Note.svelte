<script lang="ts">
  import type { Stream } from "misskey-js";
  import type { Note } from "misskey-js/built/entities";
  import { onDestroy, onMount } from "svelte";
  import { type userData, moment } from "../lib/userdata";
  import Mfm from "./Mfm.svelte";
  import Media from "./note/Media.svelte";
  import Reaction from "./note/Reaction.svelte";
  import User from "./note/User.svelte";

  export let user: userData;
  export let note: Note;
  export let stream: Stream = null;

  $: localEmojiSearch;

  const localEmojiSearch = (emojiName: string): string => {
    try {
      return user.emojis.find((v) => v.name === emojiName).url;
    } catch (err) {
      console.error(err);
      return "エラー";
    }
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
  class="card card-bordered bg-base-100 w-full my-2 shadow-sm hover:bg-base-200"
>
  <div class="card-body -my-6 -mx-4">
    <User
      user={note.user}
      hostUrl={user.hostUrl}
      isRenote={note.renote && !note.text}
    />
    {#if note.text}
      <p class="text-ellipsis overflow-hidden">
        <Mfm
          text={note.text}
          hostUrl={user.hostUrl}
          localEmojis={user.emojis}
          remoteEmojis={note.emojis}
        />
      </p>
    {/if}

    <!-- メディア内容 -->
    <Media files={note.files} />
    <!-- リノート内容 -->
    {#if note.renote}
      <div class="card card-bordered border-accent rounded p-1">
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
    <a
      class="text-right text-xs link -mt-3"
      href={`https://${user.hostUrl}/notes/${note.id}`}
      target="_blank"
      rel="noreferrer"
    >
      {moment(note.createdAt).fromNow()}
    </a>
  </div>
</div>
