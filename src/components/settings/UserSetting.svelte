<script lang="ts">
  import { getEmojis, users } from "@/lib/userdata";

  let loading = false;
  let selectedUserNum = 0;
  let isIgnoreCache = false;

  const getSettings = () => {
    isIgnoreCache =
      $users[selectedUserNum].localStorageOptions?.ignoreCache || false;
  };

  const reGetEmojis = async () => {
    loading = true;
    await getEmojis($users[selectedUserNum], true);
    loading = false;
  };
</script>

<div>
  <h1 class="mb-2 text-2xl font-bold">ユーザー毎の設定</h1>
  <span class="label-text">ユーザー</span>
  <select
    bind:value={selectedUserNum}
    class="select select-bordered mb-4 w-full"
    on:change={getSettings}
  >
    {#each $users as user, index (user.id)}
      <option value={index}>{user.userName}@{user.hostUrl}</option>
    {/each}
  </select>

  <label class="label cursor-pointer">
    <span class="label-text"
      >カスタム絵文字データを常に最新にする(起動時間が長くなります)</span
    >
    <input type="checkbox" bind:checked={isIgnoreCache} class="checkbox" />
  </label>
  <button
    class="btn btn-secondary btn-block mt-4"
    disabled={loading}
    on:click={reGetEmojis}>カスタム絵文字データの再取得</button
  >
</div>
