<script lang="ts">
  import { version } from "../../package.json";
  import { users } from "../lib/userdata";
  import AddTimeline from "./AddTimeline.svelte";
  import Post from "./Post.svelte";
  import Settings from "./Settings.svelte";
</script>

<div class="navbar bg-primary fixed z-50 shadow-lg w-screen">
  <div class="navbar-start">
    <a
      class="btn btn-ghost normal-case text-xl text-primary-content btn-sm"
      href="https://github.com/uboar/missli"
      target="_blank"
      rel="noreferrer"
    >
      MissLI
      <span class="text-sm mx-4">{version}</span>
    </a>
  </div>
  <div class="navbar-end">
    {#if $users.length > 0}
      <label
        class="btn group gap-2 btn-outline border-accent btn-sm p-1 md:px-16 mx-2 text-accent hover:text-primary-focus"
        for="post-modal"
      >
        <!-- ノートアイコン -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 fill-accent group-hover:fill-primary-focus"
          viewBox="0 0 24 24"
          ><path
            d="M2,21L23,12L2,3V10L17,12L2,14V21Z"
          /></svg
        >
        <span class="hidden md:inline">ノート</span>
      </label>
      <label
        class="btn group gap-2 btn-outline border-primary-content btn-sm p-1 mx-2 text-primary-content hover:text-primary-focus"
        for="addtimeline-modal"
      >
        <!-- +アイコン -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 fill-primary-content group-hover:fill-primary-focus"
          viewBox="0 0 24 24"
          ><path
            d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
          /></svg
        >
        <span class="hidden md:inline">タイムラインを追加</span>
      </label>
    {/if}
    <label
      class="btn group gap-2 btn-outline border-primary-content btn-sm p-1 mx-2 text-primary-content hover:text-primary-focus"
      for="settings-modal"
    >
      <!-- 設定アイコン -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        class="h-6 w-6 fill-primary-content group-hover:fill-primary-focus"
        ><path
          d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z"
        /></svg
      >
      <span class="hidden md:inline">設定</span>
    </label>
  </div>
</div>

<input type="checkbox" id="post-modal" class="modal-toggle" />
<div class="modal">
  <Post />
</div>

<input type="checkbox" id="addtimeline-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <AddTimeline />
    <div class="modal-action">
      <label for="addtimeline-modal" class="btn btn-primary w-40">閉じる</label>
    </div>
  </div>
</div>

<input type="checkbox" id="settings-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box md:w-11/12 md:max-w-5xl h-4/5">
    <Settings />
    <div class="modal-action">
      <label for="settings-modal" class="btn btn-primary w-40">閉じる</label>
    </div>
  </div>
</div>
