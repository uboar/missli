<script lang="ts">
  import { onMount } from "svelte";
  import { version } from "../../package.json";
  import { marked } from "marked";

  let md = "";
  onMount(async () => {
    md = (
      await (
        await fetch("https://api.github.com/repos/uboar/missli/releases/latest")
      ).json()
    ).body;
    console.log(md);
  });
</script>

<div>
  <div class="text-2xl font-bold">MissLIが更新されました！</div>
  <div class="text-lg font-bold">
    Version {version}
  </div>
  <article class="prose my-2 max-h-64 overflow-y-scroll overscroll-y-none">
    {@html marked(md)}
  </article>
  <div>
    <a
      href="https://github.com/uboar/missli/releases"
      target="_blank"
      rel="noreferrer"
      class="btn-primary btn-outline btn-block btn"
    >
      GitHubでリリースノートを見る
    </a>
  </div>
</div>
