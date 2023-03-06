<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import Auth from "./components/Auth.svelte";
  import {
    users,
    timelines,
    getCookie,
    settings,
    type timelineOptions,
    type settingsType,
  } from "./lib/userdata";
  import Timeline from "./components/Timeline.svelte";
  import AddTimeline from "./components/AddTimeline.svelte";
  import { onMount, tick } from "svelte";

  let loading = true;

  onMount(async () => {
    $users = await getCookie();
    loading = false;
  });

  const deleteTimeline = async() => {
    loading = true;
    await tick();
    loading = false;
  }
</script>

<main data-theme={$settings.theme} class="screen">
  <Navbar />
  <div class="flex flex-col h-full w-fit">
    <div class="pb-10" />
    {#if loading}
      <progress class="progress w-96 mt-8" />
    {:else if $users.length === 0}
      <div class="mt-4 text-2xl w-screen text-center">
        ↗にある⚙（設定）からユーザーを追加してください！
      </div>
    {:else}
      <div class="flex flex-row w-fit h-full">
        {#each $timelines as timeline}
          <Timeline
            bind:user={$users[timeline.userDataIndex]}
            bind:options={timeline}
            on:breakRequest={deleteTimeline}
          />
        {/each}
      </div>
    {/if}
  </div>
</main>

<style>
  .screen {
    height: calc(100svh - 10px);
  }
</style>
