<script lang="ts">
  import { version } from "../../package.json";
  import { onMount } from "svelte";
  import { users, setCookie, deleteUser } from "../lib/userdata";
  import type { UserData } from "../lib/userdata";
  import { Stream, api } from "misskey-js";

  let hostUrl = "";
  let busy = false;

  onMount(async () => {
    try {
      const queries = new URLSearchParams(window.location.search);
      if (queries.has("authed")) {
        hostUrl = decodeURIComponent(queries.get("authed"));
        const sessionId = queries.get("session");
        const res = await fetch(
          `https://${hostUrl}/api/miauth/${sessionId}/check`,
          {
            method: "POST",
          }
        );

        const sessionRes = (await res.json()) as any;

        if (!sessionRes.ok) throw "認証に失敗しました";

        let userdata: UserData = {
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
    hostUrl = hostUrl.replace("https://", "");
    if(hostUrl.endsWith("/")) hostUrl = hostUrl.slice(0, -1);
    busy = true;
    try {
      const sessionId = await (
        await fetch("https://www.uuidgenerator.net/api/version4/1")
      ).text();

      const url = `https://${hostUrl}/miauth/${sessionId}?name=MissLI${
        import.meta.env.MODE === "development" ? "_Dev" : ""
      }_${version}&permission=write:notes,read:channels,write:channels,read:account,write:account,read:drive,write:drive,read:notifications,write:notifications,write:reactions,write:favorites,read:gallery-likes,write:gallery-likes&callback=${
        window.location.origin + window.location.pathname
      }?authed=${encodeURIComponent(hostUrl)}`;

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
      }_${version}&permission=write:notes,read:channels,write:channels,read:account,write:account,read:drive,write:drive,read:notifications,write:notifications,write:reactions,write:favorites,read:gallery-likes,write:gallery-likes&callback=${
        window.location.origin + window.location.pathname
      }?userdatanum=${index}%26authed=${encodeURIComponent(hostUrl)}`;

      location.href = url;
    } catch (err) {
      console.error(err);
      window.alert("認証時にエラーが発生しました");
    }
  };

  const directAuth = async () => {
    try {
      hostUrl = hostUrl.replace("https://", "");
      let userdata: UserData = {
        ok: true,
        isOldVersion: true,
        id: new Date().valueOf(),
        userName: directUserId,
        token: directToken,
        hostUrl: hostUrl,
        stream: new Stream(`https://${hostUrl}`, {
          token: directToken,
        }),
        cli: new api.APIClient({
          origin: `https://${hostUrl}`,
          credential: directToken,
        }),
      };
      setCookie(userdata);
      users.update((val) => [...val, userdata]);
      location.href = window.location.origin + window.location.pathname;
    } catch (err) {
      console.error(err);
      window.alert("認証時にエラーが発生しました");
    }
  };

  let selectedTab = 0;
  let directToken = "";
  let directUserId = "";
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
          class="btn btn-info btn-sm -my-2 {user.isOldVersion
            ? 'btn-disabled'
            : ''}"
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
      <div class="card-title -mt-4">
        <div class="flex flex-col">
          <h2 class="text-xl font-bold">ユーザーの追加</h2>
          <div class="tabs">
            <button
              class="tab tab-bordered {selectedTab === 0 ? 'tab-active' : ''}"
              on:click={() => (selectedTab = 0)}>MiAuth</button
            >
            <button
              class="tab tab-bordered {selectedTab === 1 ? 'tab-active' : ''}"
              on:click={() => (selectedTab = 1)}
              >アクセストークンの直接入力</button
            >
          </div>
        </div>
      </div>
      {#if selectedTab === 0}
        <h2 class="text-xl font-bold">MiAuth認証</h2>
        <p>
          追加したいアカウントのサーバーURL(例：misskey.io)を入力してください。
        </p>
        <p class="text-warning font-bold">
          現在、Misskey v11以前のサーバーでカスタム絵文字を正しく取得出来ない場合があります。
        </p>
        <input
          type="text"
          class="input"
          disabled={busy}
          bind:value={hostUrl}
          on:keydown={(e) => {
            if (e.code === "Enter") openMiAuth();
          }}
          placeholder="ホストURL"
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
      {:else if selectedTab === 1}
        <h2 class="text-xl font-bold">アクセストークンの直接入力</h2>
        <p>
          取得したアクセストークンを直接入力します。MiAuth認証に対応していない古いバージョンのMisskeyを使用する際に使用して下さい。
        </p>
        <div class="form-control">
          <span class="label-text">ホストURL</span>
          <input
            type="text"
            bind:value={hostUrl}
            class="input"
            placeholder="ホストURL"
          />
          <span class="label-text">ユーザーID</span>
          <input
            type="text"
            bind:value={directUserId}
            class="input"
            placeholder="ユーザーID"
          />
          <span class="label-text">アクセストークン</span>
          <input
            type="password"
            bind:value={directToken}
            class="input"
            placeholder="アクセストークン"
          />
          <button
            class="btn btn-primary btn-lg btn-block {hostUrl === '' ||
            directToken === '' ||
            directUserId === ''
              ? 'btn-disabled'
              : ''}"
            on:click={directAuth}
          >
            認証する
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
