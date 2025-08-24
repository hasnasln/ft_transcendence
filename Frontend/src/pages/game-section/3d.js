/* Lazy BabylonJS importer – keeps the initial bundle tiny
   Usage:
     await BabylonJsWrapper.load();              // load when you actually need 3‑D
     const { Mesh, Scene } = BabylonJsWrapper.getInstance();
     const sphere = MeshBuilder.CreateSphere("s", { diameter: 1 }, Scene);
*/
import { GameScene } from "./gameScene";
export class BabylonJsWrapper {
    static _instance;
    static loaded = false;
    Mesh;
    MeshBuilder;
    SphereBuilder;
    Vector3;
    Color3;
    Color4;
    Engine;
    Scene;
    FreeCamera;
    HemisphericLight;
    KeyboardEventTypes;
    EdgesRenderer;
    StandardMaterial;
    TrailMesh;
    DefaultRenderingPipeline;
    GlowLayer;
    constructor() {
    }
    static getInstance() {
        if (!BabylonJsWrapper._instance) {
            BabylonJsWrapper._instance = new BabylonJsWrapper();
        }
        return BabylonJsWrapper._instance;
    }
    static async load() {
        if (BabylonJsWrapper.loaded)
            return;
        BabylonJsWrapper.loaded = true;
        console.log("loading BabylonJS modules...");
        const [{ Mesh }, MeshBuilderMod, { SphereBuilder }, mathMod, { Engine }, { Scene }, { FreeCamera }, { HemisphericLight }, { KeyboardEventTypes }, { EdgesRenderer }, { StandardMaterial }, { TrailMesh }, { DefaultRenderingPipeline }, { GlowLayer }] = await Promise.all([
            import("@babylonjs/core/Meshes/mesh"),
            import("@babylonjs/core/Meshes/meshBuilder"),
            import("@babylonjs/core/Meshes/Builders/sphereBuilder"),
            import("@babylonjs/core/Maths/math"),
            import("@babylonjs/core/Engines/engine"),
            import("@babylonjs/core/scene"),
            import("@babylonjs/core/Cameras/freeCamera"),
            import("@babylonjs/core/Lights/hemisphericLight"),
            import("@babylonjs/core/Events/keyboardEvents"),
            import("@babylonjs/core/Rendering/edgesRenderer"),
            import("@babylonjs/core/Materials/standardMaterial"),
            import("@babylonjs/core/Meshes/trailMesh"),
            import("@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline"),
            import("@babylonjs/core/Layers/glowLayer")
        ]);
        const { Vector3, Color3, Color4 } = mathMod;
        const instance = BabylonJsWrapper.getInstance();
        Object.assign(instance, {
            Mesh,
            MeshBuilder: MeshBuilderMod,
            SphereBuilder,
            Vector3,
            Color3,
            Color4,
            Engine,
            Scene,
            FreeCamera,
            HemisphericLight,
            KeyboardEventTypes,
            EdgesRenderer,
            StandardMaterial,
            TrailMesh,
            DefaultRenderingPipeline,
            GlowLayer
        });
        GameScene.getInstance().EDGE_COLOR = new (instance.Color4)(0.7, 0.7, 0.7, 1);
        GameScene.getInstance().GROUND_COLOR = new (instance.Color3)(0.1, 0.1, 0.1);
        GameScene.getInstance().EDGE_COLOR_LIGHT = new (instance.Color4)(0.6, 0.6, 0.6, 1);
        GameScene.getInstance().PADDLE1_DIFFUSE = new (instance.Color3)(0, 0, 0.7);
        GameScene.getInstance().PADDLE1_EMISSIVE = new (instance.Color3)(0, 0, 0.5);
        GameScene.getInstance().PADDLE2_DIFFUSE = new (instance.Color3)(0.7, 0, 0);
        GameScene.getInstance().PADDLE2_EMISSIVE = new (instance.Color3)(0.5, 0, 0);
        GameScene.getInstance().WALL_COLOR = new (instance.Color3)(87 / 255, 43 / 255, 158 / 255);
        console.log("BabylonJS modules loaded successfully.");
    }
}
