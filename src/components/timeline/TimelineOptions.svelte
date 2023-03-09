<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { users, type TimelineOptions } from "../../lib/userdata";
  import ReactionDeck from "../note/ReactionDeck.svelte";

  export let options: TimelineOptions;
  const dispatch = createEventDispatcher();

  let showReactionDeck = false;
  let showDelete = false;

  const addReaction = (e: CustomEvent) => {
    options.reactionDeck = [...options.reactionDeck, e.detail];
  };

  const deleteReaction = (index: number) => {
    options.reactionDeck.splice(index, 1);
    options.reactionDeck = options.reactionDeck;
  };

  const deleteRequest = (e: Event) => {
    dispatch("deleteRequest");
  };

  const getNotesRequest = (e: Event) => {
    dispatch("getNoteRequest");
  };

  const timelineSizeEnum = [
    {
      name: "ちび",
      value: "12rem",
    },
    {
      name: "小",
      value: "24rem",
    },
    {
      name: "中",
      value: "36rem",
    },
    {
      name: "大",
      value: "48rem",
    },
    {
      name: "画面幅",
      value: "100vw",
    },
  ];

  let importValue: HTMLTextAreaElement;
  const importReactionDeck = () => {
    try {
      options.reactionDeck = JSON.parse(importValue.value);
    } catch (err) {
      console.error(err);
    }
  };

  const swapTimelineLeft = () => {
    dispatch("swapLeft");
  };

  const swapTimelineRight = () => {
    dispatch("swapRight");
  };
</script>

<div class="relative w-full p-2 mb-16">
  <h3 class="border-b">タイムライン設定</h3>
  {#if !showReactionDeck}
    <div class="form-control mt-4">
      <span class="label-text">タイムラインの名前</span>
      <input
        type="text"
        class="input input-sm"
        bind:value={options.channelName}
      />
      <div class="flex flex-row my-8">
        <span class="label-text mr-8">タイムラインの色</span>
        <input type="color" bind:value={options.color} />
      </div>
      <span class="label-text">タイムラインの大きさ</span>
      <div class="btn-group">
        {#each timelineSizeEnum as timelineSize (timelineSize.name)}
          <button
            class="btn btn-outline btn-sm w-1/5"
            on:click={() => {
              options.width = timelineSize.value;
            }}>{timelineSize.name}</button
          >
        {/each}
      </div>
      <span class="label-text">ノートの表示件数</span>
      <input
        type="number"
        class="input input-sm"
        bind:value={options.showNoteNum}
      />
      <span class="label-text">ノートのバッファ件数</span>
      <input
        type="number"
        class="input input-sm"
        bind:value={options.bufferNoteNum}
      />
      <label class="label cursor-pointer">
        <span class="label-text">CWを自動展開する</span>
        <input type="checkbox" bind:checked={options.noteOption.cwShow} class="checkbox" />
      </label>
      <label class="label cursor-pointer">
        <span class="label-text">NSFWメディアを無視する</span>
        <input type="checkbox" bind:checked={options.noteOption.nsfwShow} class="checkbox" />
      </label>
      <label class="label cursor-pointer">
        <span class="label-text">高さの大きいノートを自動で畳む</span>
        <input type="checkbox" bind:checked={options.noteOption.noteCollapse} class="checkbox" />
      </label>
      <span class="label-text">ノートの最大高さ</span>
      <input
        type="number"
        class="input input-sm"
        bind:value={options.noteOption.noteHeight}
      />
      <div class="btn-group mt-4">
        <button
          class="btn btn-outline w-1/2 btn-secondary"
          on:click={swapTimelineLeft}
        >
          左と入れ替え
        </button>
        <button
          class="btn btn-outline w-1/2 btn-secondary"
          on:click={swapTimelineRight}
        >
          右と入れ替え
        </button>
      </div>

      <button
        class="btn btn-primary btn-block mt-4"
        on:click={() => (showReactionDeck = !showReactionDeck)}
        >リアクションデッキを編集</button
      >

      {#if import.meta.env.MODE === "development"}
        <button
          class="btn btn-outline btn-secondary mt-4 btn-sm"
          on:click={getNotesRequest}>ノートのバッファをコンソールに出力</button
        >
      {/if}
      {#if showDelete}
        <button
          class="btn btn-primary btn-outline btn-block mt-16"
          on:click={() => {
            showDelete = false;
          }}>やめる</button
        >
        <button
          class="btn btn-error btn-block mt-2 mb-16"
          on:click={deleteRequest}>削除する</button
        >{:else}
        <button
          class="btn btn-error btn-outline btn-block mt-16 mb-16"
          on:click={() => {
            showDelete = true;
          }}>タイムラインを削除する</button
        >
      {/if}
    </div>
  {:else}
    <div class="form-control mt-4">
      <ReactionDeck
        user={$users[options.userDataIndex]}
        on:breakRequest={addReaction}
        customReactionDeck={options.reactionDeck}
      />

      {#each options.reactionDeck as reaction, index}
        <div class="input-group mt-1">
          <input
            type="text"
            class="input input-sm input-bordered w-full"
            bind:value={reaction}
          />
          <button
            class="btn btn-square btn-error btn-sm fill-error-content"
            on:click={() => deleteReaction(index)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="h-4 w-4"
              ><path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              /></svg
            >
          </button>
        </div>
      {/each}
      <span class="label-text">テキストからインポート</span>
      <textarea
        class="textarea textarea-bordered"
        value={JSON.stringify(options.reactionDeck)}
        bind:this={importValue}
      />
      <button
        class="btn btn-info btn-outline btn-sm btn-block"
        on:click={importReactionDeck}>インポート</button
      >
      <button
        class="btn btn-primay btn-primary btn-block mt-16 mb-24"
        on:click={() => (showReactionDeck = !showReactionDeck)}
      >
        戻る
      </button>
    </div>
  {/if}
</div>
