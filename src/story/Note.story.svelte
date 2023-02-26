<script lang="ts">
    import type { Hst } from "@histoire/plugin-svelte";
    import "../tailwind.css";
    import type { Note as NoteType } from "misskey-js/built/entities";
    import Note from "../components/Note.svelte";
    export let Hst: Hst;

    let note: NoteType = {
        text: "わはは",
        user: {
            username: "ユーザー名",
            id: "@userid@test.instance"
        },
        files: [],
    };
    let hostUrl = "localhost:3000"
</script>

<Hst.Story>
    <Note {note} {hostUrl} />

    <svelte:fragment slot="controls">
        <div class="form-control">
            <span class="label-text">ホストURL</span>
            <input
                type="text"
                class="input input-sm"
                bind:value={hostUrl}
            />
        </div>
        <div class="form-control">
            <span class="label-text">ユーザーネーム</span>
            <input
                type="text"
                class="input input-sm"
                bind:value={note.user.username}
            />
        </div>
        <div class="form-control">
            <span class="label-text">リモートURL</span>
            <input
                type="text"
                class="input input-sm"
                bind:value={note.user.host}
            />
        </div>
        <div class="form-control">
            <span class="label-text">ノート内容</span>
            <textarea class="textarea" bind:value={note.text} />
        </div>
    </svelte:fragment>
</Hst.Story>
