<script lang="ts">
  import type { DriveFile, Note } from "misskey-js/built/entities";
  import { onMount } from "svelte";

  export let files: Note["files"];

  $: file = files[index];
  let index = 0;

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
<div class="w-full">
  {#if files.length > 0}
    <div class="relative w-full flex justify-center max-h-64 min-h-16">
      {#if file.type.indexOf("image") >= 0}
        <a href={file.url} target="_blank" rel="noreferrer" class="relative">
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            class="object-contain rounded-lg max-h-64 {file.isSensitive ? 'blur-lg' : ''}"
          />
        </a>
      {:else if file.type.indexOf("video") >= 0}
        <video controls class={(file.isSensitive) ? "hidden" : ""}>
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
          class="alert w-full link link-hover"
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
      {#if file.isSensitive}
        <div
          class="absolute w-full h-full top-0 grid content-center justify-center z-20"
        >
          <button class="btn w-32 btn-warning shadow-md" on:click={() => file.isSensitive = false}>メディアを見る</button>
        </div>
      {/if}
      {#if files.length > 1}
        <div
          class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2"
        >
          <button
            class="btn btn-circle btn-sm opacity-70"
            on:click={previousFile}>❮</button
          >
          <button class="btn btn-circle btn-sm opacity-70" on:click={nextFile}
            >❯</button
          >
        </div>
      {/if}
    </div>
  {/if}
</div>
