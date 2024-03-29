<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { users } from "@/lib/userdata";
  import type { TimelineOptions } from "@/types/type";
  import ReactionDeck from "@/components/note/ReactionDeck.svelte";

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

<div class="relative mb-16 w-full p-2">
  <h3 class="border-b">タイムライン設定</h3>
  {#if !showReactionDeck}
    <div class="form-control mt-4">
      <span class="label-text">タイムラインの名前</span>
      <input
        type="text"
        class="input input-sm"
        bind:value={options.channelName}
      />
      <div class="my-8 flex flex-row">
        <span class="label-text mr-8">タイムラインの色</span>
        <input type="color" bind:value={options.color} />
      </div>
      <span class="label-text">タイムラインの大きさ</span>
      <div class="btn-group">
        {#each timelineSizeEnum as timelineSize (timelineSize.name)}
          <button
            class="btn-outline btn-sm btn w-1/5"
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
      <span class="label-text">リアクションの大きさ</span>
      <input
        type="number"
        class="input input-sm"
        bind:value={options.noteOption.reactionSize}
      />
      <span class="label-text">メディアの高さ</span>
      <input
        type="number"
        class="input input-sm"
        bind:value={options.noteOption.mediaSize}
      />
      <label class="label cursor-pointer">
        <span class="label-text"
          >タイムラインをクリックした際に通知・ノート表示を畳む</span
        >
        <input
          type="checkbox"
          bind:checked={options.autoCollapse}
          class="checkbox"
        />
      </label>
      <label class="label cursor-pointer">
        <span class="label-text">メディアを表示しない</span>
        <input
          type="checkbox"
          bind:checked={options.noteOption.mediaHide}
          class="checkbox"
        />
      </label>
      <label class="label cursor-pointer">
        <span class="label-text">リアクションを表示しない</span>
        <input
          type="checkbox"
          bind:checked={options.noteOption.reactionHide}
          class="checkbox"
        />
      </label>
      <label class="label cursor-pointer">
        <span class="label-text">CWを自動展開する</span>
        <input
          type="checkbox"
          bind:checked={options.noteOption.cwShow}
          class="checkbox"
        />
      </label>
      <label class="label cursor-pointer">
        <span class="label-text">NSFWメディアを無視する</span>
        <input
          type="checkbox"
          bind:checked={options.noteOption.nsfwShow}
          class="checkbox"
        />
      </label>
      <label class="label cursor-pointer">
        <span class="label-text">高さの大きいノートを自動で畳む</span>
        <input
          type="checkbox"
          bind:checked={options.noteOption.noteCollapse}
          class="checkbox"
        />
      </label>
      <label class="label cursor-pointer">
        <span class="label-text">連続ノートを制限する(Misskey.io向け)</span>
        <input
          type="checkbox"
          bind:checked={options.lowRate}
          class="checkbox"
        />
      </label>
      <span class="label-text">ノートの最大高さ</span>
      <input
        type="number"
        class="input input-sm"
        bind:value={options.noteOption.noteHeight}
      />
      <div class="btn-group mt-4">
        <button
          class="btn-secondary btn-outline btn w-1/2"
          on:click={swapTimelineLeft}
        >
          左と入れ替え
        </button>
        <button
          class="btn-secondary btn-outline btn w-1/2"
          on:click={swapTimelineRight}
        >
          右と入れ替え
        </button>
      </div>

      <button
        class="btn-primary btn-block btn mt-4"
        on:click={() => (showReactionDeck = !showReactionDeck)}
        >リアクションデッキを編集</button
      >

      {#if import.meta.env.MODE === "development"}
        <button
          class="btn-secondary btn-outline btn-sm btn mt-4"
          on:click={getNotesRequest}>ノートのバッファをコンソールに出力</button
        >
      {/if}
      {#if showDelete}
        <button
          class="btn-primary btn-outline btn-block btn mt-16"
          on:click={() => {
            showDelete = false;
          }}>やめる</button
        >
        <button
          class="btn-error btn-block btn mb-16 mt-2"
          on:click={deleteRequest}>削除する</button
        >{:else}
        <button
          class="btn-outline btn-error btn-block btn mb-16 mt-16"
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
        size={options.noteOption.reactionSize}
        on:breakRequest={addReaction}
        customReactionDeck={options.reactionDeck}
      />

      {#each options.reactionDeck as reaction, index}
        <div class="input-group mt-1">
          <input
            type="text"
            class="input-bordered input input-sm w-full"
            bind:value={reaction}
          />
          <button
            class="btn-error btn-square btn-sm btn fill-error-content"
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
        class="textarea-bordered textarea"
        value={JSON.stringify(options.reactionDeck)}
        bind:this={importValue}
      />
      <button
        class="btn-info btn-outline btn-block btn-sm btn"
        on:click={importReactionDeck}>インポート</button
      >
      <button
        class="btn-primay btn-primary btn-block btn mb-24 mt-16"
        on:click={() => (showReactionDeck = !showReactionDeck)}
      >
        戻る
      </button>
    </div>
  {/if}
</div>
