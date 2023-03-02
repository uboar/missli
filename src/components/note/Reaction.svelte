<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { userData } from "../../lib/userdata";
  
  export let name: string;
  export let num: number;
  export let reactionEmojis: [key: string];
  export let user: userData;
  export let color = "accent";
  export let noteId = "";
  export let isReacted = true;

  const dispatch = createEventDispatcher();

  $: localEmojiSearch;

  const localEmojiSearch = (emojiName: string): string => {
    try {
      return user.emojis.find((v) => v.name === emojiName).url;
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
          reaction: name
        });
        isReacted = true;
      } else {
        await user.cli.request("notes/reactions/delete", {
          noteId: noteId
        })
        isReacted = false;
        num--;
        if(num == 0) dispatch('destroy');
      }
    } catch (err) {
      console.error(err);
      isReacted = false;
    }
  };
</script>

{#if name.indexOf("@.") >= 0}
  <button class="badge {!isReacted ? 'badge-outline' : ''} badge-{color} h-5" 
  on:click={clickReaction}>
    <img
      src={localEmojiSearch(name.replace(/\:|@./gm, ""))}
      class="h-4"
      alt={name}
    />
    {num}
  </button>
{:else if name.indexOf("@") >= 0}
  <span
    class="badge badge-outline h-5"
  >
    <img
      src={reactionEmojis[name.replace(/\:/gm, "")]}
      class="h-4"
      alt={name}
    />
    {num}
  </span>
{:else}
  <button
    class="badge {!isReacted ? 'badge-outline' : ''} badge-{color} h-5"
    on:click={clickReaction}
  >
    <span class="h-4">{name}</span>
    {num}
  </button>
{/if}
