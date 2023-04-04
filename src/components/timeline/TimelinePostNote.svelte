<script lang="ts">
  import type { Note as NoteType } from "misskey-js/built/entities";
  import { createEventDispatcher, onMount, tick } from "svelte";
  import type {
    postNote as postNoteType,
    TimelineOptions,
    UserData,
  } from "../../lib/userdata";
  import Note from "../Note.svelte";
  import Mfm from "../Mfm.svelte";
  import ReactionDeck from "../note/ReactionDeck.svelte";

  export let postNote: postNoteType;
  export let user: UserData | null = null;
  export let replyNote: NoteType | null = null;
  export let renoteNote: NoteType | null = null;
  export let option: TimelineOptions = {
    id: 0,
    noteOption: {
      mediaHide: false,
      reactionSize: 16,
      reactionHide: false,
      cwShow: false,
      nsfwShow: false,
      noteCollapse: true,
    },
  };

  const dispatch = createEventDispatcher();

  onMount(() => {
    if (!user) return;
    focusNoteText.focus();
  });

  let noteBusy = false;
  let showCw = false;
  let keepOpen = false;
  let preview = false;
  let showReactionDeck = false;

  let focusNoteText: HTMLTextAreaElement;

  const noteVisibilityEnum = [
    {
      name: "パブリック",
      value: "public",
    },
    {
      name: "ホーム",
      value: "home",
    },
    {
      name: "フォロワー",
      value: "followers",
    },
  ];

  const deleteAttachNote = () => {
    replyNote = null;
    renoteNote = null;
  };

  const sendNote = async () => {
    noteBusy = true;
    if (user.busy) return;
    try {
      let postNoteBuff = { ...postNote };

      if (!showCw) delete postNoteBuff.cw;

      if (renoteNote) {
        if (postNoteBuff.text === "") delete postNoteBuff.text;
        postNoteBuff.renoteId = renoteNote.id;
      } else if (replyNote) {
        postNoteBuff.replyId = replyNote.id;
      }

      await user.cli.request("notes/create", postNoteBuff);
      postNote.text = "";
      postNote.cw = "";
      renoteNote = null;
      replyNote = null;
      noteBusy = false;
      if (option.lowRate) {
        user.busy = true;
        window.setTimeout(() => {
          user.busy = false;
        }, 5000);
      }
      if (!keepOpen) dispatch("breakRequest");
    } catch (err) {
      console.error(err);
      noteBusy = false;
    }
  };

  const updateInput = async () => {
    if (preview) {
      preview = false;
      await tick();
      preview = true;
    }
  };

  const addEmoji = (e: CustomEvent) => {
    postNote.text += e.detail.replace("@.", "");
    updateInput();
  };

  $: renoteText = () => {
    if (renoteNote && postNote.text === "") return "リノートする";
    else if (renoteNote) return "引用リノートする";
    else if (replyNote) return "返信する";
    else return "ノートする";
  };

  $: disablePost = () => {
    if (postNote.text === "" && !renoteNote) return true;
    return false;
  };
</script>

<div class="card card-compact">
  <div class="card-body">
    {#if replyNote || renoteNote}
      <div class="flex justify-between">
        {#if replyNote}
          <span class="badge badge-outline badge-info mt-1">↩️返信</span>
        {/if}
        {#if renoteNote}
          <span class="badge badge-outline badge-accent mt-1">🔁リノート</span>
        {/if}
        <button
          class="btn btn-xs btn-warning fill-warning-content"
          on:click={deleteAttachNote}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="h-4 w-4"
            ><path
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
            /></svg
          >
        </button>
      </div>
      {#if replyNote}
        <div class="border border-info rounded">
          <Note compact bind:note={replyNote} {user} timelineOptions={option} />
        </div>
      {:else if renoteNote}
        <div class="border border-accent rounded">
          <Note
            compact
            bind:note={renoteNote}
            {user}
            timelineOptions={option}
          />
        </div>
      {/if}
    {/if}
    {#if preview}
      <Mfm
        bind:text={postNote.text}
        hostUrl={user.hostUrl}
        remoteEmojis={[]}
        localEmojis={user.emojis}
      />
    {/if}
    <div class="flex justify-between w-full">
      <div class="form-control -my-3 w-fit">
        <label class="label cursor-pointer">
          <span class="label-text mx-2">プレビュー</span>
          <input
            type="checkbox"
            class="checkbox bg-base-100"
            bind:checked={preview}
          />
        </label>
      </div>
      <div class="form-control -my-3 w-fit">
        <label class="label cursor-pointer">
          <span class="label-text mx-2">投稿してもウィンドウを閉じない</span>
          <input
            type="checkbox"
            class="checkbox bg-base-100"
            bind:checked={keepOpen}
          />
        </label>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="form-control flex-1">
        <span class="label-text">公開範囲</span>
        <select
          class="select select-bordered select-sm"
          bind:value={postNote.visibility}
        >
          {#each noteVisibilityEnum as noteVisibility (noteVisibility.name)}
            <option value={noteVisibility.value}>{noteVisibility.name}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col">
        <div class="form-control -my-1">
          <label class="label cursor-pointer">
            <span class="label-text mx-2">連合なし</span>
            <input
              type="checkbox"
              class="checkbox bg-base-100"
              bind:checked={postNote.localOnly}
            />
          </label>
        </div>
        <div class="form-control -my-1">
          <label class="label cursor-pointer">
            <span class="label-text mx-2">CW</span>
            <input
              type="checkbox"
              class="checkbox bg-base-100"
              bind:checked={showCw}
            />
          </label>
        </div>
      </div>
    </div>
    {#if showCw}
      <input
        type="text"
        class="input input-sm input-bordered"
        placeholder="CW"
        bind:value={postNote.cw}
      />
    {/if}
    <textarea
      class="textarea textarea-bordered"
      bind:this={focusNoteText}
      bind:value={postNote.text}
      placeholder="ノートする内容を入力して下さい！"
      on:keydown={(e) => {
        if (e.ctrlKey && e.code === "Enter") sendNote();
      }}
      on:input={updateInput}
    />
    <div class="card-actions">
      {#if showReactionDeck}
        <div class="p-2 w-full overflow-hidden">
          <ReactionDeck
            {user}
            customReactionDeck={option.reactionDeck}
            size={option.noteOption.reactionSize}
            on:breakRequest={addEmoji}
          />
        </div>
      {:else}
        <button
          class="btn btn-block btn-xs btn-outline normal-case"
          on:click={() => {
            showReactionDeck = true;
          }}>絵文字を追加</button
        >
      {/if}
      <button
        class="btn btn-block btn-sm btn-primary normal-case {noteBusy ||
        disablePost() ||
        user.busy
          ? 'btn-disabled'
          : ''}"
        on:click={sendNote}
      >
        {user.userName}@{user.hostUrl}で{renoteText()}
      </button>
    </div>
  </div>
</div>
