<script lang="ts">
    import type { Hst } from "@histoire/plugin-svelte"
    import "../tailwind.css"
    export let Hst: Hst

    import Auth from "../components/Auth.svelte"
    
</script>

<Hst.Story>
    <Auth />
</Hst.Story>
