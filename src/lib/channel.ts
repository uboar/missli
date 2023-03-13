import type { Endpoints } from "misskey-js";
import type { Note } from "misskey-js/built/entities";
import type { Connection } from "misskey-js/built/streaming";
import type { TimelineOptions, UserData } from "./userdata";
import uniqBy from "lodash/uniqBy";
import type { NoteUpdatedEvent } from "misskey-js/built/streaming.types";

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
  let notesBuffer: Array<Note> = [];
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

      streamChannel = user.stream.useChannel(timeline.channel);
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
      });
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
      });
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
      });
    }

    notesBuffer.forEach((note) => {
      subscribeNote(user, timeline, subscribedNotesId, note.id);
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
  let notesBuffer: Array<Note> = [];

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
    }
  } catch (err) {
    console.error(err);
    notesBuffer = [];
  }

  notesBuffer.forEach((note) => {
    if(note.reactionEmojis == null) note.reactionEmojis = {};
    subscribeNote(user, timeline, subscribedNotesId, note.id);
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
    unSubscribeNote(user, timeline, subscribedNotesId, note.id);

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
  payload: Note
) => {
  if(payload.reactionEmojis == null) payload.reactionEmojis = {};
  timeline.notesBuffer = [payload, ...timeline.notesBuffer];
  subscribeNote(user, timeline, subscribedNotesId, payload.id);
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
  noteId: string
) => {
  if (!subscribedNotesId.includes(noteId)) {
    user.stream.send("subNote", {
      id: noteId,
    });
    subscribedNotesId.push(noteId);
  }
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
  noteId: string
) => {
  user.stream.send("unsubNote", {
    id: noteId,
  });
  subscribedNotesId = subscribedNotesId.filter((id) => id !== noteId);
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
  const noteIndex = timeline.notesBuffer.findIndex((v) => v.id === e.id);

  if (noteIndex < 0) return;

  if (timeline.notesBuffer[noteIndex]["reactionEmojis"] == null)
    timeline.notesBuffer[noteIndex]["reactionEmojis"] = {};
  if (timeline.notesBuffer[noteIndex]["reactions"] == null)
    timeline.notesBuffer[noteIndex]["reactions"] = {};

  try {
    if (e.type === "reacted") {
      if (
        e.body.reaction.indexOf("@.") < 0 &&
        e.body.reaction.indexOf("@") >= 0
      ) {
        timeline.notesBuffer[noteIndex].reactionEmojis[e.body.emoji.name] =
          e.body.emoji.url;
      } else {
        if (
          timeline.notesBuffer[noteIndex].reactions[e.body.reaction] == null
        ) {
          timeline.notesBuffer[noteIndex].reactions[e.body.reaction] = 1;
        } else {
          timeline.notesBuffer[noteIndex].reactions[e.body.reaction]++;
        }
      }
    } else if (e.type === "unreacted") {
      if (
        e.body.reaction.indexOf("@.") < 0 &&
        e.body.reaction.indexOf("@") >= 0
      ) {
        timeline.notesBuffer[noteIndex].reactionEmojis[e.body.emoji.name] =
          e.body.emoji.url;
      }
      timeline.notesBuffer[noteIndex].reactions[e.body.reaction]--;
    } else if (e.type === "deleted") {
      timeline.notesBuffer.splice(noteIndex, 1);
      timeline.notesBuffer = [...timeline.notesBuffer];
      unSubscribeNote(user, timeline, subscribedNotesId, e.id);
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * @description 1.3.4以前でアホな実装をした報い
 * @param timeline
 * @returns
 */
export const fixChannelData = (timeline: TimelineOptions): TimelineOptions => {
  if (
    new RegExp(
      "globalTimeline|hybridTimeline|localTimeline|homeTimeline|channel|antenna|list|admin|hashtag|drive|main|queueStats|serverStats|userList"
    ).test(timeline.channel) === false
  ) {
    timeline.channelId = timeline.channel;
    timeline.channel = "channel";
  }

  return timeline;
};
