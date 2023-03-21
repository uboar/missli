import { writable, get } from "svelte/store";
import { Stream, api } from "misskey-js";
import type {
  Channels,
  NoteUpdatedEvent,
} from "misskey-js/built/streaming.types";
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
  };
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
  const cookieBuff: UserData = {
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
export const getCookie = async () => {
  const cookies = document.cookie;

  if (cookies === "") return [];

  const strArr = cookies.split("; ");
  const usersBuff: Array<UserData> = [];

  strArr.forEach((elem) => {
    usersBuff.push({
      ...JSON.parse(decodeURIComponent(elem.replace(/\d+=/, ""))),
      initializeEnded: false,
    });
  });
  users.set(usersBuff);

  for (let i = 0; i < usersBuff.length; i++) {
    usersBuff[i].initializeEnded = false;
    try {
      usersBuff[i].stream = new Stream(`https://${usersBuff[i].hostUrl}`, {
        token: usersBuff[i].token,
      });
      usersBuff[i].cli = new api.APIClient({
        origin: `https://${usersBuff[i].hostUrl}`,
        credential: usersBuff[i].token,
      });

      // 通知の取得
      try {
        usersBuff[i].notifyBuffer = await usersBuff[i].cli.request(
          "i/notifications"
        );
        usersBuff[i].notifyUnOpen = false;

        usersBuff[i].mainConnection = usersBuff[i].stream.useChannel("main");
        usersBuff[i].mainConnection.on("notification", (notify) => {
          usersBuff[i].notifyBuffer = uniqBy(
            [notify, ...usersBuff[i].notifyBuffer].slice(
              0,
              get(settings).notifyBufferNum
            ),
            "id"
          );
          usersBuff[i].notifyUnOpen = true;
        });
      } catch (err) {
        console.error(err);
        usersBuff[i].notifyBuffer = [];
      }

      // カスタム絵文字の取得
      // TODO : Misskey v12以前でちゃんと絵文字を取得出来るようにする。
      if (!usersBuff[i].isOldVersion) {
        try {
          const res = await usersBuff[i].cli.request("meta");

          // v13はmetaにemojisが含まれない
          if (res.emojis == null) {
            usersBuff[i].emojis = (
              await usersBuff[i].cli.request("emojis")
            ).emojis;
          } else {
            usersBuff[i].emojis = res.emojis;
          }
        } catch (err) {
          console.error(err);
          usersBuff[i].emojis = [];
          // window.alert("カスタム絵文字一覧の取得に失敗しました。")
        }
      } else {
        usersBuff[i].emojis = [];
      }
      usersBuff[i].initializeEnded = true;
      users.set(usersBuff);
    } catch (err) {
      console.error(err);
      console.log(`${usersBuff[i].hostUrl}との認証に失敗しました。`);
      window.alert(`${usersBuff[i].hostUrl}との認証に失敗しました。`);
      // Streamがerrorを返さない暫定対応
      usersBuff[i].stream.close();
      usersBuff[i].cli = null;
      usersBuff[i].ok = false;
      usersBuff[i].initializeEnded = false;
    }
  }
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

window.addEventListener("beforeunload", () => {
  let timelinesBuffer = get(timelines);
  let settingsBuffer = get(settings);

  timelinesBuffer.forEach((v) => {
    delete v.notesBuffer;
  });

  localStorage.setItem("timelines", JSON.stringify(timelinesBuffer));
  localStorage.setItem("settings", JSON.stringify(settingsBuffer));
});
