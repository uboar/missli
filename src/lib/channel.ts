import type { Endpoints } from "misskey-js";
import type { Note } from "misskey-js/built/entities";
import type { Connection } from "misskey-js/built/streaming";
import type { TimelineOptions, UserData } from "./userdata";

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
}

export const UserListApiEndPoint: Record<string, keyof Endpoints> = {
  userList: "notes/user-list-timeline",
}

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
    }else if(AntennaApiEndPoint[timeline.channel] != null) {
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
    }else if(UserListApiEndPoint[timeline.channel] != null) {
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
  user: UserData,
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
