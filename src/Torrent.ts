import { ITransmissionTorrentStatus, TorrentStatus } from "./types";

import Transmission from "./Transmission";

class Torrent {
  private state: ITransmissionTorrentStatus;
  #transmission: Transmission;

  constructor(transmission: Transmission, state: ITransmissionTorrentStatus) {
    this.#transmission = transmission;
    this.state = state;
  }

  async getInfo() {
    const response = await this.#transmission.getTorrent(this.state.id);
    this.state = { ...response.state };
    return { ...response.state };
  }

  get done() {
    return this.state.status === TorrentStatus.SEED;
  }

  //
  // Actions
  //

  async start() {
    const response = await this.#transmission.callRaw("torrent-start", {
      ids: this.state.id,
    });
    return response.result === "success" ? true : false;
  }

  async startNow() {
    const response = await this.#transmission.callRaw("torrent-start-now", {
      ids: this.state.id,
    });
    return response.result === "success" ? true : false;
  }

  async stop() {
    const response = await this.#transmission.callRaw("torrent-stop", {
      ids: this.state.id,
    });
    return response.result === "success" ? true : false;
  }

  async verify() {
    const response = await this.#transmission.callRaw("torrent-verify", {
      ids: this.state.id,
    });
    return response.result === "success" ? true : false;
  }

  async reannounce() {
    const response = await this.#transmission.callRaw("torrent-reannounce", {
      ids: this.state.id,
    });
    return response.result === "success" ? true : false;
  }

  async delete(removeFiles: boolean) {
    const response = await this.#transmission.callRaw("torrent-remove", {
      ids: this.state.id,
      "delete-local-data": removeFiles,
    });
    return response.result === "success" ? true : false;
  }
}

export default Torrent;
