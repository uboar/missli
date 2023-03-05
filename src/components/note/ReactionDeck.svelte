<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { userData } from "../../lib/userdata";
  import unicodeEmojis from "../../assets/unicodeEmojis.json";

  const suggestEmojiNum = 20;
  let inputElem: HTMLInputElement;

  $: suggestedText = [] as Array<{
    name: string;
    url?: string;
    value?: string;
    isUnicodeEmoji?: boolean;
  }>;

  export let user: userData;
  export let noteId: string;

  let text = "";
  const dispatch = createEventDispatcher();

  const emojiSuggest = () => {
    let filteredEmoji: userData["emojis"];
    let filteredUnicodeEmoji: Array<{ name: string; value: string }> = [];

    if (text === "") {
      filteredEmoji = user.emojis.slice(0, suggestEmojiNum);
    } else {
      filteredUnicodeEmoji = unicodeEmojis
        .filter((emoji) => {
          if (emoji.name.indexOf(text) >= 0) return true;
        })
        .slice(0, suggestEmojiNum);
      filteredEmoji = user.emojis
        .filter((emoji) => {
          let flg = false;
          if (emoji.name.indexOf(text) >= 0) return true;
          for (let i = 0; i < emoji.aliases.length; i++) {
            if (emoji.aliases[i].indexOf(text) >= 0) {
              flg = true;
              break;
            }
          }
          return flg;
        })
        .slice(0, suggestEmojiNum);
    }
    suggestedText = [];

    filteredUnicodeEmoji.forEach((emoji) => {
      suggestedText.push({
        ...emoji,
        isUnicodeEmoji: true,
      });
    });

    filteredEmoji.forEach((emoji) => {
      suggestedText.push({
        name: emoji.name,
        url: emoji.url,
        isUnicodeEmoji: false,
      });
    });

    suggestedText = suggestedText;
  };

  const sendEmoji = async (isUnicodeEmoji?: string) => {
    let reactionText = `:${text}@.`;

    if (isUnicodeEmoji) reactionText = isUnicodeEmoji;

    try {
      await user.cli.request("notes/reactions/create", {
        noteId: noteId,
        reaction: reactionText,
      });
      dispatch("breakRequest", `:${text}@.:`);
    } catch (err) {
      console.error(err);
    }
  };

  const pushBtn = (index: number, isUnicodeEmoji: boolean) => {
    text = suggestedText[index].name;
    sendEmoji();
  };

  onMount(() => {
    emojiSuggest();
    inputElem.focus();
  });
</script>

<div class="card-actions">
  <input
    type="text"
    bind:this={inputElem}
    bind:value={text}
    placeholder="絵文字を検索..."
    class="w-full input input-bordered input-sm"
    on:keydown={(e) => {
      if (e.code === "Enter") sendEmoji();
    }}
    on:input={emojiSuggest}
  />
  <div class="flex flex-nowrap gap-1">
    {#each suggestedText as emoji, index (emoji.name)}
      {#if !emoji.isUnicodeEmoji}
        <button
          class="btn btn-xs btn-outline"
          on:click={() => pushBtn(index, emoji.isUnicodeEmoji)}
          on:keypress={() => pushBtn(index, emoji.isUnicodeEmoji)}
          title={emoji.name}
        >
          <img class="h-4" src={emoji.url} alt={emoji.name} />
        </button>
      {:else}
        <button
          class="btn btn-xs btn-outline"
          on:click={() => sendEmoji(emoji.value)}
          on:keypress={() => sendEmoji(emoji.value)}
        >
          {emoji.value}
        </button>
      {/if}
    {/each}
  </div>
</div>
