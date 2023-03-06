<script lang="ts">
  import { version } from "../../package.json";
  import { onMount } from "svelte";
  import { users, selfUrl, setCookie, deleteUser } from "../lib/userdata";
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
        if (queries.has("userdatanum")) {
          deleteUser(Number(queries.get("userdatanum")), false);
        }
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

      const url = `https://${hostUrl}/miauth/${sessionId}?name=MissLI${
        import.meta.env.MODE === "development" ? "_Dev" : ""
      }_${version}&permission=write:notes,read:channels,write:channels,read:account,write:account,read:drive,write:drive,read:notifications,write:notifications,write:reactions,write:favorites,read:gallery-likes,write:gallery-likes&callback=${selfUrl()}?authed=${hostUrl}`;

      location.href = url;
    } catch (err) {
      console.error(err);
      window.alert("認証時にエラーが発生しました");
    }
    //busy = false;
  };

  const reAuthUser = async (index: number) => {
    hostUrl = $users[index].hostUrl;
    busy = true;
    try {
      const sessionId = await (
        await fetch("https://www.uuidgenerator.net/api/version4/1")
      ).text();

      const url = `https://${hostUrl}/miauth/${sessionId}?name=MissLI${
        import.meta.env.MODE === "development" ? "_Dev" : ""
      }_${version}&permission=write:notes,read:channels,write:channels,read:account,write:account,read:drive,write:drive,read:notifications,write:notifications,write:reactions,write:favorites,read:gallery-likes,write:gallery-likes&callback=${selfUrl()}?userdatanum=${index}%26authed=${hostUrl}`;

      location.href = url;
    } catch (err) {
      console.error(err);
      window.alert("認証時にエラーが発生しました");
    }
  };
</script>

<h1 class="text-2xl">連携しているアカウント</h1>
v1.2.1以前に本アプリを使用した事がある方は、権限設定が変更されているので、お手数ですが再認証して下さい。<br
/>
また、再認証・認証解除をした場合は、Misskeyの"設定 > API > アクセストークンの管理"から古いアクセストークンを削除して下さい。
{#if $users.length === 0}
  <br />ユーザーデータがありません
{/if}
{#each $users as user, index (user.id)}
  <div class="card bg-base-300 card-compact w-full my-2">
    <div class="card-body">
      <div class="card-actions flex">
        <div class="flex-1 text-l font-bold">
          @{user.userName}@{user.hostUrl}
        </div>
        <button
          class="btn btn-info btn-sm -my-2"
          on:click={() => reAuthUser(index)}>再認証</button
        >
        <button
          class="btn btn-error btn-sm -my-2"
          on:click={() => deleteUser(index)}>連携解除</button
        >
      </div>
    </div>
  </div>
{/each}
<div class="divider-vertical" />
<div class="flex justify-center m-4">
  <div class="card bg-base-300 w-full">
    <div class="card-body">
      <div class="card-title mb-2">認証情報を追加する</div>
      <p>
        追加したいアカウントのインスタンスURL(例：misskey.io)を入力してください。
      </p>
      <p class="text-warning font-bold">
        現在、Misskey
        v12系のインスタンスではカスタム絵文字を正しく取得出来ません。
      </p>
      <input
        type="text"
        class="input"
        disabled={busy}
        bind:value={hostUrl}
        on:keydown={(e) => {
          if (e.code === "Enter") openMiAuth();
        }}
        placeholder="インスタンスURL"
        tabindex="0"
      />
      <input
        type="submit"
        class={`${
          hostUrl === "" || busy ? "btn-disabled" : ""
        } btn btn-primary btn-lg`}
        on:click={openMiAuth}
        value={busy ? "セッションID取得中..." : "認証する"}
      />
    </div>
  </div>
</div>
