<script lang="ts">
  import { getEmojis, users } from "../../lib/userdata";

  let loading = false;
  let selectedUserNum = 0;
  
  const getSettings = () => {};
  
  const reGetEmojis = async () => {
    loading = true;
    await getEmojis($users[selectedUserNum], true);
    loading = false;
  }


</script>

<div>
  <h1 class="text-2xl">ユーザー毎の設定</h1>
  <span class="label-text">ユーザー</span>
  <select
    bind:value={selectedUserNum}
    class="select select-bordered w-full mb-4"
    on:change={getSettings}
  >
    {#each $users as user, index (user.id)}
      <option value={index}>{user.userName}@{user.hostUrl}</option>
    {/each}
  </select>
  <button class="btn btn-secondary" disabled={loading} on:click={reGetEmojis}>カスタム絵文字データの再取得</button>
</div>
