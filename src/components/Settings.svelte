<script lang="ts">
  import Auth from "./Auth.svelte";
  import { settings } from "../lib/userdata";

  let selectedTab = 0;

  const tabs = [
    { name: "アカウントの追加", value: 0 },
    { name: "全般設定", value: 1 },
  ];

  const themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
  ];
</script>

<div>
  <div class="tabs">
    {#each tabs as tab, index (tab.value)}
      <button
        class="tab tab-bordered {selectedTab === tab.value ? 'tab-active' : ''}"
        on:click={() => {
          selectedTab = tab.value;
        }}
        on:keypress={() => {
          selectedTab = tab.value;
        }}
      >
        {tab.name}
      </button>
    {/each}
  </div>
  {#if selectedTab === 0}
    <Auth />
  {:else if selectedTab === 1}
    <span class="label-text">カラーテーマ</span>
    <select bind:value={$settings.theme} class="select select-bordered w-full">
      {#each themes as theme}
        <option>{theme}</option>
      {/each}
    </select>
  {/if}
</div>
