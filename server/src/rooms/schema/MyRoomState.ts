import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 4;
  @type("number") z: number = 0;
  //rotation
  @type("number") rotx: number = 0;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
