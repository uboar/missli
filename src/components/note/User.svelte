<script lang="ts">
  import type { User } from "@misskey-js/entities";
  import type { UserData } from "@/types/type";
  import MfmLite from "@/components/MfmLite.svelte";

  export let user: User;
  export let hostUrl: string;
  export let isRenote: boolean = false;
  export let localEmojis: UserData["emojis"] = [];

  const useridStr = `@${user.username}${user.host ? `@${user.host}` : ""}`;
</script>

<a
  class="link-hover link card-title rounded-full {isRenote
    ? 'link-accent'
    : 'hover:bg-base-300'} w-fit max-w-full pr-3"
  href={`https://${hostUrl}/${useridStr}`}
  target="_blank"
  rel="noreferrer"
>
  {#if isRenote}
    <div class="-mb-2 pr-3 text-xs">
      {#if user.name === null}
        🔁{user.username}がリノート
      {:else}
        <MfmLite
          text={"🔁" + user.name + "がリノート"}
          localEmojis={localEmojis.length === 0 ? user.emojis : localEmojis}
          remoteEmojis={user.emojis}
          emojiHeight="h-4"
          {hostUrl}
        />
      {/if}
    </div>
  {:else}
    <div class="avatar">
      <div class="w-8 rounded-full">
        <img src={user.avatarUrl} alt={user.username} />
      </div>
    </div>
    <div class="w-full overflow-clip">
      <div class="-mb-1 truncate text-sm">
        {#if user.name === null}
          {user.username}
        {:else}
          <MfmLite
            text={user.name}
            localEmojis={localEmojis.length === 0 ? user.emojis : localEmojis}
            remoteEmojis={user.emojis}
            emojiHeight="h-4"
            {hostUrl}
          />
        {/if}
      </div>
      <div class="truncate text-xs">
        {useridStr}
      </div>
    </div>
  {/if}
</a>
