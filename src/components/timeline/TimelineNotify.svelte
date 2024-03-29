<script lang="ts">
  import type { Notification } from "@misskey-js/entities";
  import { onMount } from "svelte";
  import { convertNotify, moment } from "@/lib/userdata";
  import type { UserData } from "@/types/type";
  import EmojiParser from "@/components/EmojiParser.svelte";
  import MfmLite from "@/components/MfmLite.svelte";
  import uniqBy from "lodash/uniqBy";

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

  const moreNotify = async () => {
    const res = await user.cli.request("i/notifications", {
      untilId: user.notifyBuffer[user.notifyBuffer.length - 1].id,
    });

    //Calckey
    res.forEach((elem, index) => {
      elem = convertNotify(elem);
    });

    user.notifyBuffer = [...user.notifyBuffer, ...res];
    user.notifyBuffer = uniqBy(user.notifyBuffer, "id");
  };
</script>

<div class="card card-compact">
  <div class="card-body h-96 overflow-y-scroll">
    <ul class="menu items-center">
      {#each user.notifyBuffer as notify (notify.id)}
        <li class="w-full">
          <a
            href={getNotifyLink(notify)}
            class="flex w-full flex-col justify-items-stretch"
            target="_blank"
            rel="noreferrer"
          >
            <!-- TODO:通知の幅をレスポンシブにする -->
            <div class="link-hover link flex w-full gap-2 justify-self-start">
              {#if notify.type === "reaction"}
                <EmojiParser
                  localEmojis={user.emojis.length === 0
                    ? notify.note.emojis
                    : user.emojis}
                  text={notify.reaction}
                  remoteEmojis={notify.note.reactionEmojis}
                />
              {/if}
              {#if new RegExp("reaction|renote|reply|quote|mention").test(notify.type)}
                <MfmLite
                  text={getNotifyTypeName(notify)}
                  localEmojis={user.emojis.length === 0
                    ? notify.note.emojis
                    : user.emojis}
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
                class="link-hover card-bordered card link card-compact w-full border-base-content bg-base-100"
                href={`https://${user.hostUrl}/notes/${notify.note.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <div class="card-body -my-2">
                  {noteText(notify)}
                </div>
              </a>
            {/if}
            <div class="-mb-2 w-full text-end text-sm">
              {moment(notify.createdAt).fromNow()}
            </div>
          </a>
        </li>
      {/each}
      <button class="btn-primary btn-block btn-sm btn" on:click={moreNotify}>
        もっと表示
      </button>
    </ul>
  </div>
</div>
