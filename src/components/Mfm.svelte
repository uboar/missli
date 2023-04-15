<script lang="ts">
  import * as mfm from "mfm-js";
  import { onMount } from "svelte";
  import type { UserData } from "../types/type";
  import twemoji from "twemoji";

  $: localEmojiSearch;

  const localEmojiSearch = (emojiName: string): string => {
    try {
      return localEmojis.find((v) => v.name === emojiName).url;
    } catch (err) {
      console.error(err);
      return "エラー";
    }
  };

  let parsedHTML: HTMLElement;
  export let text = "";
  export let hostUrl: string;
  export let remoteEmojis: Array<{ name: string; url: string }> = [];
  export let localEmojis: UserData["emojis"] = [];
  export let emojiHeight = "";

  onMount(() => {
    const mfmTree = mfm.parse(text);

    mfmTree.forEach((elem) => generateMfmElement(elem, parsedHTML));
  });

  const generateMfmElement = (node: mfm.MfmNode, parentElemnt: HTMLElement) => {
    // 中央揃え
    if (node.type === "center") {
      let elem = document.createElement("div");
      elem.className = "text-center";
      parentElemnt.appendChild(elem);
      node.children.forEach((child) => generateMfmElement(child, elem));
    }
    // 関数
    if (node.type === "fn") {
      let elem = document.createElement("span");
      parentElemnt.appendChild(elem);
      node.children.forEach((child) => generateMfmElement(child, elem));
    }
    // テキスト
    if (node.type === "text") {
      let elem = document.createElement("span");
      elem.innerText = node.props.text;
      parentElemnt.appendChild(elem);
    }
    // 検索
    if (node.type === "search") {
      let inputGroup = document.createElement("div");
      inputGroup.className = "input-group w-full";
      let input = document.createElement("input");
      input.type = "text";
      input.readOnly = true;
      input.value = node.props.query
      input.className = "input input-sm input-bordered readonly w-10/12"
      let button = document.createElement("a");
      button.className = "btn btn-square btn-sm w-2/12"
      button.href = `https://www.google.com/search?q=${node.props.query}`
      button.target = "_blank";
      button.innerText = "検索";
      button.rel = "noreferrer";
      inputGroup.appendChild(input);
      inputGroup.appendChild(button);
      
      parentElemnt.appendChild(inputGroup);
    }
    // カスタム絵文字
    if (node.type === "emojiCode") {
      let elem = document.createElement("img");

      if (remoteEmojis[node.props.name] === undefined) {
        elem.src = localEmojiSearch(node.props.name);
      } else {
        elem.src = remoteEmojis[node.props.name];
      }
      if (emojiHeight === "") elem.className = "h-6 inline-flex";
      else elem.className = emojiHeight + " inline-flex";
      elem.alt = node.props.name;
      elem.title = node.props.name;
      parentElemnt.appendChild(elem);
    }
    // インラインコード
    if (node.type === "inlineCode") {
      let elem = document.createElement("span");
      elem.className = "font-mono bg-base-300 text-primary px-1 rounded";
      elem.innerText = node.props.code;
      parentElemnt.appendChild(elem);
    }
    // 太字
    if (node.type === "bold") {
      let elem = document.createElement("b");
      parentElemnt.appendChild(elem);
      node.children.forEach((child) => generateMfmElement(child, elem));
    }
    // 引用
    if (node.type === "quote") {
      let elem = document.createElement("div");
      elem.className =
        "border-l-2 border-base-content pl-2 rounded-sm bg-base-200";
      parentElemnt.appendChild(elem);
      node.children.forEach((child) => generateMfmElement(child, elem));
    }
    // イタリック
    if (node.type === "italic") {
      let elem = document.createElement("i");
      parentElemnt.appendChild(elem);
      node.children.forEach((child) => generateMfmElement(child, elem));
    }
    // 打ち消し線
    if (node.type === "strike") {
      let elem = document.createElement("s");
      parentElemnt.appendChild(elem);
      node.children.forEach((child) => generateMfmElement(child, elem));
    }
    // 小さい字
    if (node.type === "small") {
      let elem = document.createElement("span");
      elem.className = "text-xs";
      parentElemnt.appendChild(elem);
      node.children.forEach((child) => generateMfmElement(child, elem));
    }
    // UNICODE絵文字
    if (node.type === "unicodeEmoji") {
      let elem = document.createElement("span");
      let classes = "object-scale-down inline-flex ";
      if (emojiHeight === "") classes += "h-6";
      else classes += emojiHeight;
        elem.innerHTML = twemoji.parse(node.props.emoji, {
          className: classes,
        });
      parentElemnt.appendChild(elem);
    }
    // メンション
    if (node.type === "mention") {
      let elem = document.createElement("a");
      elem.className = "badge badge-outline badge-accent";
      elem.href = `https://${hostUrl}/${node.props.acct}`;
      elem.target = "_blank";
      elem.rel = "noreferrer";
      elem.innerText = node.props.acct;
      parentElemnt.appendChild(elem);
    }
    // ハッシュタグ
    if (node.type === "hashtag") {
      let elem = document.createElement("a");
      elem.className = "link link-accent";
      elem.href = `https://${hostUrl}/tags/${node.props.hashtag}`;
      elem.target = "_blank";
      elem.rel = "noreferrer";
      elem.innerText = "#" + node.props.hashtag;
      parentElemnt.appendChild(elem);
    }
    // URL
    if (node.type === "url") {
      let elem = document.createElement("a");
      elem.className = "link link-accent";
      elem.href = node.props.url;
      elem.target = "_blank";
      elem.rel = "noreferrer";
      elem.innerText = node.props.url;
      parentElemnt.appendChild(elem);
    }
    // リンク
    if (node.type === "link") {
      let elem = document.createElement("a");
      elem.className = "link link-accent";
      elem.href = node.props.url;
      elem.target = "_blank";
      elem.rel = "noreferrer";
      parentElemnt.appendChild(elem);
      node.children.forEach((child) => generateMfmElement(child, elem));
    }
    // コードブロック
    if (node.type === "blockCode") {
      let elem = document.createElement("div");
      const lines = node.props.code.split("\n");

      lines.forEach((line, index) => {
        let lineElem = document.createElement("pre");
        lineElem.innerHTML = `<code>${line}</code>`;
        lineElem.setAttribute("data-prefix", (index + 1) as unknown as string);
        elem.appendChild(lineElem);
      });
      elem.className = "mockup-code";
      parentElemnt.appendChild(elem);
    }
  };
</script>

<div bind:this={parsedHTML} />
