<script lang="ts">
  import { TimelineApiEndpoint } from "@/lib/channel";
  import { users, timelines } from "@/lib/userdata";
  import type { TimelineOptions } from "@/types/type";

  let selectedChannel = 0;
  let selectedUserNum = 0;
  let selectedChannelNum = -1;

  const channelTypes = [
    { name: "ホーム", value: "homeTimeline" },
    { name: "ローカル", value: "localTimeline" },
    { name: "ソーシャル", value: "hybridTimeline" },
    { name: "グローバル", value: "globalTimeline" },
    { name: "チャンネル", value: "channel" },
    { name: "アンテナ", value: "antenna" },
    { name: "リスト", value: "userList" },
    { name: "ロール", value: "roleTimeline" },
  ];

  let userChannels: Array<{ name: string; id: string }> = [];

  const getChannels = async () => {
    try {
      if (channelTypes[selectedChannel].value === "channel") {
        // チャンネル
        const buffer = await $users[selectedUserNum].cli.request(
          "channels/followed",
          {
            limit: 100,
          }
        );
        userChannels = buffer.map((v) => {
          return { name: v.name, id: v.id };
        });
      } else if (channelTypes[selectedChannel].value === "antenna") {
        // アンテナ
        const buffer = await $users[selectedUserNum].cli.request(
          "antennas/list"
        );
        userChannels = buffer.map((v) => {
          return { name: v.name, id: v.id };
        });
      } else if (channelTypes[selectedChannel].value === "userList") {
        // リスト
        const buffer = await $users[selectedUserNum].cli.request(
          "users/lists/list"
        );
        userChannels = buffer.map((v) => {
          return { name: v.name, id: v.id };
        });
      } else if (channelTypes[selectedChannel].value === "roleTimeline") {
        //ロール
        const buffer = await $users[selectedUserNum].cli.request("roles/list");
        userChannels = buffer.map((v) => {
          return { name: v.name, id: v.id };
        });
      }

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
    let timeline: TimelineOptions = {
      id: new Date().valueOf(),
      userDataIndex: selectedUserNum,
      channelName: "",
    };

    // misskey.ioの場合低レートモードを有効にする
    if ($users[selectedUserNum].hostUrl === "misskey.io") {
      timeline.lowRate = true;
    }

    if (TimelineApiEndpoint[channelTypes[selectedChannel].value] == null) {
      // タイムライン以外
      timeline.channelName = `${userChannels[selectedChannelNum].name} / ${$users[selectedUserNum].hostUrl}`;
      timeline.channel = channelTypes[selectedChannel].value;
      timeline.channelId = userChannels[selectedChannelNum].id;
    } else {
      // タイムライン
      timeline.channelName = `${channelTypes[selectedChannel].name} / ${$users[selectedUserNum].hostUrl}`;
      timeline.channel = channelTypes[selectedChannel].value;
    }

    console.log(timeline);
    timelines.update((val) => [...val, timeline]);
    console.log($timelines);
  };
</script>

<div>
  <div class="text-2xl">タイムラインを追加</div>
  <div>
    <div class="form-control w-full">
      <span class="label-text">ユーザー</span>
      <select
        bind:value={selectedUserNum}
        class="select-bordered select w-full"
        on:change={() => {
          if (TimelineApiEndpoint[channelTypes[selectedChannel].value] == null)
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
          if (TimelineApiEndpoint[channelTypes[selectedChannel].value] == null)
            getChannels();
        }}
        class="select-bordered select w-full"
      >
        {#each channelTypes as channelType, index}
          <option value={index}>{channelType.name}</option>
        {/each}
      </select>

      {#if TimelineApiEndpoint[channelTypes[selectedChannel].value] == null}
        <select
          bind:value={selectedChannelNum}
          class="select-bordered select mt-2 w-full"
        >
          {#each userChannels as userChannel, index}
            <option value={index}>{userChannel.name}</option>
          {/each}
        </select>
      {/if}

      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <label
        for="addtimeline-modal"
        class={`${
          (selectedChannel !== null &&
            selectedUserNum !== null &&
            TimelineApiEndpoint[channelTypes[selectedChannel].value] == null) ||
          (selectedChannel !== null &&
            TimelineApiEndpoint[channelTypes[selectedChannel].value] != null &&
            selectedChannelNum !== null)
            ? ""
            : "btn-disabled"
        } btn-primary btn mt-2`}
        on:click={addTimeline}
        on:keydown={(e) => {
          if (e.code === "Enter") addTimeline();
        }}>タイムラインを追加</label
      >
    </div>
  </div>
</div>
