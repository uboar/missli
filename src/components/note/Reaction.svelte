<script lang="ts">
  import type { userData } from "../../lib/userdata";

  export let name: string;
  export let num: number;
  export let reactionEmojis: [key: string];
  export let user: userData;
  export let color = "accent"
  export let noteId = "";

  $: localEmojiSearch;

  const localEmojiSearch = (emojiName: string): string => {
    try {
      return user.emojis.find((v) => v.name === emojiName).url;
    } catch (err) {
      console.error(err);
      return "エラー";
    }
  };

  const clickReaction = (str) => {

  }
</script>

{#if name.indexOf("@.") >= 0}
  <span class="badge badge-outline badge-{color} h-5">
    <img
      src={localEmojiSearch(name.replace(/\:|@./gm, ""))}
      class="h-4"
      alt={name}
    />
    {num}
  </span>
{:else if name.indexOf("@") >= 0}
  <span class="badge badge-outline h-5">
    <img
      src={reactionEmojis[name.replace(/\:/gm, "")]}
      class="h-4"
      alt={name}
    />
    {num}
  </span>
{:else}
  <span class="badge badge-outline badge-{color} h-5">
    <span class="h-4">{name}</span>
    {num}
  </span>
{/if}
