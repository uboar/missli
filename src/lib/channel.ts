import type { Endpoints } from "@misskey-js/api.types";
import type { NoteWrapper } from "@/wrapper/noteWrapper";
import type { Connection } from "@misskey-js/streaming";
import type { TimelineOptions, UserData } from "../types/type";
import uniqBy from "lodash/uniqBy";
import remove from "lodash/remove";
import findIndex from "lodash/findIndex";
import type { NoteUpdatedEvent } from "@misskey-js/streaming.types";

export const TimelineApiEndpoint: Record<string, keyof Endpoints> = {
  globalTimeline: "notes/global-timeline",
  hybridTimeline: "notes/hybrid-timeline",
  localTimeline: "notes/local-timeline",
  homeTimeline: "notes/timeline",
};

export const ChannelApiEndPoint: Record<string, keyof Endpoints> = {
  channel: "channels/timeline",
};

export const AntennaApiEndPoint: Record<string, keyof Endpoints> = {
  antenna: "antennas/notes",
};

export const UserListApiEndPoint: Record<string, keyof Endpoints> = {
  userList: "notes/user-list-timeline",
};

export const RoleTimelineApiEndpoint: Record<string, keyof Endpoints> = {
  roleTimeline: "roles/notes",
};

/**
 * @description タイムラインを初期化する
 * @param user
 * @param timeline
 * @param getNotesNum
 * @returns
 */
export const initializeTimeline = async (
  user: UserData,
  timeline: TimelineOptions,
  subscribedNotesId: Array<string>,
  getNotesNum: number = 10
): Promise<Connection> => {
  let notesBuffer: Array<NoteWrapper> = [];
  let streamChannel: Connection = null;

  try {
    if (TimelineApiEndpoint[timeline.channel] != null) {
      // タイムライン
      notesBuffer = await user.cli.request(
        TimelineApiEndpoint[timeline.channel],
        {
          limit: getNotesNum,
        }
      );

      streamChannel = user.stream.useChannel(
        timeline.channel,
        {}
      ) as unknown as Connection;
    } else if (ChannelApiEndPoint[timeline.channel] != null) {
      // チャンネル
      notesBuffer = await user.cli.request(
        ChannelApiEndPoint[timeline.channel],
        {
          channelId: timeline.channelId,
          limit: getNotesNum,
        }
      );

      streamChannel = user.stream.useChannel(timeline.channel, {
        channelId: timeline.channelId,
      }) as unknown as Connection;
    } else if (AntennaApiEndPoint[timeline.channel] != null) {
      // アンテナ
      notesBuffer = await user.cli.request(
        AntennaApiEndPoint[timeline.channel],
        {
          antennaId: timeline.channelId,
          limit: getNotesNum,
        }
      );
      streamChannel = user.stream.useChannel(timeline.channel, {
        antennaId: timeline.channelId,
      }) as unknown as Connection;
    } else if (UserListApiEndPoint[timeline.channel] != null) {
      // リスト
      notesBuffer = await user.cli.request(
        UserListApiEndPoint[timeline.channel],
        {
          listId: timeline.channelId,
          limit: getNotesNum,
        }
      );
      streamChannel = user.stream.useChannel(timeline.channel, {
        listId: timeline.channelId,
      }) as unknown as Connection;
    } else if (RoleTimelineApiEndpoint[timeline.channel] != null) {
      // ロール

      notesBuffer = await user.cli.request(
        RoleTimelineApiEndpoint[timeline.channel],
        {
          roleId: timeline.channelId,
          limit: getNotesNum,
        }
      );
      streamChannel = user.stream.useChannel(timeline.channel, {
        roleId: timeline.channelId,
      }) as unknown as Connection;
    }

    notesBuffer.forEach((note) => {
      subscribeNote(user, timeline, subscribedNotesId, note);
    });

    timeline.notesBuffer = notesBuffer;
  } catch (err) {
    console.error(err);
    return null;
  }

  return streamChannel;
};

/**
 * @description untilIdより古いノートを取得する
 * @param user
 * @param timeline
 * @param untilId
 * @param getNotesNum
 * @returns
 */
export const getOldNotes = async (
  user: UserData,
  timeline: TimelineOptions,
  subscribedNotesId: Array<string>,
  untilId: string,
  getNotesNum: number = 10
) => {
  let notesBuffer: Array<NoteWrapper> = [];

  try {
    if (TimelineApiEndpoint[timeline.channel] != null) {
      // タイムライン
      notesBuffer = await user.cli.request(
        TimelineApiEndpoint[timeline.channel],
        {
          limit: getNotesNum,
          untilId: untilId,
        }
      );
    } else if (ChannelApiEndPoint[timeline.channel] != null) {
      // チャンネル
      notesBuffer = await user.cli.request(
        ChannelApiEndPoint[timeline.channel],
        {
          limit: getNotesNum,
          untilId: untilId,
          channelId: timeline.channelId,
        }
      );
    } else if (AntennaApiEndPoint[timeline.channel] != null) {
      // アンテナ
      notesBuffer = await user.cli.request(
        AntennaApiEndPoint[timeline.channel],
        {
          limit: getNotesNum,
          untilId: untilId,
          antennaId: timeline.channelId,
        }
      );
    } else if (UserListApiEndPoint[timeline.channel] != null) {
      // チャンネル
      notesBuffer = await user.cli.request(
        UserListApiEndPoint[timeline.channel],
        {
          limit: getNotesNum,
          untilId: untilId,
          listId: timeline.channelId,
        }
      );
    } else if (RoleTimelineApiEndpoint[timeline.channel] != null) {
      // チャンネル
      notesBuffer = await user.cli.request(
        RoleTimelineApiEndpoint[timeline.channel],
        {
          limit: getNotesNum,
          untilId: untilId,
          roleId: timeline.channelId,
        }
      );
    }
  } catch (err) {
    console.error(err);
    notesBuffer = [];
  }

  notesBuffer.forEach((note) => {
    if (note.reactionEmojis == null) note.reactionEmojis = {};
    subscribeNote(user, timeline, subscribedNotesId, note);
  });

  timeline.notesBuffer = [...timeline.notesBuffer, ...notesBuffer];
  uniqueNote(user, timeline, subscribedNotesId);
};

/**
 * @description ノートバッファの整理
 * @param user
 * @param timeline
 */
export const uniqueNote = (
  user: UserData,
  timeline: TimelineOptions,
  subscribedNotesId: Array<string>
) => {
  timeline.notesBuffer = uniqBy(timeline.notesBuffer, "id");

  const overflowNotes = timeline.notesBuffer.slice(
    timeline.bufferNoteNum,
    timeline.notesBuffer.length - 1
  );

  // 溢れたノートのサブスクリプションを解除する
  overflowNotes.forEach((note) => {
    unSubscribeNote(user, timeline, subscribedNotesId, note);

    timeline.notesBuffer = timeline.notesBuffer.slice(
      0,
      timeline.bufferNoteNum
    );
  });
};

/**
 * @description ノート受信時のイベント
 * @param user
 * @param timeline
 * @param payload
 */
export const onNote = (
  user: UserData,
  timeline: TimelineOptions,
  subscribedNotesId: Array<string>,
  payload: NoteWrapper
) => {
  if (payload.reactionEmojis == null) payload.reactionEmojis = {};
  timeline.notesBuffer = [payload, ...timeline.notesBuffer];
  subscribeNote(user, timeline, subscribedNotesId, payload);
  uniqueNote(user, timeline, subscribedNotesId);
};

/**
 * @description ノートのサブスクリプション
 * @param user
 * @param timeline
 * @param noteId
 */
export const subscribeNote = (
  user: UserData,
  timeline: TimelineOptions,
  subscribedNotesId: Array<string>,
  note: NoteWrapper
) => {
  if (!subscribedNotesId.includes(note.id)) {
    user.stream.send("subNote", {
      id: note.id,
    });
    subscribedNotesId.push(note.id);
  }
  if (note.renote)
    subscribeNote(user, timeline, subscribedNotesId, note.renote);
};

/**
 * @description ノートのサブスクリプション解除
 * @param user
 * @param timeline
 * @param noteId
 */
export const unSubscribeNote = (
  user: UserData,
  timeline: TimelineOptions,
  subscribedNotesId: Array<string>,
  note: NoteWrapper
) => {
  user.stream.send("unsubNote", {
    id: note.id,
  });
  subscribedNotesId = subscribedNotesId.filter((id) => id !== note.id);
  if (note.renote)
    unSubscribeNote(user, timeline, subscribedNotesId, note.renote);
};

/**
 *
 * @param user
 * @param timeline
 * @param e
 */
export const notesUpdate = (
  user: UserData,
  timeline: TimelineOptions,
  subscribedNotesId: Array<string>,
  e: NoteUpdatedEvent
) => {
  if (e.type === "deleted") {
    remove(timeline.notesBuffer, (v: NoteWrapper) => v.id === e.id);
    unSubscribeNote(user, timeline, subscribedNotesId, e.id);
  } else {
    timeline.notesBuffer.forEach((v, index, arr) => {
      noteUpdateExecuter(user, timeline, subscribedNotesId, e, arr[index]);
    });
  }
};

const noteUpdateExecuter = (
  user: UserData,
  timeline: TimelineOptions,
  subscribedNotesId: Array<string>,
  e: NoteUpdatedEvent,
  note: NoteWrapper
): boolean => {
  let renoteStatus = false;

  if (note.renote)
    renoteStatus = noteUpdateExecuter(
      user,
      timeline,
      subscribedNotesId,
      e,
      note.renote
    );
  if (note.id !== e.id) return renoteStatus;

  if (note["reactionEmojis"] == null) note["reactionEmojis"] = {};
  if (note["reactions"] == null) note["reactions"] = {};

  try {
    if (e.type === "reacted") {
      if (
        e.body.reaction.indexOf("@.") < 0 &&
        e.body.reaction.indexOf("@") >= 0
      ) {
        // Calckey
        if (Array.isArray(note.reactionEmojis)) {
          if (findIndex(note.emojis, { name: e.body.emoji.name }) < 0) {
            note.emojis.push({
              name: e.body.emoji.name,
              url: e.body.emoji.url,
            });
          }
        } else {
          note.reactionEmojis[e.body.emoji.name] = e.body.emoji.url;
        }
      }
      if (note.reactions[e.body.reaction] == null) {
        note.reactions[e.body.reaction] = 1;
      } else {
        note.reactions[e.body.reaction]++;
      }
    } else if (e.type === "unreacted") {
      // if (
      //   e.body.reaction.indexOf("@.") < 0 &&
      //   e.body.reaction.indexOf("@") >= 0
      // ) {
      //     note.reactionEmojis[e.body.emoji.name] = e.body.emoji.url;
      // }
      note.reactions[e.body.reaction]--;
    }
  } catch (e) {
    console.error(e);
  }

  return true;
};

/**
 * @description 1.3.4以前でアホな実装をした報い
 * @param timeline
 * @returns
 */
export const fixChannelData = (timeline: TimelineOptions): TimelineOptions => {
  if (
    new RegExp(
      "roleTimeline|globalTimeline|hybridTimeline|localTimeline|homeTimeline|channel|antenna|list|admin|hashtag|drive|main|queueStats|serverStats|userList"
    ).test(timeline.channel) === false
  ) {
    timeline.channelId = timeline.channel;
    timeline.channel = "channel";
  }

  return timeline;
};
