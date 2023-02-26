<script lang="ts">
    import type { Hst } from "@histoire/plugin-svelte"
    import "../tailwind.css"
    export let Hst: Hst

    import Settings from "../components/Settings.svelte"
    
</script>

<Hst.Story>
    <Settings />
</Hst.Story>
