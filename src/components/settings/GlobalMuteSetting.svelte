<script lang="ts">
  import { settings } from "@/lib/userdata";

  let addUser = {
    username: "",
    host: "",
  };
  let addWord = "";
  const addUserMute = () => {
    if (addUser.host === "") return;
    if (addUser.username === "") return;
    $settings.globalUserMute.push({ ...addUser });
    settings.set($settings);
    addUser.username = "";
    addUser.host = "";
  };
  const deleteUserMute = (index: number) => {
    $settings.globalUserMute.splice(index, 1);
    settings.set($settings);
  };

  const addWordMute = () => {
    if (addWord === "") return;
    $settings.globalWordMute.push({
      regexp: new RegExp(addWord, "g"),
      str: addWord,
    });
    settings.set($settings);
    addWord = "";
  };
  const deleteWordMute = (index: number) => {
    $settings.globalWordMute.splice(index, 1);
    settings.set($settings);
  };
  const updateWordMute = (str: string, index: number) => {
    $settings.globalWordMute[index].regexp = new RegExp(str, "g");
  };
</script>

<h1 class="mb-2 text-2xl font-bold">グローバルミュート設定</h1>
<div class="mb-2">
  グローバルミュートは、追加した全タイムラインから指定したユーザー・ワードのノート・リノート等を非表示にします。
  Misskey本体の設定から独立しているので、MissLI以外でこの設定を反映させる事は出来ません。
</div>
<label class="label mb-2 cursor-pointer">
  <span class="label-text">ノートがミュートされた事を明示する</span>
  <input
    type="checkbox"
    bind:checked={$settings.showMutedInfo}
    class="checkbox"
  />
</label>
<h2 class="text-xl">グローバルユーザーミュート</h2>
<div
  class="card card-bordered mb-2 max-h-40 w-full overflow-y-auto overscroll-auto"
>
  <div class="card-body">
    {#each $settings.globalUserMute as userMute, index}
      <div class="flex w-full">
        <input
          type="text"
          class="input input-bordered input-sm"
          placeholder="ユーザー名"
          bind:value={userMute.username}
        />
        <div class="mx-2 text-lg">@</div>
        <input
          type="text"
          class="input input-bordered input-sm"
          placeholder="サーバーURL"
          bind:value={userMute.host}
        />
        <button
          class="btn btn-error btn-sm mx-2 md:px-16"
          on:click={() => deleteUserMute(index)}>削除</button
        >
      </div>
    {/each}
    <div class="flex w-full">
      <input
        type="text"
        class="input input-bordered input-sm"
        placeholder="ユーザー名"
        bind:value={addUser.username}
      />
      <div class="mx-2 text-lg">@</div>
      <input
        type="text"
        class="input input-bordered input-sm"
        placeholder="サーバーURL"
        bind:value={addUser.host}
      />
      <button
        class="btn btn-primary btn-sm mx-2 md:px-16"
        on:click={addUserMute}>追加</button
      >
    </div>
  </div>
</div>
<h2 class="text-xl">グローバルワードミュート</h2>
<div
  class="card card-bordered mb-2 max-h-40 w-full overflow-y-auto overscroll-auto"
>
  <div class="card-body">
    {#each $settings.globalWordMute as wordMute, index}
      <div class="flex w-full">
        <input
          type="text"
          class="input input-bordered input-sm md:w-72"
          placeholder="ミュートするワード(正規表現パターン使用可)"
          bind:value={wordMute.str}
          on:input={(e) => updateWordMute(wordMute.str, index)}
        />
        <button
          class="btn btn-error btn-sm mx-2 md:px-16"
          on:click={() => deleteWordMute(index)}>削除</button
        >
      </div>
    {/each}
    <div class="flex w-full">
      <input
        type="text"
        class="input input-bordered input-sm md:w-72"
        placeholder="ミュートするワード(正規表現パターン使用可)"
        bind:value={addWord}
      />
      <button
        class="btn btn-primary btn-sm mx-2 md:px-16"
        on:click={addWordMute}>追加</button
      >
    </div>
  </div>
</div>
