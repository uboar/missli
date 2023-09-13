import { writable, get } from "svelte/store";
import { Stream, api } from "@misskey-js";
import m from "moment/min/moment-with-locales.min.js";
import uniqBy from "lodash/uniqBy";
import "moment/locale/ja";
import type { SettingsType, UserData, TimelineOptions } from "../types/type";
import type { LiteInstanceMetadata, Notification } from "@misskey-js/entities";

m.locale("ja");

export const moment = m;

// store系

/**
 * 全般設定
 */
export const settings = writable<SettingsType>({
  theme: "light",
  notifyBufferNum: 100,
  insertSpaceBeforeEmoji: false,
  insertSpaceAfterEmoji: true,
  virtualScrollEnabled: false,
  autoGetOldNotes: true,
});

/**
 * ユーザー設定
 */
export const users = writable<Array<UserData>>([]);

/**
 * タイムライン一覧
 */
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

    // localStorage設定の取得
    const userLocalStorage = userLocal.filter((v) => v.id === usersBuff[i].id);
    if (userLocalStorage.length !== 1) {
      usersBuff[i].localStorageOptions = {
        id: usersBuff[i].id,
        ignoreCache: true,
        defaultTimelineOptions: {
          id: 0,
        },
      };
    } else {
      usersBuff[i].localStorageOptions = userLocalStorage[0];
    }

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
        usersBuff[i].notifyBuffer.forEach((elem) => {
          elem = convertNotify(elem);
        });
        usersBuff[i].notifyUnOpen = false;

        usersBuff[i].mainConnection = usersBuff[i].stream.useChannel("main");
        usersBuff[i].mainConnection.on("notification", (notify) => {
          notify = convertNotify(notify);
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
      if (!usersBuff[i].isOldVersion) {
        await getEmojis(
          usersBuff[i],
          usersBuff[i].localStorageOptions.ignoreCache
        );
      } else {
        usersBuff[i].emojis = [];
      }
      usersBuff[i].busy = false;
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
    const users: Array<UserData> = [];
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

let userLocal = JSON.parse(localStorage.getItem("users")) as unknown as Array<
  UserData["localStorageOptions"]
>;

if (settingsLocal) settings.set({ ...get(settings), ...settingsLocal });
if (timelineLocal) timelines.set(timelineLocal);
if (!userLocal) userLocal = [];

const beforePageLeave = () => {
  let timelinesBuffer = get(timelines);
  let settingsBuffer = get(settings);

  timelinesBuffer.forEach((v) => {
    delete v.notesBuffer;
  });

  let userLocalStorage: Array<UserData["localStorageOptions"]> = [];
  get(users).forEach((v) => {
    if (!v.localStorageOptions["id"]) {
      userLocalStorage.push({
        id: v.id,
        ignoreCache: true,
        defaultTimelineOptions: {
          id: 0,
        },
      });
    } else {
      userLocalStorage.push(v.localStorageOptions);
    }
  });

  localStorage.setItem("timelines", JSON.stringify(timelinesBuffer));
  localStorage.setItem("settings", JSON.stringify(settingsBuffer));
  localStorage.setItem("users", JSON.stringify(userLocalStorage));
};
window.addEventListener("pagehide", beforePageLeave);
window.addEventListener("beforeunload", beforePageLeave);

export const getEmojis = async (user: UserData, ignoreCache = false) => {
  try {
    const cache = await caches.open(user.id.toString());

    const cacheMeta = await cache.match("/meta");

    if (cacheMeta === undefined || ignoreCache) {
      let res: LiteInstanceMetadata;
      if (user.hostUrl === "misskey.io") {
        res = (await (
          await fetch("https://misskey.io/api/meta", {
            mode: "cors",
          })
        ).json()) as LiteInstanceMetadata;
        user.emojis = (
          await (
            await fetch("https://misskey.io/api/emojis", {
              mode: "cors",
            })
          ).json()
        ).emojis;
      } else {
        res = await user.cli.request("meta");
        // v13はmetaにemojisが含まれない
        if (res.emojis == null) {
          user.emojis = (await user.cli.request("emojis")).emojis;
        } else {
          user.emojis = res.emojis;
        }
      }
      user.themeColor = res.themeColor;

      // TODO:Misskey-jsのAPIからResponseが帰ってくるオプションが欲しいのでなんとかする
      const cacheResMeta = new Response(JSON.stringify(res));
      cache.put("/meta", cacheResMeta);

      const cacheResEmojis = new Response(JSON.stringify(user.emojis));
      cache.put("/emojis", cacheResEmojis);
    } else {
      const cacheEmojis = await cache.match("/emojis");
      user.emojis = await cacheEmojis.json();
      user.themeColor = (await cacheMeta.json()).themeColor;
    }
  } catch (err) {
    console.error(err);
    user.emojis = [];
    // window.alert("カスタム絵文字一覧の取得に失敗しました。")
  }
};

/**
 *
 * @param notify
 * @returns
 */
export const convertNotify = (notify: Notification): Notification => {
  if (notify.user) {
    notify.user.emojis = convertEmojiBuffer(notify.user.emojis);
  }
  if (notify.note) {
    if (notify.note.reactionEmojis) {
      notify.note.reactionEmojis = convertEmojiBuffer(
        notify.note.reactionEmojis
      );
    }
  }
  return notify;
};

/**
 *
 * @param input
 * @returns
 */
const convertEmojiBuffer = (
  input: UserData["emojis"] | Record<string, string>
): Record<string, string> => {
  if (Array.isArray(input)) {
    let buffer: Record<string, string> = {};
    input.forEach((elem) => {
      buffer[elem.name] = elem.url;
    });
    return buffer;
  } else {
    return input;
  }
};
