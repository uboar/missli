<script lang="ts">
  import type { Note } from "misskey-js/built/entities";
  import moment from "moment";
  import "moment/locale/ja";
  import type { userData } from "../lib/userdata";
  import Mfm from "./Mfm.svelte";
  export let user: userData;
  export let note: Note;

  moment.locale("ja");

  $: localEmojiSearch;

  const localEmojiSearch = (emojiName: string): string => {
    try {
      return user.emojis.find((v) => v.name === emojiName).url;
    } catch (err) {
      console.error(err);
      return "エラー";
    }
  };

  $: useridStr = `@${note.user.username}${
    note.user.host ? `@${note.user.host}` : ""
  }`;
  $: renoteUseridStr = note.renote
    ? `@${note.renote.user.username}${
        note.renote.user.host ? `@${note.renote.user.host}` : ""
      }`
    : "";
</script>

<div class="card card-bordered bg-base-100 w-full my-2 shadow-sm hover:bg-base-200">
  <div class="card-body -my-6 -mx-4">
    <div class="card-title overflow-hidden">
      <!-- ユーザー名とアイコン -->
      <div class="avatar">
        <div class="w-8 rounded-full">
          <img src={note.user.avatarUrl} alt={note.user.username} />
        </div>
      </div>
      <div class="flex flex-col">
        <div class="text-sm text-base-content truncate">
          {#if note.user.name === null}
            {note.user.username}
          {:else}
            {note.user.name}
          {/if}
        </div>
        <a
          class="text-xs overflow-hidden text-ellipsis link link-hover"
          href={`https://${user.hostUrl}/${useridStr}`}
          target="_blank"
          rel="noreferrer"
        >
          {useridStr}
        </a>
      </div>
    </div>
    {#if note.text}
      <p class="text-ellipsis overflow-hidden">
        <Mfm
          text={note.text}
          hostUrl={user.hostUrl}
          localEmojis={user.emojis}
          remoteEmojis={note.emojis}
        />
      </p>
    {/if}

    <!-- メディア内容 -->
    <div class="carousel justify-center">
      {#if note.files.length > 0}
        {#each note.files as file (file.id)}
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
    <!-- リノート内容 -->
    {#if note.renote}
      <div class="card card-bordered border-accent rounded p-1">
        <div class="card-title overflow-hidden">
          <div class="avatar">
            <div class="w-8 rounded-full">
              <img
                src={note.renote.user.avatarUrl}
                alt={note.renote.user.username}
              />
            </div>
          </div>
          <div class="flex flex-col">
            <div class="text-sm text-accent truncate">
              {note.renote.user.name}
            </div>
            <a
              class="text-xs overflow-hidden text-ellipsis link link-accent link-hover"
              href={`https://${user.hostUrl}/${renoteUseridStr}`}
              target="_blank"
              rel="noreferrer"
            >
              {renoteUseridStr}
            </a>
          </div>
        </div>
        {#if note.renote.text}
          <p class="text-ellipsis overflow-hidden">
            <Mfm
              text={note.renote.text}
              hostUrl={user.hostUrl}
              localEmojis={user.emojis}
              remoteEmojis={note.renote.emojis}
            />
          </p>
        {/if}

        <!-- メディア内容 -->
        <div class="carousel justify-center">
          {#if note.renote.files.length > 0}
            {#each note.renote.files as file (file.id)}
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

        <!-- リアクション -->
        <div class="flex flex-row flex-wrap">
          {#each Object.entries(note.renote.reactions) as [name, num]}
            <span class="badge badge-outline badge-accent h-5">
              {#if name.indexOf("@.") >= 0}
                <img
                  src={localEmojiSearch(name.replace(/\:|@./gm, ""))}
                  class="h-4"
                  alt={name}
                />
              {:else if name.indexOf("@") >= 0}
                <img
                  src={note.renote.reactionEmojis[name.replace(/\:/gm, "")]}
                  class="h-4"
                  alt={name}
                />
              {:else}
                <span class="h-4">{name}</span>
              {/if}
              {num}
            </span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- リアクション -->
    {#if note.reactions}
      <div>
        {#each Object.entries(note.reactions) as [name, num]}
          <span class="badge badge-outline h-5">
            {#if name.indexOf("@.") >= 0}
              <img
                src={localEmojiSearch(name.replace(/\:|@./gm, ""))}
                class="h-4"
                alt={name}
              />
            {:else if name.indexOf("@") >= 0}
              <img
                src={note.reactionEmojis[name.replace(/\:/gm, "")]}
                class="h-4"
                alt="name"
              />
            {:else}
              {name}
            {/if}
            {num}
          </span>
        {/each}
      </div>
    {/if}
    <a
      class="text-right text-xs link"
      href={`https://${user.hostUrl}/notes/${note.id}`}
      target="_blank"
      rel="noreferrer"
    >
      {moment(note.createdAt).fromNow()}
    </a>
  </div>
</div>
