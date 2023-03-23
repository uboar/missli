<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import { users, timelines, getCookie, settings } from "./lib/userdata";
  import Timeline from "./components/Timeline.svelte";
  import { onMount, tick } from "svelte";

  let loading = true;

  onMount(async () => {
    loading = false;
    getCookie();
  });

  const deleteTimeline = async () => {
    loading = true;
    await tick();
    loading = false;
  };
</script>

<main data-theme={$settings.theme} class="screen">
  <div class="flex flex-col h-full w-full overflow-x-auto">
    <div class="pb-10" />
    {#if loading}
      <progress class="progress w-96 mt-8" />
    {:else if $users.length === 0}
      <div class="mt-4 text-2xl w-screen text-center">
        ↗にある⚙（設定）からユーザーを追加してください！
      </div>
    {:else}
      <div class="flex flex-row w-fit h-full">
        {#each $timelines as timeline, index (timeline.id)}
          {#if $users[timeline.userDataIndex].initializeEnded}
            <Timeline
              bind:user={$users[timeline.userDataIndex]}
              bind:options={timeline}
              on:breakRequest={deleteTimeline}
            />
          {:else}
            <progress class="progress w-72 mt-8" />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
  <Navbar />
</main>

<style>
  .screen {
    height: calc(100svh - 10px);
    width: 100svw;
  }
</style>
