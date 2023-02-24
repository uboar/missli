<script lang="ts">
    import { onMount } from "svelte";
    import type { miApiAuthResponse } from "../lib/miApiResponse";

    let link = "";

    let token: null | string = null;

    const host = "nicomedkey.cc";
    const queries = new URLSearchParams(window.location.search);

    let messages = []

    onMount(async () => {
        try {
            if (queries.has("authed")) {
                const sessionId = queries.get("session");
                const res = await fetch(
                    `https://${host}/api/miauth/${sessionId}/check`,
                    {
                        method: "POST",
                    }
                );

                const sessionRes = (await res.json()) as miApiAuthResponse;

                console.log(sessionRes);
                if (!sessionRes.ok) throw "認証に失敗しました";
                token = sessionRes.token!;
                ws();
            } else {
                const self = "http://172.27.91.203:5173?authed=true";

                const res = await fetch(
                    "https://www.uuidgenerator.net/api/version4/1"
                );
                const uuid = await res.text();
                console.info("UUID : " + uuid);

                link =
                    `${host}/miauth/` +
                    uuid +
                    `?name=MissLI&permission=write:notes,read:drive&callback=${self}`;
            }
        } catch (err) {
            // 認証失敗
            console.error(err);
        }
    });

    const ws = () => {
        try {
            const socket = new WebSocket(`wss://nicomedkey.cc?i=${token}`);

            const connectData = {
                type: 'connect',
                body: {
                    channel: 'globalTimeline',
                    id: 'global',
                }
            }

            socket.onopen = (e) => {
                socket.send(JSON.stringify(connectData))
            }

            socket.onmessage = (e) => {
                const data = JSON.parse(e.data)
                console.log(data)
                messages = [...messages, data]
            }

            socket.onerror = (e) => {
                throw e
            }
        } catch (err) {
            console.error(err);
        }
    };
</script>

{#if !token}
    <div class="text-center">
        <a href={link} class="btn">アクセストークンの取得</a>
    </div>
{:else}
    <div>
        {#each messages as message }
            <div class="card">
                <div class="card-body">
                    {message.body.body.text}
                </div>
            </div>
        {/each}
    </div>
{/if}
