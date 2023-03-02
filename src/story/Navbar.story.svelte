<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import "../tailwind.css";
  export let Hst: Hst;

  import Navbar from "../components/Navbar.svelte";
</script>

<Hst.Story>
  <Navbar />
</Hst.Story>
