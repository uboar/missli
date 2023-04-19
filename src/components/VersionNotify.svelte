<script lang="ts">
  import { onMount } from "svelte";
  import { version } from "../../package.json";
  import { marked } from "marked";

  let md = "";
  marked.setOptions({
    breaks: true,
  });
  onMount(async () => {
    md = (
      await (
        await fetch("https://api.github.com/repos/uboar/missli/releases/latest")
      ).json()
    ).body;
  });
</script>

<div>
  <div class="text-2xl font-bold">MissLIが更新されました！</div>
  <div class="text-lg font-bold">
    Version {version}
  </div>
  {@html marked(md)}
  <div>
    <a
      href="https://github.com/uboar/missli/releases"
      target="_blank"
      rel="noreferrer"
      class="btn btn-primary btn-outline btn-block"
    >
      GitHubでリリースノートを見る
    </a>
  </div>
</div>
