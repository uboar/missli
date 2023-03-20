<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { UserData } from "../../lib/userdata";
  import unicodeEmojis from "../../assets/unicodeEmojis.json";
  import twemoji from "twemoji";

  const suggestEmojiNum = 20;
  let inputElem: HTMLInputElement;

  $: suggestedText = [] as Array<{
    name: string;
    url?: string;
    value?: string;
    isUnicodeEmoji?: boolean;
  }>;

  $: localEmojiSearch = (emojiName: string): string => {
    try {
      const emojiReplaced = emojiName.replace(/\:|@./gm, "");

      return user.emojis.find((v) => v.name === emojiReplaced).url;
    } catch (err) {
      console.error(err);
      return "エラー";
    }
  };

  export let user: UserData;
  export let noteId: string = "";
  export let customReactionDeck: Array<string> = [];

  let text = "";
  const dispatch = createEventDispatcher();

  const emojiSuggest = () => {
    let filteredEmoji: UserData["emojis"];
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

    filteredEmoji.forEach((emoji) => {
      suggestedText.push({
        name: emoji.name,
        url: emoji.url,
        isUnicodeEmoji: false,
      });
    });

    filteredUnicodeEmoji.forEach((emoji) => {
      suggestedText.push({
        ...emoji,
        isUnicodeEmoji: true,
      });
    });

    suggestedText = suggestedText;
  };

  const sendEmoji = async (isUnicodeEmoji?: string) => {
    let reactionText = "";

    if (isUnicodeEmoji == null) reactionText = `:${text}@.:`;
    else reactionText = isUnicodeEmoji;

    await directSendEmoji(reactionText);
  };

  const directSendEmoji = async (reaction: string) => {
    try {
      if (noteId !== "") {
        await user.cli.request("notes/reactions/create", {
          noteId: noteId,
          reaction: reaction,
        });
      }
      text = "";
      dispatch("breakRequest", reaction);
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
  <div class="flex flex-nowrap gap-1 w-full">
    {#each suggestedText as emoji, index}
      {#if !emoji.isUnicodeEmoji}
        <button
          class="btn btn-xs btn-outline"
          on:click={() => pushBtn(index)}
          title={emoji.name}
        >
          <img class="h-4" src={emoji.url} alt={emoji.name} />
        </button>
      {:else}
        <button
          class="btn btn-xs btn-outline"
          on:click={() => sendEmoji(emoji.value)}
        >
          {@html twemoji.parse(emoji.value, {
            className: "object-scale-down h-4",
          })}
        </button>
      {/if}
    {/each}
  </div>
  <div class="flex flex-wrap gap-1">
    {#each customReactionDeck as reaction}
      {#if reaction.indexOf("@.") >= 0}
        <button
          class="btn btn-xs btn-outline btn-success"
          on:click={() => directSendEmoji(reaction)}
          title={reaction.replace(/\:|@./gm, "")}
        >
          <img
            class="h-4"
            src={localEmojiSearch(reaction)}
            alt={reaction.replace(/\:|@./gm, "")}
          />
        </button>
      {:else}
        <button
          class="btn btn-xs btn-outline btn-success"
          on:click={() => sendEmoji(reaction)}
        >
          {reaction}
        </button>
      {/if}
    {/each}
  </div>
</div>
