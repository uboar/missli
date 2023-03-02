<script lang="ts">
  import { onMount } from "svelte";
  import { users, selfUrl, setCookie } from "../lib/userdata";
  import type { userData } from "../lib/userdata";
  import { Stream, api } from "misskey-js";

  let hostUrl = "";
  let busy = false;

  onMount(async () => {
    try {
      const queries = new URLSearchParams(window.location.search);
      if (queries.has("authed")) {
        hostUrl = queries.get("authed");
        const sessionId = queries.get("session");
        const res = await fetch(
          `https://${hostUrl}/api/miauth/${sessionId}/check`,
          {
            method: "POST",
          }
        );

        const sessionRes = (await res.json()) as any;

        if (!sessionRes.ok) throw "認証に失敗しました";

        let userdata: userData = {
          ok: sessionRes.ok,
          id: new Date().valueOf(),
          userName: sessionRes.user.username,
          sessionId: sessionId,
          token: sessionRes.token,
          hostUrl: hostUrl,
          stream: new Stream(`https://${hostUrl}`, {
            token: sessionRes.token,
          }),
          cli: new api.APIClient({
            origin: `https://${hostUrl}`,
            credential: sessionRes.token,
          }),
        };

        userdata.emojis = (await userdata.cli.request("emojis")).emojis;

        setCookie(userdata);

        users.update((val) => [...val, userdata]);
        location.href = window.location.origin + window.location.pathname;
      }
    } catch (err) {
      console.error(err);
      window.alert("エラーが発生しました");
    }
  });

  const openMiAuth = async () => {
    busy = true;
    try {
      const sessionId = await (
        await fetch("https://www.uuidgenerator.net/api/version4/1")
      ).text();

      const url = `https://${hostUrl}/miauth/${sessionId}?name=MissLI&permission=write:notes,read:notifications,write:notifications,write:reactions,write:favorites,&callback=${selfUrl()}?authed=${hostUrl}`;

      location.href = url;
    } catch (err) {
      console.error(err);
      window.alert("認証時にエラーが発生しました");
    }
    //busy = false;
  };
</script>

<div class="flex justify-center m-4">
  <div class="card bg-base-300 w-full">
    <div class="card-body">
      <div class="card-title mb-2">ユーザーを追加する</div>
      <input
        type="text"
        class="input"
        disabled={busy}
        bind:value={hostUrl}
        placeholder="インスタンスURL(例:misskey.io)"
        tabindex="0"
      />
      <input
        type="submit"
        class={`${
          hostUrl === "" || busy ? "btn-disabled" : ""
        } btn btn-primary btn-lg`}
        on:click={openMiAuth}
        on:keypress={openMiAuth}
        value={busy ? "セッションID取得中..." : "認証する"}
      />
    </div>
  </div>
</div>
