<script lang="ts">
  import Auth from "@/components/settings/Auth.svelte";
  import UserSetting from "@/components/settings/UserSetting.svelte";
  import GeneralSetting from "./settings/GeneralSetting.svelte";
  import About from "./settings/About.svelte";

  let selectedTab = 0;

  const tabs = [
    { name: "連携設定", value: 0 },
    { name: "ユーザー毎の設定", value: 1 },
    { name: "全般設定", value: 2 },
    { name: "missLIについて", value: 3 },
  ];
</script>

<div>
  <div class="tabs">
    {#each tabs as tab, index (tab.value)}
      <button
        class="tab tab-bordered {selectedTab === tab.value ? 'tab-active' : ''}"
        on:click={() => (selectedTab = tab.value)}
      >
        {tab.name}
      </button>
    {/each}
  </div>
  {#if selectedTab === 0}
    <Auth />
  {:else if selectedTab === 1}
    <UserSetting />
  {:else if selectedTab === 2}
    <GeneralSetting />
  {:else if selectedTab === 3}
    <About />
  {/if}
</div>
