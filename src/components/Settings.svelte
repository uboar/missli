<script lang="ts">
  import Auth from "@/components/Auth.svelte";
  import { version } from "../../package.json";
  import { settings } from "@/lib/userdata";
  import UserSetting from "@/components/settings/UserSetting.svelte";

  let selectedTab = 0;

  const tabs = [
    { name: "連携設定", value: 0 },
    { name: "ユーザー毎の設定", value: 1 },
    { name: "全般設定", value: 2 },
    { name: "missLIについて", value: 3 },
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
    "med1gp",
  ];
</script>

<div>
  <div class="tabs">
    {#each tabs as tab, index (tab.value)}
      <button
        class="tab-bordered tab {selectedTab === tab.value ? 'tab-active' : ''}"
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
    <span class="label-text">カラーテーマ</span>
    <select bind:value={$settings.theme} class="select-bordered select w-full">
      {#each themes as theme}
        <option>{theme}</option>
      {/each}
    </select>
  {:else if selectedTab === 3}
    <h1 class="text-3xl font-bold">missLI {version}</h1>
    <h2 class="text-lg font-bold">リポジトリ</h2>
    <a
      class="link-accent link"
      href="https://github.com/uboar/missli"
      target="_blank"
      rel="noreferrer"
    >
      uboar/missli
    </a>
    <h2 class="text-lg font-bold">不具合報告 / 不具合を探す</h2>
    <a
      class="link-accent link"
      href="https://github.com/uboar/missli/issues"
      target="_blank"
      rel="noreferrer"
    >
      uboar/missl/issues
    </a>
    <h2 class="text-lg font-bold">連絡先</h2>
    <ul>
      <li>
        <a
          class="link-accent link"
          href="https://github.com/uboar"
          target="_blank"
          rel="noreferrer"
        >
          @uboar@github.com
        </a>
      </li>
      <li>
        <a
          class="link-accent link"
          href="https://nicomedkey.cc/@uboar"
          target="_blank"
          rel="noreferrer"
        >
          @uboar@nicomedkey.cc
        </a>
      </li>
      <li>
        <a
          class="link-accent link"
          href="https://misskey.io/@uboar"
          target="_blank"
          rel="noreferrer"
        >
          @uboar@misskey.io
        </a>
      </li>
      <li>
        <a
          class="link-accent link"
          href="https://twitter.com/_uboar_"
          target="_blank"
          rel="noreferrer"
        >
          @_uboar_@twitter.com
        </a>
      </li>
    </ul>
  {/if}
</div>
