<script lang="ts">
  import { users, timelines } from "../lib/userdata";
  let selectedChannel = null;
  let selectedUserNum = null;

  const channelTypes = [
    { name: "ホーム", value: "homeTimeline" },
    { name: "ローカル", value: "localTimeline" },
    { name: "ソーシャル", value: "hybridTimeline" },
    { name: "グローバル", value: "globalTimeline" },
  ];

  const addTimeline = () => {
    timelines.update((val) => [
      ...val,
      {
        id: new Date().valueOf(),
        channel: channelTypes[selectedChannel].value as any,
        userDataIndex: selectedUserNum,
        channelName: `${channelTypes[selectedChannel].name} / ${$users[selectedUserNum].hostUrl}`,
      },
    ]);
  };
</script>

<div>
  <div class="text-2xl">タイムラインを追加</div>
  <div>
    <div class="form-control w-full">
      <span class="label-text">ユーザー</span>
      <select
        bind:value={selectedUserNum}
        class="select select-bordered w-full"
      >
        {#each $users as user, index (user.id)}
          <option value={index}>{user.userName}@{user.hostUrl}</option>
        {/each}
      </select>
      <span class="label-text">タイムラインの種類</span>
      <select
        bind:value={selectedChannel}
        class="select select-bordered w-full"
      >
        {#each channelTypes as channelType, index}
          <option value={index}>{channelType.name}</option>
        {/each}
      </select>

      <button
        class={`${
          selectedChannel !== null && selectedUserNum !== null
            ? ""
            : "btn-disabled"
        } btn btn-primary mt-2`}
        on:click={addTimeline}
        on:keypress={addTimeline}>タイムラインを追加</button
      >
    </div>
  </div>
</div>
