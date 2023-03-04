<script lang="ts">
  import Auth from "./Auth.svelte";
  import { version } from "../../package.json";
  import { settings, users, deleteUser } from "../lib/userdata";

  let selectedTab = 0;

  const tabs = [
    { name: "アカウントの設定", value: 0 },
    { name: "全般設定", value: 1 },
    { name: "missLIについて", value: 2 },
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
    <h1 class="text-2xl">連携しているアカウント</h1>
    2023/03/02以前に本アプリを使用した事がある方は、権限設定が変更されているので、お手数ですが再認証して下さい。
    {#if $users.length === 0}
      ユーザーデータがありません
    {/if}
    {#each $users as user, index (user.id)}
      <div class="card bg-base-300 card-compact w-full my-2">
        <div class="card-body">
          <div class="card-actions flex">
            <div class="flex-1 text-xl font-bold">
              @{user.userName}@{user.hostUrl}
            </div>
            <btn
              class="btn btn-error -my-2"
              on:click={deleteUser(index)}
              on:keypress={deleteUser(index)}>連携解除</btn
            >
          </div>
        </div>
      </div>
    {/each}
    <div class="divider-vertical" />
    <Auth />
  {:else if selectedTab === 1}
    <span class="label-text">カラーテーマ</span>
    <select bind:value={$settings.theme} class="select select-bordered w-full">
      {#each themes as theme}
        <option>{theme}</option>
      {/each}
    </select>
  {:else if selectedTab === 2}
    <h1 class="font-bold text-3xl">missLI {version}</h1>
    <h2 class="font-bold text-lg">リポジトリ</h2>
    <a
      class="link link-accent"
      href="https://github.com/uboar/missli"
      target="_blank"
      rel="noreferrer"
    >
      uboar/missli
    </a>
    <h2 class="font-bold text-lg">不具合報告 / 不具合を探す</h2>
    <a
      class="link link-accent"
      href="https://github.com/uboar/missli/issues"
      target="_blank"
      rel="noreferrer"
    >
      uboar/missl/issues
    </a>
    <h2 class="font-bold text-lg">連絡先</h2>
    <ul>
      <li>
        <a
          class="link link-accent"
          href="https://github.com/uboar"
          target="_blank"
          rel="noreferrer"
        >
          @uboar@github.com
        </a>
      </li>
      <li>
        <a
          class="link link-accent"
          href="https://nicomedkey.cc/@uboar"
          target="_blank"
          rel="noreferrer"
        >
          @uboar@nicomedkey.cc
        </a>
      </li>
      <li>
        <a
          class="link link-accent"
          href="https://misskey.io/@uboar"
          target="_blank"
          rel="noreferrer"
        >
          @uboar@misskey.io
        </a>
      </li>
      <li>
        <a
          class="link link-accent"
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
