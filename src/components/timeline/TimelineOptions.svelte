<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { timelineOptions } from "../../lib/userdata";

  export let options: timelineOptions;
  const dispatch = createEventDispatcher();

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
</script>

<div class="relative w-full p-2 mb-16">
  <h3 class="border-b">タイムライン設定</h3>
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

    <button />

    {#if import.meta.env.MODE === "development"}
      <button
        class="btn btn-outline btn-secondary mt-4 btn-sm"
        on:click={getNotesRequest}
        on:keypress={deleteRequest}>ノートのバッファをコンソールに出力</button
      >
    {/if}

    <button
      class="btn btn-error btn-block mt-4"
      on:click={deleteRequest}
      on:keypress={deleteRequest}>タイムラインを削除</button
    >
  </div>
</div>
