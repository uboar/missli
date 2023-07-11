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
  <div class="flex h-full w-full flex-col overflow-x-auto">
    <div class="pb-10" />
    {#if loading}
      <progress class="progress mt-8 w-96" />
    {:else if $users.length === 0}
      <div class="mt-4 w-screen text-center text-2xl">
        ↗にある⚙（設定）からユーザーを追加してください！
      </div>
    {:else}
      <div class="flex h-full w-fit flex-row">
        {#each $timelines as timeline, index (timeline.id)}
          {#if $users[timeline.userDataIndex].initializeEnded}
            <Timeline
              bind:user={$users[timeline.userDataIndex]}
              bind:options={timeline}
              on:breakRequest={deleteTimeline}
            />
          {:else}
            <progress class="progress mt-8 w-72" />
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
