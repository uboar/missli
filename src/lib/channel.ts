import type { Endpoints } from "misskey-js";
import type { Note } from "misskey-js/built/entities";
import type { Connection } from "misskey-js/built/streaming";
import type { TimelineOptions, userData } from "./userdata";

export const TimelineApiEndpoint: Record<string, keyof Endpoints> = {
  globalTimeline: "notes/global-timeline",
  hybridTimeline: "notes/hybrid-timeline",
  localTimeline: "notes/local-timeline",
  homeTimeline: "notes/timeline",
};

export const ChannelApiEndPoint: Record<string, keyof Endpoints> = {
  channel: "channels/timeline",
};

/**
 * @description タイムラインを初期化する
 * @param user 
 * @param timeline 
 * @param getNotesNum 
 * @returns 
 */
export const initializeTimeline = async (
  user: userData,
  timeline: TimelineOptions,
  getNotesNum: number = 10
): Promise<{ streamChannel: Connection; notes: Array<Note> }> => {
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
    }
  } catch (err) {
    console.error(err);
    return { streamChannel: null, notes: [] };
  }

  return { streamChannel: streamChannel, notes: notesBuffer };
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
  user: userData,
  timeline: TimelineOptions,
  untilId: string,
  getNotesNum: number = 10
): Promise<Array<Note>> => {
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
    }
  } catch (err) {
    console.error(err);
    notesBuffer = [];
  }

  return notesBuffer;
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