import { writable, get } from "svelte/store";
import { Stream, api } from "misskey-js";
import type { Channels, NoteUpdatedEvent } from "misskey-js/built/streaming.types";
import type { Note, Notification } from "misskey-js/built/entities";
import m from "moment/min/moment-with-locales.min.js";
import uniqBy from "lodash/uniqBy";
import "moment/locale/ja";
import type { Connection } from "misskey-js/built/streaming";

m.locale("ja");

export const moment = m;

export type postNote = {
  text: string;
  visibility?: "public" | "home" | "followers" | "specified";
  cw?: string;
  localOnly?: boolean;
  replyId?: string;
  renoteId?: string;
  channelId?: string;
};

export type UserData = {
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
  emojis?: Array<{
    aliases?: Array<string>;
    name: string;
    category?: string;
    url: string;
  }>;
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
  notesBuffer?: Array<Note>;
  noteOption?: {
    mediaHide: boolean;
    reactionHide: boolean;
    cwShow: boolean;
    nsfwShow: boolean;
    noteCollapse: boolean;
    noteHeight?: number;
  }
};

export type SettingsType = {
  theme?: string;
  notifyBufferNum: number;
};

export const settings = writable<SettingsType>({
  theme: "light",
  notifyBufferNum: 100,
});
export const users = writable<Array<UserData>>([]);
export const timelines = writable<Array<TimelineOptions>>([]);

/**
 * @description クッキーに認証情報を追加する
 * @param userData
 */
export const setCookie = (userData: UserData) => {
  const cookieBuff: userData = {
    id: userData.id,
    sessionId: userData.sessionId,
    token: userData.token,
    hostUrl: userData.hostUrl,
    userName: userData.userName,
    isOldVersion: userData.isOldVersion,
    ok: userData.ok,
  };

  document.cookie = `${cookieBuff.id}=${encodeURIComponent(
    JSON.stringify(cookieBuff)
  )}; Max-Age=50000000`;
};

/**
 * @description クッキーから認証情報を取得する
 * @returns
 */
export const getCookie = async (): Promise<Array<UserData>> => {
  const cookies = document.cookie;

  if (cookies === "") return [];

  const strArr = cookies.split("; ");
  const users: Array<userData> = [];

  strArr.forEach((elem) => {
    users.push(JSON.parse(decodeURIComponent(elem.replace(/\d+=/, ""))));
  });

  for (let i = 0; i < users.length; i++) {
    try {
      users[i].stream = new Stream(`https://${users[i].hostUrl}`, {
        token: users[i].token,
      });
      users[i].cli = new api.APIClient({
        origin: `https://${users[i].hostUrl}`,
        credential: users[i].token,
      });

      // 通知の取得
      try {
        users[i].notifyBuffer = await users[i].cli.request("i/notifications");
        users[i].notifyUnOpen = false;

        users[i].mainConnection = users[i].stream.useChannel("main");
        users[i].mainConnection.on("notification", (notify) => {
          users[i].notifyBuffer = uniqBy(
            [notify, ...users[i].notifyBuffer].slice(
              0,
              get(settings).notifyBufferNum
            ),
            "id"
          );
          users[i].notifyUnOpen = true;
        });
      } catch (err) {
        console.error(err);
        users[i].notifyBuffer = [];
      }

      // カスタム絵文字の取得
      // TODO : Misskey v12以前でちゃんと絵文字を取得出来るようにする。
      if (!users[i].isOldVersion) {
        try {
          users[i].emojis = (await users[i].cli.request("emojis")).emojis;
        } catch (err) {
          console.error(err);
          users[i].emojis = [];
          // window.alert("カスタム絵文字一覧の取得に失敗しました。")
        }
      } else {
        users[i].emojis = [];
      }
    } catch (err) {
      console.error(err);
      console.log(`${users[i].hostUrl}との認証に失敗しました。`);
      window.alert(`${users[i].hostUrl}との認証に失敗しました。`);
      // Streamがerrorを返さない暫定対応
      users[i].stream.close();
      users[i].cli = null;
      users[i].ok = false;
    }
  }
  return users;
};

/**
 * @description クッキーから認証情報を削除する
 * @param userDataIndex
 */
export const deleteUser = (
  userDataIndex: number,
  firstAuth: boolean = true
) => {
  if (firstAuth) {
    document.cookie = `${get(users)[userDataIndex].id}=; Max-Age=0`;
    timelines.update((val) => {
      let updateVal = val.filter((v) => v.userDataIndex !== userDataIndex);

      updateVal.forEach((v) => {
        if (v.userDataIndex > userDataIndex) v.userDataIndex -= 1;
      });

      return updateVal;
    });
  } else {
    const cookies = document.cookie;

    if (cookies === "") return [];

    const strArr = cookies.split("; ");
    const users: Array<userData> = [];
    strArr.forEach((elem) => {
      users.push(JSON.parse(decodeURIComponent(elem.replace(/\d+=/, ""))));
    });

    document.cookie = `${users[userDataIndex].id}=; Max-Age=0`;

    timelines.update((val) => {
      let updateVal = val.map((v) => {
        if (v.userDataIndex !== userDataIndex) {
          if (v.userDataIndex > userDataIndex) v.userDataIndex -= 1;
        } else {
          v.userDataIndex = val.length - 1;
        }

        return v;
      });

      return updateVal;
    });
  }
  users.update((val) => val.splice(userDataIndex, 1));
  if (firstAuth) {
    location.href = window.location.origin + window.location.pathname;
  }
};

const timelineLocal = JSON.parse(
  localStorage.getItem("timelines")
) as unknown as Array<TimelineOptions>;

const settingsLocal = JSON.parse(
  localStorage.getItem("settings")
) as unknown as SettingsType;

if (settingsLocal) settings.set({ ...get(settings), ...settingsLocal });
if (timelineLocal) timelines.set(timelineLocal);

timelines.subscribe((val) => {
  localStorage.setItem("timelines", JSON.stringify(val));
});

settings.subscribe((val) => {
  localStorage.setItem("settings", JSON.stringify(val));
});
