<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import "../tailwind.css";
  import type { Note as NoteType } from "misskey-js/built/entities";
  import Note from "../components/Note.svelte";
  import type { UserData } from "../lib/userdata";
  export let Hst: Hst;

  let note: NoteType = {
    text: `<center>
Hello $[tada everynyan! ð]

I'm @ai, A bot of misskey!

https://github.com/syuilo/ai
</center>`,
    user: {
      name: "username",
      username: "userid",
      avatarUrl:
        "https://nicomedkey.cc/proxy/avatar.webp?url=https%3A%2F%2Fs3.nicomedkey.cc%2Ffiles%2Fb8b4e7f5-590e-452f-947a-fdbf2e6bf9bb.png&avatar=1",
    },
    createdAt: "2023-02-25T12:19:16.667Z",
    files: [],
  };
  let user: UserData = {
    ok: true,
    id: "aaaaaaaa",
    sessionId: "aaaaaaaaaaa",
    token: "aaaaaaaaa",
    userName: "username",
    hostUrl: "localhost:3000",
  };
</script>

<Hst.Story>
  <Note {note} {user} />

  <svelte:fragment slot="controls">
    <div class="form-control">
      <span class="label-text">ãã¹ãURL</span>
      <input type="text" class="input input-sm" bind:value={user.hostUrl} />
    </div>
    <div class="form-control">
      <span class="label-text">ã¦ã¼ã¶ã¼ãã¼ã </span>
      <input
        type="text"
        class="input input-sm"
        bind:value={note.user.username}
      />
    </div>
    <div class="form-control">
      <span class="label-text">ãªã¢ã¼ãURL</span>
      <input type="text" class="input input-sm" bind:value={note.user.host} />
    </div>
    <div class="form-control">
      <span class="label-text">ãã¼ãåå®¹</span>
      <textarea class="textarea" bind:value={note.text} />
    </div>
  </svelte:fragment>
</Hst.Story>
