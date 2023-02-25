<script lang="ts">
    import { userDataArray, timelines } from "../lib/userdata";
    import type { userData } from "../lib/userdata";

    let selectedChannel = null;
    let selectedUserNum = null;
    let users: Array<userData> = [];

    userDataArray.subscribe((val) => users = val)

    const channelTypes = [
        { name: "ホーム", value: "homeTimeline" },
        { name: "ローカル", value: "localTimeline" },
        { name: "ソーシャル", value: "hybridTimeline" },
        { name: "グローバル", value: "globalTimeline" },
    ];

    const addTimeline = () => {
        console.log(users)
        timelines.update((val) => 
            [...val, {
                id: new Date().valueOf(),
                channel: channelTypes[selectedChannel].value as any,
                userDataIndex: selectedUserNum,
                channelName: `${channelTypes[selectedChannel].name} / ${users[selectedUserNum].hostUrl}`,
                width: "24rem",
                showNoteNum: 100,
                bufferNoteNum: 1000,
                color: "#808080"
            }]
        )
    }
</script>

<div class="flex w-96 p-4">
    <div class="card card-bordered border-accent-focus w-full h-fit">
        <div class="card-body">
            <div class="card-title">タイムラインを追加</div>
            <div>
                <div class="form-control w-full">
                    <span class="label-text">ユーザー</span>
                    <select
                        bind:value={selectedUserNum}
                        class="select select-bordered w-full"
                    >
                        {#each users as user, index (user.sessionId)}
                            <option value={index}
                                >{user.userName}@{user.hostUrl}</option
                            >
                        {/each}
                    </select>
                    <span class="label-text">タイムラインの種類</span>
                    <select
                        bind:value={selectedChannel}
                        class="select select-bordered w-full"
                    >
                        {#each channelTypes as channelType, index}
                            <option value={index}>{channelType.name}</option
                            >
                        {/each}
                    </select>
                    
                    <button
                        class={`${
                            ((selectedChannel !== null) && (selectedUserNum !== null)) ? "" : "btn-disabled"
                        } btn btn-primary mt-2`}
                        on:click={addTimeline}
                        on:keypress={addTimeline}
                        >タイムラインを追加</button>
                </div>
            </div>
        </div>
    </div>
</div>
