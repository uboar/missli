<script lang="ts">
  import { settings } from "@/lib/userdata";

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

<h1 class="mb-2 text-2xl font-bold">全般設定</h1>
<div class="form-control mt-2">
  <span class="label-text">カラーテーマ</span>
  <select bind:value={$settings.theme} class="select select-bordered w-full">
    {#each themes as theme}
      <option>{theme}</option>
    {/each}
  </select>
  <label class="label cursor-pointer">
    <span class="label-text"
      >カスタム絵文字の挿入時に半角スペースを付与する（前）</span
    >
    <input
      type="checkbox"
      bind:checked={$settings.insertSpaceBeforeEmoji}
      class="checkbox"
    />
  </label>
  <label class="label cursor-pointer">
    <span class="label-text"
      >カスタム絵文字の挿入時に半角スペースを付与する（後）</span
    >
    <input
      type="checkbox"
      bind:checked={$settings.insertSpaceAfterEmoji}
      class="checkbox"
    />
  </label>
  <label class="label cursor-pointer">
    <span class="label-text"
      >仮想スクロールを有効にする（ノートの表示パフォーマンスが向上しますが、「高さの大きいノートを自動で畳む」機能が正しく動作しなくなります</span
    >
    <input
      type="checkbox"
      bind:checked={$settings.virtualScrollEnabled}
      class="checkbox"
    />
  </label>
  <label class="label cursor-pointer">
    <span class="label-text"
      >タイムラインを一番下までスクロールした時に、自動で古いノートを取得する</span
    >
    <input
      type="checkbox"
      bind:checked={$settings.autoGetOldNotes}
      class="checkbox"
    />
  </label>
</div>
