<script lang="ts">
  import { users, type postNote as postNoteType } from "../lib/userdata";

  let postNote: postNoteType = {
    text: "",
    localOnly: false,
    cw: "",
    visibility: "public",
  };
  let selectedUsers = [0];
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
    let promises = [];

    let postNoteBuff = { ...postNote };

    if (!showCw) delete postNoteBuff.cw;

    try {
      selectedUsers.forEach((val) => {
        promises.push($users[val].cli.request("notes/create", postNoteBuff));
      });
      await Promise.allSettled(promises);
      postNote.cw = "";
      postNote.text = "";
    } catch (err) {
      console.error(err);
    }
  };
</script>

<label class="modal-box w-11/12 max-w-3xl" for="">
  <div>
    <div class="form-control w-full">
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
      <span class="label-text">ノートするユーザー(複数選択可)</span>
      <select
        class="select select-lg select-bordered mb-2"
        multiple
        bind:value={selectedUsers}
      >
        {#each $users as user, index (user.id)}
          <option value={index}>{user.userName}@{user.hostUrl}</option>
        {/each}
      </select>
      <span class="label-text">ノート内容</span>
      {#if showCw}
        <input
          type="text"
          class="input input-sm input-bordered"
          placeholder="CW"
          bind:value={postNote.cw}
        />
      {/if}
      <textarea
        class="textarea textarea-bordered w-full"
        bind:value={postNote.text}
        placeholder="ノートする内容を入力して下さい！"
      />
    </div>
  </div>
  <div class="modal-action flex">
    <label
      for="post-modal"
      class="btn btn-primary flex-1 {postNote.text === '' ? 'btn-disabled' : ''}"
      on:click={sendNote}
      on:keydown={sendNote}>ノートする</label
    >
    <label for="post-modal" class="btn btn-secondary btn-outline">閉じる</label>
  </div>
</label>
