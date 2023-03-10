<script lang="ts">
  import type { Notification } from "misskey-js/built/entities";
  import { onMount } from "svelte";
  import type { UserData, users } from "../../lib/userdata";
  import EmojiParser from "../EmojiParser.svelte";
  import MfmLite from "../MfmLite.svelte";

  export let user: UserData | null = null;

  $: noteText = (notify: Notification) => {
    if (notify.note.text === null && notify.type === "renote") {
      return notify.note.renote.text;
    } else if (notify.note.text === null) {
      return "テキスト無し";
    } else {
      return notify.note.text;
    }
  };

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
        return `${
          notify.user.name ? notify.user.name : notify.user.username
        }さんにリアクションされました`;
      case "quote":
        return `${
          notify.user.name ? notify.user.name : notify.user.username
        }さんに引用されました`;
      case "reply":
        return `${
          notify.user.name ? notify.user.name : notify.user.username
        }さんから返信されました`;
      case "pollEnded":
        return `投票が終了しました`;
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
        return `${origin}/@${notify.user.username}${
          notify.user.host ? "@" + notify.user.host : ""
        }`;
      case "reply":
        return `${origin}/@${notify.user.username}${
          notify.user.host ? "@" + notify.user.host : ""
        }`;
      case "renote":
        return `${origin}/@${notify.user.username}${
          notify.user.host ? "@" + notify.user.host : ""
        }`;
      case "reaction":
        return `${origin}/@${notify.user.username}${
          notify.user.host ? "@" + notify.user.host : ""
        }`;
      case "quote":
        return `${origin}/@${notify.user.username}${
          notify.user.host ? "@" + notify.user.host : ""
        }`;
      case "pollEnded":
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
          <a href={getNotifyLink(notify)} target="_blank" rel="noreferrer">
            <div class="flex flex-col">
              <div class="flex link link-hover gap-2">
                {#if notify.type === "reaction"}
                  <EmojiParser
                    localEmojis={(user.emojis.length === 0) ? notify.note.emojis : user.emojis}
                    text={notify.reaction}
                    remoteEmojis={notify.note.reactionEmojis}
                  />
                {/if}
                {#if new RegExp("reaction|renote|reply|quote|mention").test(notify.type)}
                  <MfmLite
                    text={getNotifyTypeName(notify)}
                    localEmojis={(user.emojis.length === 0) ? notify.note.emojis : user.emojis}
                    remoteEmojis={notify.user.emojis}
                    emojiHeight="h-4"
                    hostUrl={user.hostUrl}
                  />
                {:else}
                  {getNotifyTypeName(notify)}
                {/if}
              </div>
              {#if new RegExp("reaction|renote|reply|mention|quote|pollEnded").test(notify.type)}
                <a
                  href={`https://${user.hostUrl}/notes/${notify.note.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div
                    class="card card-compact bg-base-100 card-bordered link link-hover border-base-content"
                  >
                    <div class="card-body max-w-full -my-2">
                      {noteText(notify)}
                    </div>
                  </div>
                </a>
              {/if}
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>
