import type { Note } from "@misskey-js/entities";

// TODO:バージョン違いに対応できる型定義を作る
export type NoteWrapper = Note & {
  hostType?: "misskeyDefault" | "misskeyV12" | "firefish" | "other";
  reactionEmojis?: any;
};
