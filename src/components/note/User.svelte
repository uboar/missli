<script lang="ts">
  import type { User } from "misskey-js/built/entities";
  import type { userData } from "../../lib/userdata";
  import MfmLite from "../MfmLite.svelte";

  export let user: User;
  export let hostUrl: string;
  export let isRenote: boolean = false;
  export let localEmojis: userData["emojis"] = [];

  const useridStr = `@${user.username}${user.host ? `@${user.host}` : ""}`;
</script>

<a
  class="card-title link link-hover rounded-full {isRenote
    ? 'link-accent'
    : 'hover:bg-base-300'} w-fit max-w-full pr-3"
  href={`https://${hostUrl}/${useridStr}`}
  target="_blank"
  rel="noreferrer"
>
  {#if isRenote}
    <div class="text-xs -mb-2 pr-3">
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
          <MfmLite
            text={user.name}
            {localEmojis}
            remoteEmojis={user.emojis}
            emojiHeight="h-4"
            {hostUrl}
          />
        {/if}
      </div>
      <div class="text-xs truncate">
        {useridStr}
      </div>
    </div>
  {/if}
</a>
