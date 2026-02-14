import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export class RemotePlayers {
  private players: Map<string, AbstractMesh> = new Map();

  constructor(private scene: Scene) {}

  addPlayer(sessionId: string, x: number, y: number, z: number): void {
    if (this.players.has(sessionId)) return;

    const mesh = MeshBuilder.CreateCapsule(
      `remote_$(sessionId)`,
      { height: 1, radius: 0.3 },
      this.scene,
    );
    mesh.position = new Vector3(x, y, z);

    this.players.set(sessionId, mesh);
  }

  removePlayer(sessionId: string): void {
    const mesh = this.players.get(sessionId);
    if (mesh) {
      mesh.dispose();
      this.players.delete(sessionId);
    }
  }

  updatePlayer(
    sessionId: string,
    x: number,
    y: number,
    z: number,
    rotY: number,
  ): void {
    const mesh = this.players.get(sessionId);
    if (mesh) {
      mesh.position = new Vector3(x, y, z);
      mesh.rotation.y = rotY;
    }
  }

  dispose(): void {
    for (const [, mesh] of this.players) {
      mesh.dispose();
    }
    this.players.clear();
  }
}
