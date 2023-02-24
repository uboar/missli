<script lang="ts">
    import { onMount } from "svelte";
    import { userDataArray, selfUrl } from "../lib/userdata";
    import { Stream } from "misskey-js";

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

                userDataArray.update((val) => [
                    ...val,
                    {
                        ...sessionRes,
                        hostUrl: hostUrl,
                        stream: new Stream(`https://${hostUrl}`, {
                            token: sessionRes.token,
                        }),
                    },
                ]);
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

            const url = `https://${hostUrl}/miauth/${sessionId}?name=MissLI&permission=write:notes,read:drive&callback=${selfUrl()}?authed=${hostUrl}`;

            location.href = url;
        } catch (err) {
            console.error(err);
            window.alert("認証時にエラーが発生しました");
        }
        //busy = false;
    };
</script>

<div class="flex justify-center m-4">
    <div class="card bg-base-300 md:w-1/2 w-full">
        <div class="card-body">
            <div class="card-title mb-2">ユーザーを追加する</div>
            <input
                type="text"
                class="input"
                disabled={busy}
                bind:value={hostUrl}
                placeholder="インスタンスURL(例:misskey.io)"
                tabindex=0
            />
            <input
                type="submit"
                class={`${
                    hostUrl === "" || busy ? "btn-disabled" : ""
                } btn btn-primary btn-lg`}
                on:click={openMiAuth}
                on:keypress={openMiAuth}
                value="{busy ? "セッションID取得中..." : "認証する"}"
                />
        </div>
    </div>
</div>
