import fetch from "node-fetch";
import Torrent from "./Torrent";
import {
  ITorrentCreateProperties,
  ITorrentCreateResponse,
  ITransmissionOptions,
  ITransmissionRPCResponse,
  ITransmissionState,
  ITransmissionTorrentStatus,
} from "./types";

class Transmission {
  #state: ITransmissionState = {
    sessionToken: null,
  };
  #options: ITransmissionOptions;

  constructor(options: ITransmissionOptions) {
    this.#options = {
      host: "http://localhost:9091",
      path: "/transmission/rpc",
    };
    this.#options = { ...this.#options, ...options };
  }

  async callRaw<T = any>(
    method: string,
    args: any
  ): Promise<ITransmissionRPCResponse<T>> {
    if (!this.authenticated) {
      throw new Error("Transmission client is not authenticated!");
    }

    const data = {
      method,
      arguments: args,
    };

    const response = await fetch(this.address, {
      method: "POST",
      body: JSON.stringify(data),
      headers: this.headers,
    }).then((d) => d.json());

    if (!response) throw new Error("No response from request");

    return response;
  }

  private async getTorrentsRaw(params: any = {}) {
    const result = await this.callRaw<{
      torrents: ITransmissionTorrentStatus[];
    }>("torrent-get", {
      fields: [
        "id",
        "name",
        "percentDone",
        "dateCreated",
        "downloadDir",
        "addedDate",
        "rateDownload",
        "rateUpload",
        "uploadRatio",
        "files",
        "totalSize",
        "haveUnchecked",
        "downloadedEver",
        "uploadedEver",
        "hashString",
        "activityDate",
        "isFinished",
        "isStalled",
        "status",
      ],
      ...params,
    });

    return result;
  }

  /**
   * Get all torrents
   */
  async getTorrents() {
    const result = await this.getTorrentsRaw();
    return result.arguments.torrents.map((t) => new Torrent(this, t));
  }

  /**
   * Get a torrent by its ID
   * @param id Torrent ID
   */
  async getTorrent(id: number) {
    const result = await this.getTorrentsRaw({ ids: id });
    return result.arguments.torrents.map((t) => new Torrent(this, t))[0];
  }

  async createTorrent(options: ITorrentCreateProperties) {
    const result = await this.callRaw<ITorrentCreateResponse>("torrent-add", {
      ...options,
    });

    if (!result.arguments["torrent-added"]?.id) {
      throw new Error("Failed to create torrent");
    }

    const torrent = await this.getTorrent(result.arguments["torrent-added"].id);

    return torrent;
  }

  async getFreeSpace(path: string) {
    const result = await this.callRaw<{
      path: string;
      "size-bytes": number;
    }>("free-space", {
      path,
    });

    return {
      path: result.arguments.path,
      sizeBytes: result.arguments["size-bytes"],
    };
  }

  /**
   * Attempts to sign in with the provided credentials
   * Throws if authentication fails
   */
  async authenticate() {
    const response = await fetch(this.address, {
      headers: this.getBasicAuthHeaders(),
    });

    if (!response.headers.get("x-transmission-session-id")) {
      throw new Error(
        "Failed to authenticate with Transmission RPC" +
          " (missing x-transmission-session-id)"
      );
    }

    this.#state.sessionToken = response.headers.get(
      "x-transmission-session-id"
    );
  }

  private getBasicAuthHeaders() {
    const headers: { [k: string]: string } = {};

    if (this.#options.username && this.#options.password) {
      headers.Authorization = `Basic ${Buffer.from(
        `${this.#options.username}:${this.#options.password}`
      ).toString("base64")}`;
    }

    return headers;
  }

  private get address() {
    return `${this.#options.host}${this.#options.path}`;
  }

  private get authenticated() {
    if (this.#state.sessionToken) return true;
    return false;
  }

  private get token() {
    return this.#state.sessionToken;
  }

  private get headers() {
    return {
      "X-Transmission-Session-Id": this.token,
      ...this.getBasicAuthHeaders(),
    };
  }
}

export default Transmission;
