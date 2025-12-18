import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsShapeType } from "@babylonjs/core/Physics/";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { PhysicsCharacterController } from "@babylonjs/core/Physics/";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";

export class PlayerMouvement {
    private camera: UniversalCamera;
    private inputMap: any = {};//store the state of the keys

    constructor(private scene: Scene, camera: UniversalCamera) {
        this.scene = scene;
        this.camera = camera;
        this._createPlayer();
        this._setupInputs();
        this.scene.onBeforeRenderObservable.add(() => {
            this._update();
        });
    }

    _createPlayer(): void {
        const player = MeshBuilder.CreateCapsule("player", { height: 1, radius: 0.3 }, this.scene);
        player.position.y = 4;

        const physicsAggregate = new PhysicsAggregate(player, PhysicsShapeType.BOX, { mass: 1 }, this.scene);
        physicsAggregate.body.setMassProperties({ inertia: Vector3.Zero() });

        let characterController = new PhysicsCharacterController(player.position, { capsuleHeight: 1, capsuleRadius: 0.3 }, this.scene);
        this.camera.parent = player;
        this.camera.position = new Vector3(0, 0.4, 0);
        this.camera.rotation = Vector3.Zero();
    }
    private _setupInputs(): void {
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    this.inputMap[kbInfo.event.key.toLowerCase()] = true;
                    break;
                case KeyboardEventTypes.KEYUP:
                    this.inputMap[kbInfo.event.key.toLowerCase()] = false;
                    break;
            }
        });
    }
    private _update(): void {
        const player = this.scene.getMeshByName("player");
        if (!player) return;

        let moveDir = Vector3.Zero();

        // Get camera forward direction but flatten it to ignore Pitch (looking up/down)
        const forward = this.camera.getDirection(Vector3.Forward());
        forward.y = 0;
        forward.normalize();

        const right = this.camera.getDirection(Vector3.Right());
        right.y = 0;
        right.normalize();

        // French Layout (ZQSD)
        // z = Forward, s = Backward, q = Left, d = Right
        if (this.inputMap["z"]) {
            moveDir.addInPlace(forward);
        }
        if (this.inputMap["s"]) {
            moveDir.subtractInPlace(forward);
        }
        if (this.inputMap["q"]) {
            moveDir.subtractInPlace(right);
        }
        if (this.inputMap["d"]) {
            moveDir.addInPlace(right);
        }

        // Normalize to prevent faster diagonal movement
        moveDir.normalize();

        // Apply movement
        // Option A: If using direct position (simple)
        // player.position.addInPlace(moveDir.scale(0.1)); 

        // Option B: If using Physics Aggregate (Recommended)
        const speed = 10;
        if (player.physicsBody) {
            const velocity = moveDir.scale(speed);
            // Keep existing Y velocity (gravity)
            velocity.y = player.physicsBody.getLinearVelocity().y;
            player.physicsBody.setLinearVelocity(velocity);
        }

        if (this.inputMap[" "]) {
            this._jump(player);
        }
    }

    private _jump(player: any): void {
        // Raycast to check if grounded
        // Origin: player center. Direction: Down. Length: slightly more than half height (0.5 for height 1) + buffer
        const ray = new Ray(player.position, new Vector3(0, -1, 0), 0.6);
        const pick = this.scene.pickWithRay(ray, (mesh) => mesh.isPickable && mesh.name !== "player");

        if (pick && pick.hit) {
            const currentVel = player.physicsBody.getLinearVelocity();
            // Only jump if not moving up too fast (prevent double jumping glitched)
            if (Math.abs(currentVel.y) < 0.5) {
                currentVel.y = 5; // Jump force
                player.physicsBody.setLinearVelocity(currentVel);
            }
        }


    }
}