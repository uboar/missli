<script lang="ts">
  import type { Note } from "@misskey-js/entities";
  import type { TimelineOptions } from "@/types/type";

  export let files: Note["files"];
  export let option: TimelineOptions["noteOption"];

  $: file = files[index];
  let index = 0;
  let mediaHide = option.mediaHide;

  const nextFile = () => {
    if (index >= files.length - 1) index = 0;
    else index++;
  };
  const previousFile = () => {
    if (index === 0) index = files.length - 1;
    else index--;
  };
</script>

<!-- メディア内容 -->
<div class="my-2 w-full rounded-lg bg-base-300">
  {#if files.length > 0}
    {#if !mediaHide}
      <div class="relative flex w-full justify-center">
        {#if file.type.indexOf("image") >= 0}
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            class="relative grid content-center"
          >
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              class="media object-contain {file.isSensitive && !option.nsfwShow
                ? 'blur-lg'
                : ''}"
              style="--mediaSize: {option.mediaSize + 'px'}"
            />
          </a>
        {:else if file.type.indexOf("video") >= 0}
          <video
            controls
            class={file.isSensitive && !option.nsfwShow ? "hidden" : ""}
          >
            <source src={file.url} />
            <track kind="captions" />
          </video>
        {:else if file.type.indexOf("audio") >= 0}
          <audio controls src={file.url} />
        {:else}
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            class="alert link-hover link w-full"
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="h-6 w-6"
                ><path
                  d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18M12,19L8,15H10.5V12H13.5V15H16L12,19Z"
                /></svg
              >
              <span>{file.name}</span>
            </div>
          </a>
        {/if}
        {#if file.isSensitive && !option.nsfwShow}
          <div
            class="absolute top-0 z-20 grid h-full w-full content-center justify-center"
          >
            <button
              class="btn-warning btn w-32 shadow-md"
              on:click={() => (file.isSensitive = false)}>メディアを見る</button
            >
          </div>
        {/if}
      </div>
    {:else}
      <button
        class="btn-info btn-block btn-sm btn my-1"
        on:click={() => (mediaHide = false)}>メディアを見る</button
      >
    {/if}
  {/if}
</div>
{#if files.length > 1}
  <div class="alert z-10">
    <div class="-my-2 flex w-full">
      <button class="btn-sm btn w-1/3" on:click={previousFile}>❮</button>
      <div class="w-1/3 text-center">
        {index + 1} / {files.length}
      </div>
      <button class="btn-sm btn w-1/3" on:click={nextFile}>❯</button>
    </div>
  </div>
{/if}

<style>
  :global(.media) {
    height: var(--mediaSize);
  }
</style>
