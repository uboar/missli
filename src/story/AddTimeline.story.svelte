<script lang="ts">
    import type { Hst } from "@histoire/plugin-svelte"
    import "../tailwind.css"
    export let Hst: Hst

    import AddTimeline from "../components/AddTimeline.svelte"
    
</script>

<Hst.Story>
    <AddTimeline />
</Hst.Story>
