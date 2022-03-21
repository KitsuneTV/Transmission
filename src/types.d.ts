// Spec used: https://gist.github.com/RobertAudi/807ec699037542646584

export interface ITransmissionOptions {
  /** Hostname (http://example.com:9091) */
  host?: string;
  /** Path (/transmission/rpc) */
  path?: string;
  /** Username (optional) */
  username?: string;
  /** Password (optional) */
  password?: string;
}

export interface ITransmissionState {
  sessionToken: string | null;
}

export interface ITransmissionRPCResponse<T> {
  arguments: T;
  result: string;
}

export enum TorrentStatus {
  STOPPED = 0,
  CHECK_WAIT = 1,
  CHECK = 2,
  DOWNLOAD_WAIT = 3,
  DOWNLOAD = 4,
  SEED_WAIT = 5,
  SEED = 6,
}

export interface ITransmissionTorrentStatus {
  id?: number;
  name?: string;
  percentDone?: number;
  dateCreated?: number;
  downloadDir?: string;
  addedDate?: number;
  rateDownload?: number;
  rateUpload?: number;
  uploadRatio?: number;
  files?: Array<{ name: string; length: number; bytesCompleted: number }>;
  hashString?: string;
  activityDate?: number;
  totalSize?: number;
  haveUnchecked?: boolean;
  downloadedEver?: number;
  uploadedEver?: number;
  isFinished?: boolean;
  isStalled?: boolean;
  status: TorrentStatus;
}

export type ITorrentCreateProperties = {
  cookies?: string;
  "download-dir"?: string;
  paused?: boolean;
  "peer-limit"?: number;
  bandwidthPriority?: number;
  "files-wanted"?: any[];
  "files-unwanted"?: any[];
  "priority-high"?: any[];
  "priority-low"?: any[];
  "priority-normal"?: any[];
} & (
  | {
      /** base64 .torrent content */
      metainfo: string;
    }
  | {
      /** Path or URL to .torrent file, or magnet link */
      filename: string;
    }
);

export interface ITorrentCreateResponse {
  "torrent-added": {
    hashString: string;
    id: number;
    name: string;
  };
}
