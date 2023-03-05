<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { userData } from "../../lib/userdata";

  export let name: string;
  export let num: number;
  export let reactionEmojis: [key: string];
  export let user: userData;
  export let color = "accent";
  export let noteId = "";
  export let isReacted = false;

  const dispatch = createEventDispatcher();

  $: localEmojiSearch = (emojiName: string): string => {
    try {
      const emojiReplaced = emojiName.replace(/\:|@./gm, "");

      return user.emojis.find((v) => v.name === emojiReplaced).url;
    } catch (err) {
      console.error(err);
      return "エラー";
    }
  };

  $: remoteEmojiSearch = (emojiName: string): string => {
    try {
      const emojiReplaced = emojiName.replace(/\:/gm, "");
      return reactionEmojis[emojiReplaced];
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
    class="badge {!isReacted ? 'badge-outline' : ''} badge-{color} h-5"
    on:click={clickReaction}
    title="name"
  >
    <img src={localEmojiSearch(name)} class="h-4" alt={name} />
    {num}
  </button>
{:else if name.indexOf("@") >= 0}
  <span class="badge badge-outline h-5" 
  title="name">
    <img src={remoteEmojiSearch(name)} class="h-4" alt={name} />
    {num}
  </span>
{:else}
  <button
    class="badge {!isReacted
      ? 'badge-outline'
      : ''} badge-{color} h-5 unicode-emoji"
    on:click={clickReaction}
  >
    <span class="h-4">{name}</span>
    {num}
  </button>
{/if}
