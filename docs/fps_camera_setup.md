# FPS Camera Setup Guide

This guide explains how to implement a First-Person Shooter (FPS) camera attached to your player capsule, allowing for mouse look and movement.

## 1. Changes in `src/playground/main-scene.ts`

To switch from an orbital view to an FPS view, you need to replace the `ArcRotateCamera` with a `UniversalCamera`.

### Steps:

1.  **Update Imports**:
    Change the import from `ArcRotateCamera` to `UniversalCamera`.
    ```typescript
    import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
    ```

2.  **Update `_setCamera` method**:
    Replace the `ArcRotateCamera` instantiation with `UniversalCamera`.
    **Important**: Remove default keyboard inputs so the camera doesn't fly around when you press WASD (since we want WASD to control the player body).

    ```typescript
    _setCamera(scene: Scene): void {
        // Create a UniversalCamera (FPS camera)
        this.camera = new UniversalCamera("camera", new Vector3(0, 5, -10), scene);
        
        // Attach the camera to the canvas to enable controls (Mouse)
        this.camera.attachControl(this.canvas, true);
        
        // Disable default camera keyboard inputs (arrow keys/WASD)
        // We want the player controller to handle movement, not the camera directly.
        this.camera.inputs.remove(this.camera.inputs.attached.keyboard);
        
        // Optional: Configure sensitivity
        this.camera.angularSensibility = 1000; // Lower is faster
    }
    ```

3.  **Implement Pointer Lock**:
    To look around freely without the mouse cursor leaving the window, use Pointer Lock.

    Add this to your `constructor` or `_setCamera`:
    ```typescript
    // Click on the canvas to lock the pointer
    this.scene.onPointerDown = (evt) => {
        // You might want to check if it's a specific button or state
        this.engine.enterPointerlock();
    };
    ```

4.  **Pass Camera to Player**:
    Update `loadComponents` to pass the `camera` to the player controller.
    ```typescript
    new PlayerMouvement(this.scene, this.camera); 
    ```

## 2. Changes in `src/playground/player/player_controller.ts`

Attach the camera to the player capsule so it moves with the player.

### Steps:

1.  **Update Constructor**:
    Accept the `UniversalCamera`.
    ```typescript
    import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";

    export class PlayerMouvement {
        private camera: UniversalCamera;

        constructor(private scene: Scene, camera: UniversalCamera) {
            this.scene = scene;
            this.camera = camera; // Assign before creating player
            this._createPlayer();
        }
    ```

2.  **Update `_createPlayer` method**:
    Parent the camera to the player mesh.

    ```typescript
    _createPlayer(): void {
        const player = MeshBuilder.CreateCapsule("player", { height: 1, radius: 0.3 }, this.scene);
        
        // ... physics setup ...
        
        // --- CAMERA SETUP ---
        // 1. Parent the camera to the player
        this.camera.parent = player;
        
        // 2. Position at eye level (local to player)
        // Since capsule origin is usually center, 0.4 is near the top (height 1 / 2 = 0.5)
        this.camera.position = new Vector3(0, 0.4, 0); 
        
        // 3. Reset rotation so it faces forward relative to the player
        this.camera.rotation = Vector3.Zero();
    }
    ```

## Summary

1.  **`main-scene.ts`**: Use `UniversalCamera`, remove keyboard inputs, add Pointer Lock.
2.  **`player_controller.ts`**: Parent `camera` to `player` and reset local position.
