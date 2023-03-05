import { writable, get } from "svelte/store";
import { Stream, api } from "misskey-js";
import type { Channels } from "misskey-js/built/streaming.types";
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

export type userData = {
  ok: boolean;
  id: number;
  sessionId: string;
  token: string;
  userName: string;
  hostUrl: string;
  stream?: Stream;
  cli?: api.APIClient;
  mainConnection?: Connection;
  notifyBuffer?: Array<Notification>;
  notifyUnOpen?: boolean;
  emojis?: Array<{
    aliases: Array<string>;
    name: string;
    category: string;
    url: string;
  }>;
};

export type timelineOptions = {
  id: number;
  userDataIndex?: number;
  channel?: keyof Channels;
  channelName?: string;
  color?: string;
  width?: string;
  showNoteNum?: number;
  bufferNoteNum?: number;
  initialNotes?: Array<Note>;
  reactionDeck?: Array<string>
};

export type settingsType = {
  theme?: string;
  notifyBufferNum: number;
};

export const settings = writable<settingsType>({
  theme: "light",
  notifyBufferNum: 100,
});
export const users = writable<Array<userData>>([]);
export const timelines = writable<Array<timelineOptions>>([]);

/**
 *
 * @param userData
 */
export const setCookie = (userData: userData) => {
  const cookieBuff: userData = {
    id: userData.id,
    sessionId: userData.sessionId,
    token: userData.token,
    hostUrl: userData.hostUrl,
    userName: userData.userName,
    ok: userData.ok,
  };

  document.cookie = `${cookieBuff.id}=${encodeURIComponent(
    JSON.stringify(cookieBuff)
  )}; Max-Age=50000000`;
};

/**
 *
 * @returns
 */
export const getCookie = async (): Promise<Array<userData>> => {
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
      try {
        users[i].emojis = (await users[i].cli.request("emojis")).emojis;
      } catch (err) {
        console.error(err);
        users[i].emojis = [];
        // window.alert("カスタム絵文字一覧の取得に失敗しました。")
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
 *
 * @param userDataIndex
 */
export const deleteUser = (userDataIndex: number) => {
  document.cookie = `${get(users)[userDataIndex].id}=; Max-Age=0`;
  timelines.update((val) => {
    let updateVal = val.filter((v) => v.userDataIndex !== userDataIndex);

    updateVal.forEach((v) => {
      if (v.userDataIndex > userDataIndex) v.userDataIndex -= 1;
    });

    return updateVal;
  });
  users.update((val) => val.splice(userDataIndex, 1));
  location.href = window.location.origin + window.location.pathname;
};

/**
 *
 * @returns
 */
export const selfUrl = () => {
  if (import.meta.env.MODE === "development") return "https://localhost:5173";
  else return "https://uboar.github.io/missli";
};

const timelineLocal = JSON.parse(
  localStorage.getItem("timelines")
) as unknown as Array<timelineOptions>;

const settingsLocal = JSON.parse(
  localStorage.getItem("settings")
) as unknown as settingsType;

if (settingsLocal) settings.set({ ...get(settings), ...settingsLocal });
if (timelineLocal) timelines.set(timelineLocal);

timelines.subscribe((val) => {
  localStorage.setItem("timelines", JSON.stringify(val));
});

settings.subscribe((val) => {
  localStorage.setItem("settings", JSON.stringify(val));
});
