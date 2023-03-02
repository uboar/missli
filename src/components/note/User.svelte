<script lang="ts">
  import type { User } from "misskey-js/built/entities";

  export let user: User;
  export let hostUrl: string;
  export let isRenote: boolean = false;

  const useridStr = `@${user.username}${user.host ? `@${user.host}` : ""}`;
</script>

<a
  class="card-title link link-hover rounded hover:bg-base-100"
  href={`https://${hostUrl}/${useridStr}`}
  target="_blank"
  rel="noreferrer"
>
  {#if isRenote}
    <div class="text-accent text-xs -mb-2">
      🔁{user.name}がRenote
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
