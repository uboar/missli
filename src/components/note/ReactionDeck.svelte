<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { userData } from "../../lib/userdata";

  const suggestEmojiNum = 20;
  let inputElem: HTMLInputElement;

  $: suggestedText = [] as Array<{ name: string; url: string }>;

  export let user: userData;
  export let noteId: string;

  let text = "";
  const dispatch = createEventDispatcher();

  const emojiSuggest = () => {
    let filteredEmoji: userData["emojis"];
    if (text === "") {
      filteredEmoji = user.emojis.slice(0, suggestEmojiNum);
    } else {
      filteredEmoji = user.emojis
        .filter((emoji) => {
          if (emoji.name.indexOf(text) >= 0) return true;
          if (emoji.aliases.indexOf(text) >= 0) return true;
          return false;
        })
        .slice(0, suggestEmojiNum);
    }
    suggestedText = [];
    filteredEmoji.forEach((emoji) => {
      suggestedText.push({ name: emoji.name, url: emoji.url });
    });
    suggestedText = suggestedText;
  };

  const sendEmoji = async () => {
    try {
      await user.cli.request("notes/reactions/create", {
        noteId: noteId,
        reaction: `:${text}@.:`,
      });
      dispatch("breakRequest", `:${text}@.:` );
    } catch (err) {
      console.error(err);
    }
  };

  const pushBtn = (index: number) => {
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
      <button
        class="btn btn-xs btn-outline"
        on:click={() => pushBtn(index)}
        on:keypress={() => pushBtn(index)}
      >
        <img class="h-4" src={emoji.url} alt={emoji.name} />
      </button>
    {/each}
  </div>
</div>
