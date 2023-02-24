<script lang="ts">
    import type { Note } from "misskey-js/built/entities";

    export let note: Note;
</script>

<div class="card card-bordered bg-base-100 w-full my-2">
    <div class="card-body -my-6">
        <div class="card-title overflow-hidden">
            <div class="text-sm text-base-content truncate">
                {note.user.name}
            </div>
            <div class="text-xs text-base-content overflow-hidden text-ellipsis">
                @{note.user.username}{note.user.host
                    ? `@${note.user.host}`
                    : ""}
            </div>
        </div>
        {#if note.text}
            <p class="text-ellipsis overflow-hidden">{note.text}</p>
        {/if}
        <!-- リノート内容 -->
        {#if note.renote}
            <div class="card card-bordered border-accent rounded p-1">
                <div class="card-title overflow-hidden">
                    <div class="text-sm text-accent truncate">
                        {note.renote.user.name}
                    </div>
                    <div
                        class="text-xs text-accent-focus overflow-hidden text-ellipsis"
                    >
                        @{note.renote.user.username}{note.user.host
                            ? `@${note.renote.user.host}`
                            : ""}
                    </div>
                </div>
                {#if note.renote.text}
                    <p class="text-ellipsis overflow-hidden">
                        {note.renote.text}
                    </p>
                {/if}
            </div>
        {/if}
    </div>
</div>
