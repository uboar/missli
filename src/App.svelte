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
  import { onMount } from "svelte";

  let loading = true;

  onMount(async () => {
    $userDataArray = await getCookie();
    loading = false;
  });

  const timelineLocal = JSON.parse(
    localStorage.getItem("timelines")
  ) as unknown as Array<timelineOptions>;

  if (timelineLocal) $timelines = timelineLocal;

  timelines.subscribe((val) => {
    localStorage.setItem("timelines", JSON.stringify(val));
  });
</script>

<main data-theme="light" class="h-screen">
  <Navbar />
  <div class="flex flex-col h-full w-fit">
    <div class="pb-16" />
    {#if loading}
      <progress class="progress w-full my-8" />
    {:else if $userDataArray.length === 0}
      <div class="mt-4 text-2xl w-screen text-center">↗にある⚙（設定）からユーザーを追加してください！</div>
    {:else}
      <div class="flex flex-row w-fit h-full">
        {#each $timelines as timeline}
          <Timeline
            user={$userDataArray[timeline.userDataIndex]}
            bind:options={timeline}
          />
        {/each}
        <div class="flex flex-col bg-base-100">
          <AddTimeline />
        </div>
      </div>
    {/if}
  </div>
</main>
