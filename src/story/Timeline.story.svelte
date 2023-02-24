<script lang="ts">
    import type { Hst } from "@histoire/plugin-svelte";
    import "../tailwind.css";

    import notes from "./assets/timeline.json"

    export let Hst: Hst;

    let timelineName = "タイムライン";

    import Timeline from "../components/Timeline.svelte";
</script>

<Hst.Story>
    <Timeline dummy {timelineName} {notes} />

    <svelte:fragment slot="controls">
        TimelineName: <input type="text" bind:value={timelineName} />
    </svelte:fragment>
</Hst.Story>
