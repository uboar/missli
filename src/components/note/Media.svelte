<script lang="ts">
  import type { Note } from "misskey-js/built/entities";

  export let files: Note["files"];
</script>

<!-- メディア内容 -->
<div class="carousel justify-center">
  {#if files.length > 0}
    {#each files as file (file.id)}
      {#if file.type.indexOf("image") >= 0}
        <a
          class="carousel-item rounded-lg my-2"
          href={file.url}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            class="rounded-lg {file.isSensitive ? 'blur' : ''}"
          />
        </a>
      {:else if file.type.indexOf("video") >= 0}
        <video controls>
          <source src={file.url} />
          <track kind="captions" />
        </video>
      {:else if file.type.indexOf("audio") >= 0}
        <audio controls src={file.url} />
      {:else}
        <a href={file.url} class="alert w-full">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="h-6 w-6"
              ><path
                d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18M12,19L8,15H10.5V12H13.5V15H16L12,19Z"
              /></svg
            >
            <span class="link link-hover">{file.name}</span>
          </div>
        </a>
      {/if}
    {/each}
  {/if}
</div>
