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
    };
</script>

<Hst.Story>
    <Note {note} />

    <svelte:fragment slot="controls">
        <div class="form-control">
            <span class="label-text">ユーザーネーム</span>
            <input
                type="text"
                class="input input-sm"
                bind:value={note.user.username}
            />
        </div>
        <div class="form-control">
            <span class="label-text">ユーザーID</span>
            <input
                type="text"
                class="input input-sm"
                bind:value={note.user.id}
            />
        </div>
        <div class="form-control">
            <span class="label-text">ノート内容</span>
            <textarea class="textarea" bind:value={note.text} />
        </div>
    </svelte:fragment>
</Hst.Story>
