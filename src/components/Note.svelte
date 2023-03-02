<script lang="ts">
  import type { Stream } from "misskey-js";
  import type { Note } from "misskey-js/built/entities";
  import { onDestroy, onMount } from "svelte";
  import { type userData, moment } from "../lib/userdata";
  import Mfm from "./Mfm.svelte";

  export let user: userData;
  export let note: Note;
  export let stream: Stream = null;

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

  onMount(() => {
    if (!stream) return;
    stream.send("subNote", {
      id: note.id,
    });
  });
  onDestroy(() => {
    if (!stream) return;
    stream.send("unsubNote", {
      id: note.id,
    });
  });
</script>

<div
  class="card card-bordered bg-base-100 w-full my-2 shadow-sm hover:bg-base-200"
>
  <div class="card-body -my-6 -mx-4">
    <a
      class="card-title link link-hover rounded hover:bg-base-100 -mb-1"
      href={`https://${user.hostUrl}/${useridStr}`}
      target="_blank"
      rel="noreferrer"
    >
      <!-- ユーザー名とアイコン -->
      {#if note.renote && !note.text}
        <div class="text-accent text-xs -mb-2">
          🔁{note.user.name}がRenote
        </div>
      {:else}
        <div class="avatar">
          <div class="w-8 rounded-full -m-1">
            <img src={note.user.avatarUrl} alt={note.user.username} />
          </div>
        </div>
        <div class="w-full overflow-clip">
          <div class="text-sm truncate -mb-1">
            {#if note.user.name === null}
              {note.user.username}
            {:else}
              {note.user.name}
            {/if}
          </div>
          <div class="text-xs truncate">
            {useridStr}
          </div>
        </div>
      {/if}
    </a>
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
        <a
          class="card-title link link-hover rounded hover:bg-base-100 -mb-1 ml-1"
          href={`https://${user.hostUrl}/${useridStr}`}
          target="_blank"
          rel="noreferrer"
        >
          <!-- ユーザー名とアイコン -->
          <div class="avatar">
            <div class="w-8 rounded-full -m-1">
              <img src={note.renote.user.avatarUrl} alt={renoteUseridStr} />
            </div>
          </div>
          <div class="w-full overflow-clip">
            <div class="text-sm truncate -mb-1">
              {#if note.renote.user.name === null}
                {note.renote.user.username}
              {:else}
                {note.renote.user.name}
              {/if}
            </div>
            <div class="text-xs truncate">
              {useridStr}
            </div>
          </div>
        </a>
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
            {#if name.indexOf("@.") >= 0}
              <span class="badge badge-outline badge-accent h-5">
                <img
                  src={localEmojiSearch(name.replace(/\:|@./gm, ""))}
                  class="h-4"
                  alt={name}
                />
                {num}
              </span>
            {:else if name.indexOf("@") >= 0}
              <span class="badge badge-outline h-5">
                <img
                  src={note.renote.reactionEmojis[name.replace(/\:/gm, "")]}
                  class="h-4"
                  alt={name}
                />
                {num}
              </span>
            {:else}
              <span class="badge badge-outline badge-accent h-5">
                <span class="h-4">{name}</span>
                {num}
              </span>
            {/if}
          {/each}
        </div>
      </div>
    {/if}

    <!-- リアクション -->
    {#if note.reactions}
      <div>
        {#each Object.entries(note.reactions) as [name, num]}
          {#if name.indexOf("@.") >= 0}
            <span class="badge badge-outline badge-primary h-5">
              <img
                src={localEmojiSearch(name.replace(/\:|@./gm, ""))}
                class="h-4"
                alt={name}
              />
              {num}
            </span>
          {:else if name.indexOf("@") >= 0}
            <span class="badge badge-outline h-5">
              <img
                src={note.reactionEmojis[name.replace(/\:/gm, "")]}
                class="h-4"
                alt="name"
              />
              {num}
            </span>
          {:else}
            <span class="badge badge-outline badge-primary h-5">
              {name}
              {num}
            </span>
          {/if}
        {/each}
      </div>
    {/if}
    <a
      class="text-right text-xs link -mt-3"
      href={`https://${user.hostUrl}/notes/${note.id}`}
      target="_blank"
      rel="noreferrer"
    >
      {moment(note.createdAt).fromNow()}
    </a>
  </div>
</div>
