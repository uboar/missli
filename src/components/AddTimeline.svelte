<script lang="ts">
  import type { Channels } from "misskey-js";
  import { users, timelines } from "../lib/userdata";
  let selectedChannel = 0;
  let selectedUserNum = 0;
  let selectedChannelNum = -1;

  const channelTypes = [
    { name: "ホーム", value: "homeTimeline" },
    { name: "ローカル", value: "localTimeline" },
    { name: "ソーシャル", value: "hybridTimeline" },
    { name: "グローバル", value: "globalTimeline" },
    { name: "チャンネル", value: "channel" },
  ];

  let userChannels: Record<string, any> = [];

  const getChannels = async () => {
    try {
      userChannels = await $users[selectedUserNum].cli.request(
        "channels/followed",
        {
          limit: 100,
        }
      );

      if (userChannels.length > 0) {
        selectedChannelNum = 0;
      } else {
        selectedChannelNum = -1;
        selectedChannel = 0;
      }
    } catch (err) {
      console.error(err);
      selectedChannelNum = -1;
      selectedChannel = 0;
    }
  };

  const addTimeline = () => {
    let channelName = "";
    let channel = "";

    if (channelTypes[selectedChannel].name === "チャンネル") {
      channelName = `${userChannels[selectedChannelNum].name} / ${$users[selectedUserNum].hostUrl}`;
      channel = userChannels[selectedChannelNum].id;
    } else {
      channelName = `${channelTypes[selectedChannel].name} / ${$users[selectedUserNum].hostUrl}`;
      channel = channelTypes[selectedChannel].value;
    }

    timelines.update((val) => [
      ...val,
      {
        id: new Date().valueOf(),
        channel: channel as keyof Channels,
        userDataIndex: selectedUserNum,
        channelName: channelName,
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
        on:change={() => {
          if (channelTypes[selectedChannel].name === "チャンネル")
            getChannels();
        }}
      >
        {#each $users as user, index (user.id)}
          <option value={index}>{user.userName}@{user.hostUrl}</option>
        {/each}
      </select>
      <span class="label-text">タイムラインの種類</span>
      <select
        bind:value={selectedChannel}
        on:change={() => {
          if (channelTypes[selectedChannel].name === "チャンネル")
            getChannels();
        }}
        class="select select-bordered w-full"
      >
        {#each channelTypes as channelType, index}
          <option value={index}>{channelType.name}</option>
        {/each}
      </select>

      {#if channelTypes[selectedChannel].name === "チャンネル"}
        <span class="label-text">チャンネル</span>
        <select
          bind:value={selectedChannelNum}
          class="select select-bordered w-full"
        >
          {#each userChannels as userChannel, index}
            <option value={index}>{userChannel.name}</option>
          {/each}
        </select>
      {/if}

      <label
        for="addtimeline-modal"
        class={`${
          (selectedChannel !== null &&
            selectedUserNum !== null &&
            channelTypes[selectedChannel].name !== "チャンネル") ||
          (selectedChannel !== null &&
            channelTypes[selectedChannel].name === "チャンネル" &&
            selectedChannelNum !== null)
            ? ""
            : "btn-disabled"
        } btn btn-primary mt-2`}
        on:click={addTimeline}
        on:keydown={(e) => {
          if (e.code === "Enter") addTimeline();
        }}>タイムラインを追加</label
      >
    </div>
  </div>
</div>
