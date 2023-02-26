<script lang="ts">
    import * as mfm from "mfm-js";
    import { onMount } from "svelte";

    type LocalEmojis = Array<{
        aliases: Array<string>;
        name: string;
        category: string;
        url: string
    }>;

    export let text = "";
    let parseedHTML: HTMLElement;
    export let hostUrl: string;
    export let remoteEmojis: Array<{ name: string; url: string }> = [];
    export let localEmojis: LocalEmojis = [];

    onMount(() => {
        const mfmTree = mfm.parse(text);

        mfmTree.forEach((elem) => generateMfmElement(elem, parseedHTML));
    });

    const generateMfmElement = (
        node: mfm.MfmNode,
        parentElemnt: HTMLElement
    ) => {
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
        // カスタム絵文字
        if (node.type === "emojiCode") {
            let elem = document.createElement("img");


            if(remoteEmojis[node.props.name] === undefined){
                elem.src = localEmojis.find(v => v.name === node.props.name).url
            }else{
                elem.src = remoteEmojis[node.props.name]
            }
            elem.className = "h-6 float-left";
            elem.alt = node.props.name;
            parentElemnt.appendChild(elem);
        }
        // インラインコード
        if (node.type === "inlineCode") {
            let elem = document.createElement("span");
            elem.className =
                "font-mono bg-base-300 text-secondary px-1 rounded";
            elem.innerText = node.props.code;
            parentElemnt.appendChild(elem);
        }
        // 太字
        if (node.type === "bold") {
            let elem = document.createElement("b");
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
            elem.innerText = node.props.emoji;
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
                lineElem.setAttribute(
                    "data-prefix",
                    (index + 1) as unknown as string
                );
                elem.appendChild(lineElem);
            });
            elem.className = "mockup-code";
            parentElemnt.appendChild(elem);
        }
    };
</script>

<div bind:this={parseedHTML} />
