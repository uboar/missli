<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import "../tailwind.css";

  // import notes from "./assets/timeline.json";
  // import notes from "../../.idea/timeline.json";
  import Timeline from "../components/Timeline.svelte";
  import type { TimelineOptions, UserData } from "../types/type";

  export let Hst: Hst;

  let options: TimelineOptions = {
    id: new Date().valueOf(),
    initialNotes: [],
    channelName: "タイムライン",
    userDataIndex: 0,
    color: "#808080",
    width: "24rem",
    showNoteNum: 100,
    bufferNoteNum: 1000,
    channel: "globalTimeline",
  };

  let user: UserData = {
    ok: true,
    id: new Date().valueOf(),
    sessionId: "xxxxxxxx",
    token: "xxxxxxxxx",
    userName: "aaaaa",
    hostUrl: "localhost:3000",
  };
</script>

<Hst.Story>
  <div class="flex h-screen">
    <Timeline dummy {options} {user} />
  </div>

  <svelte:fragment slot="controls">
    <div class="form-control">
      <span class="label-text">タイムライン名</span>
      <input
        type="text"
        class="input input-sm"
        bind:value={options.channelName}
      />
    </div>
    <div class="form-control">
      <span class="label-text">ホストURL</span>
      <input type="text" class="input input-sm" bind:value={user.hostUrl} />
    </div>
  </svelte:fragment>
</Hst.Story>
