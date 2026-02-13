import { Room, Client, CloseCode } from "colyseus";
import { MyRoomState, Player } from "./schema/MyRoomState.js";

export class MyRoom extends Room {
  maxClients = 4;
  state = new MyRoomState();
  /**
   * Date transmission between Player and Server
   */
  messages = {
    move: (
      client: Client,
      message: { x: number; y: number; z: number; rotx: number },
    ) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = message.x;
        player.y = message.y;
        player.z = message.z;
        player.rotx = message.rotx;
      }
    },
  };

  onCreate(options: any) {
    console.log("MyRoom created!", options);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();
    player.x = 0;
    player.y = 4;
    player.z = 0;
    player.rotx = 0;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, code: CloseCode) {
    console.log(client.sessionId, "left!", code);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
