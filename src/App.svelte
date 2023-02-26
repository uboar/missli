<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import Auth from "./components/Auth.svelte";
  import {
    userDataArray,
    timelines,
    getCookie,
    type timelineOptions,
  } from "./lib/userdata";
  import Timeline from "./components/Timeline.svelte";
  import AddTimeline from "./components/AddTimeline.svelte";

  $userDataArray = getCookie();

  const timelineLocal = JSON.parse(
    localStorage.getItem("timelines")
  ) as unknown as Array<timelineOptions>;

  if (timelineLocal) $timelines = timelineLocal;

  timelines.subscribe((val) => {
    localStorage.setItem("timelines", JSON.stringify(val));
  });
</script>

<main data-theme="cupcake" class="h-screen">
  <Navbar />
  <div class="flex flex-col h-full w-fit">
    <div class="pb-16" />
    {#if $userDataArray.length === 0}
      <Auth />
    {:else}
      <div class="flex flex-row w-fit h-full">
        {#each $timelines as timeline}
          <Timeline
            user={$userDataArray[timeline.userDataIndex]}
            bind:options={timeline}
          />
        {/each}
        <div class="flex flex-col">
          <AddTimeline />
        </div>
      </div>
    {/if}
  </div>
</main>
