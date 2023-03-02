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
      {/if}
    {/each}
  {/if}
</div>
