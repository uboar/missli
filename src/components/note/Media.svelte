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
      {/if}
    {/each}
  {/if}
</div>
