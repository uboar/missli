<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { UserData } from "../../lib/userdata";
  import twemoji from "twemoji";

  export let name: string;
  export let num: number;
  export let reactionEmojis: [key: string];
  export let emojis: Array<{ name: string; url: string }>;
  export let user: UserData;
  export let color = "accent";
  export let noteId = "";
  export let size = 16;
  export let isReacted = false;

  const dispatch = createEventDispatcher();

  $: localEmojiSearch = (emojiName: string): string => {
    try {
      const emojiReplaced = emojiName.replace(/\:|@./gm, "");
      return emojis.find((v) => v.name.replace("@.", "") === emojiReplaced).url;
    } catch (err) {
      console.error(err);
      return "エラー";
    }
  };

  $: remoteEmojiSearch = (emojiName: string): string => {
    try {
      const emojiReplaced = emojiName.replace(/\:/gm, "");
      if (reactionEmojis[emojiReplaced] == null) {
        return emojis.find((v) => v.name === emojiReplaced).url;
      } else {
        return reactionEmojis[emojiReplaced];
      }
    } catch (err) {
      console.error(err);
      return "エラー";
    }
  };

  const clickReaction = async () => {
    try {
      if (!isReacted) {
        await user.cli.request("notes/reactions/create", {
          noteId: noteId,
          reaction: name,
        });
        isReacted = true;
      } else {
        await user.cli.request("notes/reactions/delete", {
          noteId: noteId,
        });
        isReacted = false;
        num--;
        if (num == 0) dispatch("destroy");
      }
    } catch (err) {
      console.error(err);
      isReacted = false;
    }
  };
</script>

{#if name.indexOf("@.") >= 0}
  <button
    class="badge {!isReacted ? 'badge-outline' : ''} badge-{color} h-fit"
    style="--reactionSize: {size + 'px'}"
    on:click={clickReaction}
    title={name}
  >
    <img src={localEmojiSearch(name)} alt={name} class="reaction-img" />
    {num}
  </button>
{:else if name.indexOf("@") >= 0}
  <span
    class="badge badge-outline h-fit"
    title={name}
    style="--reactionSize: {size + 'px'}"
  >
    <img src={remoteEmojiSearch(name)} alt={name} class="reaction-img" />
    {num}
  </span>
{:else}
  <button
    class="badge {!isReacted
      ? 'badge-outline'
      : ''} badge-{color} unicode-emoji h-fit"
    on:click={clickReaction}
    style="--reactionSize: {size + 'px'}"
  >
    <span>
      {@html twemoji.parse(name, { className: "reaction-img" })}
    </span>
    {num}
  </button>
{/if}


<style>
  :global(.reaction-img) {
    height: var(--reactionSize);
  }
</style>