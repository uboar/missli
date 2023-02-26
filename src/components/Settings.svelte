<script lang="ts">
    import Auth from "./Auth.svelte";

    let selectedTab = 0;

    const tabs = [{ name: "アカウントの追加", value: 0 }];
</script>

<div>
    <div class="tabs">
        {#each tabs as tab, index (tab.value)}
            <button
                class="tab tab-bordered {selectedTab === tab.value
                    ? 'tab-active'
                    : ''}"
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
        <Auth />
    {/if}
</div>
