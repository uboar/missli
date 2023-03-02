<script lang="ts">
  import { users } from "../lib/userdata";
  let text = "";
  let selectedUsers = [0];

  const sendNote = async () => {
    let promises = [];

    try {
      selectedUsers.forEach((val) => {
        promises.push($users[val].cli.request("notes/create", { text: text }));
      });
      await Promise.allSettled(promises);
      text = "";
    } catch (err) {
      console.error(err);
    }
  };
</script>

<div class="modal-box w-11/12 max-w-3xl">
  <div>
    <div class="form-control w-full">
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
      <textarea
        class="textarea textarea-bordered w-full"
        bind:value={text}
        placeholder="ノートする内容を入力して下さい！"
      />
    </div>
  </div>
  <div class="modal-action flex">
    <label
      for="post-modal"
      class="btn btn-primary flex-1 {text === '' ? 'btn-disabled' : ''}"
      on:click={sendNote}
      on:keypress={sendNote}>ノートする</label
    >
    <label for="post-modal" class="btn btn-secondary btn-outline">閉じる</label>
  </div>
</div>
