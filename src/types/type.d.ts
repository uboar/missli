import type {
  Channels,
  NoteUpdatedEvent,
} from "@misskey-js/streaming.types";
import type { Note, Notification } from "@misskey-js/entities";
import type { Connection } from "@misskey-js/streaming";
import { Stream, api } from "@misskey-js";

export type PostNote = {
  text: string;
  visibility?: "public" | "home" | "followers" | "specified";
  cw?: string;
  localOnly?: boolean;
  replyId?: string;
  renoteId?: string;
  channelId?: string;
};

export type UserData = {
  initializeEnded?: boolean;
  ok: boolean;
  isOldVersion?: boolean;
  id: number;
  sessionId?: string;
  token: string;
  userName: string;
  hostUrl: string;
  stream?: Stream;
  cli?: api.APIClient;
  mainConnection?: Connection;
  notifyBuffer?: Array<Notification>;
  notifyUnOpen?: boolean;
  busy?: boolean;
  emojis?: Array<{
    aliases?: Array<string>;
    name: string;
    category?: string;
    url: string;
  }>;

  localStorageOptions?: {
    id: number;
    ignoreCache?: boolean;
    defaultTimelineOptions?: TimelineOptions;
  };
};

export type TimelineOptions = {
  id: number;
  userDataIndex?: number;
  channel?: keyof Channels;
  channelId?: string;
  channelName?: string;
  color?: string;
  width?: string;
  showNoteNum?: number;
  bufferNoteNum?: number;
  initialNotes?: Array<Note>;
  reactionDeck?: Array<string>;
  isCollapsed?: boolean;
  autoCollapse?: boolean;
  notesBuffer?: Array<Note>;
  lowRate?: boolean;
  noteOption?: {
    mediaHide: boolean;
    mediaSize: number;
    reactionHide: boolean;
    reactionSize: number;
    cwShow: boolean;
    nsfwShow: boolean;
    noteCollapse: boolean;
    noteHeight?: number;
  };
};

export type SettingsType = {
  theme?: string;
  notifyBufferNum: number;
};