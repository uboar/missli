<script lang="ts">
  import type { api } from "misskey-js";
  import type { Note as NoteType } from "misskey-js/built/entities";
  import { onMount } from "svelte";
  import type { postNote as postNoteType } from "../../lib/userdata";

  export let postNote: postNoteType;
  export let cli: api.APIClient | null = null;
  export let replyNote: NoteType | null = null;
  export let renoteNote: NoteType | null = null;

  onMount(() => {
    if (!cli) return;
  });

  let noteBusy = false;
  let showCw = false;

  const noteVisibilityEnum = [
    {
      name: "パブリック",
      value: "public",
    },
    {
      name: "ホーム",
      value: "home",
    },
    {
      name: "フォロワー",
      value: "followers",
    },
  ];

  const sendNote = async () => {
    noteBusy = true;
    try {
      let postNoteBuff = { ...postNote };

      if (!showCw) delete postNoteBuff.cw;
      await cli.request("notes/create", postNoteBuff);
      noteBusy = false;
      postNote.text = "";
      postNote.cw = "";
    } catch (err) {
      console.error(err);
      noteBusy = false;
    }
  };
</script>

<div class="card card-compact">
  <div class="card-body">
    <div class="flex gap-4">
      <div class="form-control flex-1">
        <span class="label-text">公開範囲</span>
        <select
          class="select select-bordered select-sm"
          bind:value={postNote.visibility}
        >
          {#each noteVisibilityEnum as noteVisibility (noteVisibility.name)}
            <option value={noteVisibility.value}>{noteVisibility.name}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <div class="form-control -my-1">
          <label class="label cursor-pointer">
            <span class="label-text mx-2">連合なし</span>
            <input
              type="checkbox"
              class="checkbox bg-base-100"
              bind:checked={postNote.localOnly}
            />
          </label>
        </div>
        <div class="form-control -my-1">
          <label class="label cursor-pointer">
            <span class="label-text mx-2">CW</span>
            <input
              type="checkbox"
              class="checkbox bg-base-100"
              bind:checked={showCw}
            />
          </label>
        </div>
      </div>
    </div>
    {#if showCw}
      <input
        type="text"
        class="input input-sm input-bordered"
        placeholder="CW"
        bind:value={postNote.cw}
      />
    {/if}
    <textarea
      class="textarea textarea-bordered"
      bind:value={postNote.text}
      placeholder="ノートする内容を入力して下さい！"
      on:keydown={(e) => {
        if (e.ctrlKey && e.code === "Enter") sendNote();
      }}
    />
    <div class="card-actions">
      <button
        class="btn btn-block btn-sm btn-primary {noteBusy
          ? 'btn-disabled'
          : ''}"
        on:click={sendNote}
        on:keypress={sendNote}
      >
        ノートする
      </button>
    </div>
  </div>
</div>
