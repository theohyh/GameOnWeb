import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene } from "@babylonjs/core/scene";
import { Tools } from "@babylonjs/core/Misc/tools";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import "@babylonjs/core/Helpers/sceneHelpers";
// import { LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import { Ground } from "./ground";
import { setUI } from "./gui";
import { PlayerMouvement } from "./player/player_controller";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";

export default class MainScene {
  private camera: UniversalCamera;

  constructor(private scene: Scene, private canvas: HTMLCanvasElement, private engine: Engine | WebGPUEngine) {
    this._setCamera(scene);
    this._setLight(scene);
    this._setEnvironment(scene);
    this.loadComponents();
  }

  _setCamera(scene: Scene): void {
    /*
    this.camera = new ArcRotateCamera("camera", Tools.ToRadians(90), Tools.ToRadians(80), 20, Vector3.Zero(), scene);
    this.camera.attachControl(this.canvas, true);
    this.camera.setTarget(Vector3.Zero());
    */
    this.camera = new UniversalCamera("camera", new Vector3(0, 5, -10), scene);
    this.camera.attachControl(this.canvas, true);

    // Disable default camera keyboard inputs
    this.camera.inputs.remove(this.camera.inputs.attached.keyboard);

    this.camera.inertia = 0.3;

    this.camera.speed = 0;
    this.camera.angularSensibility = 1000; //sensibility of the camera

    // Enable pointer lock on click
    this.scene.onPointerDown = () => {
      this.engine.enterPointerlock();
    };

  }

  _setLight(scene: Scene): void {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.5;
  }

  _setEnvironment(scene: Scene) {
    scene.createDefaultEnvironment({ createGround: false, createSkybox: false });
  }

  _setPipeLine(): void {
    const pipeline = new DefaultRenderingPipeline("default-pipeline", false, this.scene, [this.scene.activeCamera!]);
    pipeline.fxaaEnabled = true;
    pipeline.samples = 4;
  }

  async loadComponents(): Promise<void> {
    // Load your files in order
    new Ground(this.scene);
    new PlayerMouvement(this.scene, this.camera);
    // Load Babylon GUI
    await setUI(this.scene);
    //
  }
}
