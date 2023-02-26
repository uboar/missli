<script lang="ts">
    import type { Note } from "misskey-js/built/entities";
    import moment from "moment";
    import "moment/locale/ja";
    import type { userData } from "../lib/userdata";
    import Mfm from "./Mfm.svelte";
    export let user: userData;
    export let note: Note;

    moment.locale("ja");

    $: useridStr = `@${note.user.username}${
        note.user.host ? `@${note.user.host}` : ""
    }`;
    $: renoteUseridStr = note.renote
        ? `@${note.renote.user.username}${
              note.renote.user.host ? `@${note.renote.user.host}` : ""
          }`
        : "";
</script>

<div
    class="card card-bordered bg-base-100 w-full my-2 shadow-sm hover:shadow-lg"
>
    <div class="card-body -my-6 -mx-4">
        <div class="card-title overflow-hidden">
            <div class="avatar">
                <div class="w-8 rounded-full">
                    <img src={note.user.avatarUrl} alt={note.user.username} />
                </div>
            </div>
            <div class="flex flex-col">
                <div class="text-sm text-base-content truncate">
                    {note.user.name}
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
                <Mfm text={note.text} hostUrl={user.hostUrl} localEmojis={user.emojis} remoteEmojis={note.emojis}></Mfm>
            </p>
        {/if}

        <!-- メディア内容 -->
        {#if note.files.length > 0}
            {#each note.files as file (file.id)}
            {#if file.type.indexOf("image") >= 0}
                <a class="card w-full rounded-lg my-2" 
                        href={file.url} target="_blank" rel="noreferrer">
                    <img
                        src={file.thumbnailUrl}
                        alt={file.name}
                        class="rounded-lg"
                    />
                </a>
            {/if}
            {/each}
        {/if}
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
                        <Mfm text={note.renote.text} hostUrl={user.hostUrl} localEmojis={user.emojis} remoteEmojis={note.renote.emojis}></Mfm>
                    </p>
                {/if}

                <!-- メディア内容 -->
                {#if note.renote.files.length > 0}
                    {#each note.renote.files as file (file.id)}
                        {#if file.type.indexOf("image") >= 0}
                            <a class="card w-full rounded-lg my-2" 
                                    href={file.url} target="_blank" rel="noreferrer">
                                <img
                                    src={file.thumbnailUrl}
                                    alt={file.name}
                                    class="rounded-lg"
                                />
                            </a>
                        {/if}
                    {/each}
                {/if}
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
