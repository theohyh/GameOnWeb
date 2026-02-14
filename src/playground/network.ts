import { Client, Room } from "colyseus.js";

export class NetworkManager {
  private client: Client;
  private room: Room | null = null;

  public onPlayerAdd?: (
    sessionId: string,
    x: number,
    y: number,
    z: number,
  ) => void;
  public onPlayerRemove?: (sessionId: string) => void;

  public onPlayerMove?: (
    sessionId: string,
    x: number,
    y: number,
    z: number,
    roty: number,
  ) => void;

  constructor(serverUrl: string = "ws://localhost:2567") {
    this.client = new Client(serverUrl);
  }

  async connect(): Promise<string> {
    this.room = await this.client.joinOrCreate("my_room");

    this.room.state.players.onAdd((player: any, sessionId: string) => {
      this.onPlayerAdd?.(sessionId, player.x, player.y, player.z);

      player.onChange(() => {
        this.onPlayerMove?.(
          sessionId,
          player.x,
          player.y,
          player.z,
          player.rotY,
        );
      });
    });
    this.room.state.players.onRemove((_player: any, sessionId: string) => {
      this.onPlayerRemove?.(sessionId);
    });

    return this.room.sessionId;
  }

  sendPosition(x: number, y: number, z: number, rotY: number) {
    return this.room?.send("move", {
      x,
      y,
      z,
      rotY,
    });
  }

  get sessionId(): string | undefined {
    return this.room?.sessionId;
  }
}
