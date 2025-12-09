import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsShapeType } from "@babylonjs/core/Physics/";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { PhysicsCharacterController } from "@babylonjs/core/Physics/";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class PlayerMouvement {
    private camera: UniversalCamera;

    constructor(private scene: Scene, camera: UniversalCamera) {
        this.scene = scene;
        this.camera = camera;
        this._createPlayer();
    }

    _createPlayer(): void {
        const player = MeshBuilder.CreateCapsule("player", { height: 1, radius: 0.3 }, this.scene);
        player.position.y = 4;

        new PhysicsAggregate(player, PhysicsShapeType.BOX, { mass: 1 }, this.scene);

        let characterController = new PhysicsCharacterController(player.position, { capsuleHeight: 1, capsuleRadius: 0.3 }, this.scene);
        this.camera.parent = player;
        this.camera.position = new Vector3(0, 0.4, 0);
        this.camera.rotation = Vector3.Zero();
    }

}