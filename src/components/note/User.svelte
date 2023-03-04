<script lang="ts">
  import type { User } from "misskey-js/built/entities";

  export let user: User;
  export let hostUrl: string;
  export let isRenote: boolean = false;

  const useridStr = `@${user.username}${user.host ? `@${user.host}` : ""}`;
</script>

<a
  class="card-title link link-hover rounded-full hover:bg-base-300 -mb-1"
  href={`https://${hostUrl}/${useridStr}`}
  target="_blank"
  rel="noreferrer"
>
  {#if isRenote}
    <div class="text-accent text-xs">
      🔁{user.name === null ? user.username : user.name}がリノート
    </div>
  {:else}
    <div class="avatar">
      <div class="w-8 rounded-full">
        <img src={user.avatarUrl} alt={user.username} />
      </div>
    </div>
    <div class="w-full overflow-clip">
      <div class="text-sm truncate -mb-1">
        {#if user.name === null}
          {user.username}
        {:else}
          {user.name}
        {/if}
      </div>
      <div class="text-xs truncate">
        {useridStr}
      </div>
    </div>
  {/if}
</a>
