<script lang="ts">
  import type { Notification } from "misskey-js/built/entities";
  import { onMount } from "svelte";
  import type { userData } from "../../lib/userdata";
  import EmojiParser from "../EmojiParser.svelte";

  export let user: userData | null = null;

  onMount(() => {
    if (!user) return;
    user.notifyUnOpen = false;
  });

  $: getNotifyTypeName = (notify: Notification) => {
    switch (notify.type) {
      case "achievementEarned":
        return "実績を獲得しました";
      case "followRequestAccepted":
        return `${
          notify.user.name ? notify.user.name : notify.user.username
        }さんへのフォローリクエストが承認されました`;
      case "follow":
        return `${
          notify.user.name ? notify.user.name : notify.user.username
        }さんにフォローされました`;
      case "receiveFollowRequest":
        return `${
          notify.user.name ? notify.user.name : notify.user.username
        }さんからのフォローリクエストを受信しました`;
      case "followed":
        return `${
          notify.user.name ? notify.user.name : notify.user.username
        }さんをフォローしました`;
      case "unfollow":
        return `${
          notify.user.name ? notify.user.name : notify.user.username
        }さんをフォロー解除しました`;
      case "messagingMessage":
        return "メッセージを受信しました";
      case "mention":
        return `${
          notify.user.name ? notify.user.name : notify.user.username
        }さんにメンションされました`;
      case "renote":
        return `${
          notify.user.name ? notify.user.name : notify.user.username
        }さんにリノートされました`;
      case "reaction":
        return "リアクションされました";
      default:
        return notify.type;
    }
  };
  $: getNotifyLink = (notify: Notification) => {
    const origin = `https://${user.hostUrl}`;

    switch (notify.type) {
      case "achievementEarned":
        return `${origin}/my/achievements`;
      case "followRequestAccepted":
        return `${origin}/@${notify.user.username}${
          notify.user.host ? "@" + notify.user.host : ""
        }`;
      case "follow":
        return `${origin}/@${notify.user.username}${
          notify.user.host ? "@" + notify.user.host : ""
        }`;
      case "receiveFollowRequest":
        return `${origin}/@${notify.user.username}${
          notify.user.host ? "@" + notify.user.host : ""
        }`;
      case "followed":
        return `${origin}/@${notify.user.username}${
          notify.user.host ? "@" + notify.user.host : ""
        }`;
      case "unfollow":
        return `${origin}/@${notify.user.username}${
          notify.user.host ? "@" + notify.user.host : ""
        }`;
      case "messagingMessage":
        return `${origin}/my/notifications`;
      case "mention":
        return `${origin}/notes/${notify.note.id}`;
      case "renote":
        return `${origin}/notes/${notify.note.id}`;
      case "reaction":
        return `${origin}/notes/${notify.note.id}`;
      default:
        return `${origin}/my/notifications`;
    }
  };
</script>

<div class="card card-compact">
  <div class="card-body h-96 overflow-y-scroll">
    <ul class="menu bg-base-100">
      {#each user.notifyBuffer as notify (notify.id)}
        <li>
          <a
            href={getNotifyLink(notify)}
            target="_blank"
            rel="noreferrer"
          >
            {#if notify.type === "reaction"}
              <EmojiParser
                localEmojis={user.emojis}
                text={notify.reaction}
                remoteEmojis={notify.note.reactionEmojis}
              />
            {/if}
            {getNotifyTypeName(notify)}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>
