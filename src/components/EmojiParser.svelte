<script lang="ts">
  import { onMount } from "svelte";

  type LocalEmojis = Array<{
    aliases: Array<string>;
    name: string;
    category: string;
    url: string;
  }>;

  let src = "";

  export let text = "";
  export let remoteEmojis: Array<{ name: string; url: string }> = [];
  export let localEmojis: LocalEmojis = [];

  onMount(() => {
    try {
      if (remoteEmojis[text] === undefined) {
        src = localEmojiSearch(text);
      } else {
        src = remoteEmojis[text];
      }
    } catch (err) {
      console.error(err);
      src = "エラー";
    }
  });

  const localEmojiSearch = (emojiName: string): string => {
    try {
      const emojiReplaced = emojiName.replace(/\:|@./gm, "");

      return localEmojis.find((v) => v.name === emojiReplaced).url;
    } catch (err) {
      console.error(err);
      return "エラー";
    }
  };

  const remoteEmojiSearch = (emojiName: string): string => {
    try {
      const emojiReplaced = emojiName.replace(/\:/gm, "");
      return remoteEmojis[emojiReplaced];
    } catch (err) {
      console.error(err);
      return "エラー";
    }
  };
</script>

{#if text.indexOf("@") >= 0}
  <img src={remoteEmojiSearch(text)} class="h-4" alt={text} />
{:else if text.indexOf(":") >= 0}
  <img src={localEmojiSearch(text)} class="h-4" alt={text} />
{:else}
  <span class="h-4">{text}</span>
{/if}
