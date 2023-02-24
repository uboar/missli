<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import Auth from "./components/Auth.svelte";
  import { userDataArray, timelines } from "./lib/userdata";

  import type { userData, timeline } from "./lib/userdata";
  import Timeline from "./components/Timeline.svelte";
  import AddTimeline from "./components/AddTimeline.svelte";

  let userDataArrayVal: Array<userData>;
  let timelinesVal: Array<timeline>;

  userDataArray.subscribe((val) => {
    userDataArrayVal = val;
  });

  timelines.subscribe((val) => {
    timelinesVal = val;
  });
</script>

<main>
  <Navbar />
  <div class="pb-16"></div>
  {#if userDataArrayVal.length === 0}
    <Auth />
  {:else}
    <div class="flex flex-row w-fit">
      {#each timelinesVal as timeline}
        <Timeline user={userDataArrayVal[timeline.userDataIndex]} channel={timeline.channel} timelineName={timeline.channelName} />
      {/each}
      <AddTimeline />
    </div>
  {/if}
</main>
