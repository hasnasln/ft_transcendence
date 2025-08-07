import { BabylonJsWrapper } from "./3d";
import { gameInstance } from "../play";
import { GameInfo } from "./network";
import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import type { Engine } from "@babylonjs/core/Engines/engine";

export class GameScene {
  private static _instance: GameScene;
  public EDGE_WIDTH = 2;
  public EDGE_COLOR!: Color4;
  public GROUND_COLOR!: Color3;
  public EDGE_COLOR_LIGHT!: Color4;
  public PADDLE1_DIFFUSE!: Color3;
  public PADDLE1_EMISSIVE!: Color3;
  public PADDLE2_DIFFUSE!: Color3;
  public PADDLE2_EMISSIVE!: Color3;
  public WALL_COLOR!: Color3;

  private constructor() {
  }

  public static getInstance(): GameScene {
    if (!GameScene._instance) {
      GameScene._instance = new GameScene();
    }
    return GameScene._instance;
  }
}
 export function createScene(): { canvas: HTMLCanvasElement; engine: Engine; scene: Scene } {
    const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    const engine = new (BabylonJsWrapper.getInstance().Engine)(canvas, true);
    const scene = new (BabylonJsWrapper.getInstance().Scene)(engine);
    scene.clearColor = new (BabylonJsWrapper.getInstance().Color4)(0, 0, 0, 0);
    engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
    return { canvas, engine, scene };
  }

export function createGround(scene: Scene, gameInfo: GameInfo): { ground: Mesh; groundSize: { width: number; height: number; sideOrientation: number } } {
    const width = gameInfo.constants?.groundWidth!;
    const groundSize = {
      width,
      height: width * (152.5 / 274),
      sideOrientation:  BabylonJsWrapper.getInstance().Mesh.DOUBLESIDE,
    };
    const ground = BabylonJsWrapper.getInstance().MeshBuilder.MeshBuilder.CreatePlane("ground", groundSize, scene);
    ground.material = createMaterial("groundMaterial", scene, GameScene.getInstance().GROUND_COLOR);
    applyEdgeRendering(ground, GameScene.getInstance().EDGE_WIDTH, GameScene.getInstance().EDGE_COLOR_LIGHT);
    return { ground, groundSize };
  }

export function createPaddles(scene: Scene, gameInfo: GameInfo): { paddle1: Mesh; paddle2: Mesh } {
    const width = gameInfo.constants?.paddleWidth!;
    const size = { width, height: gameInstance.uiManager.groundSize!.height * 0.3, depth: 0.6 };
    const groundWidth = gameInstance.uiManager.groundSize!.width;
    const paddle1 = createPaddle(
      "paddle1",
      size,
      scene,
      { x: -groundWidth / 2 + size.width, y: gameInfo.paddle?.p1y!, material: createPaddleMaterial("p1", scene, GameScene.getInstance().PADDLE1_DIFFUSE, GameScene.getInstance().PADDLE1_EMISSIVE) }
    );
    const paddle2 = createPaddle(
      "paddle2",
      size,
      scene,
      { x: groundWidth / 2 - size.width, y: gameInfo.paddle?.p2y!, material: createPaddleMaterial("p2", scene, GameScene.getInstance().PADDLE2_DIFFUSE, GameScene.getInstance().PADDLE2_EMISSIVE) }
    );
    [paddle1, paddle2].forEach(p => applyEdgeRendering(p));
    return { paddle1, paddle2 };
  }

export function createWalls(scene: Scene, gameInfo: GameInfo): { bottomWall: Mesh; topWall: Mesh } {
    const height = 1.5 * gameInfo.constants?.paddleWidth!;
    const size = { width: gameInstance.uiManager.groundSize!.width, height, depth: 1 };
    const material = createMaterial("wall", scene, GameScene.getInstance().WALL_COLOR);
    const bottomWall = createWall("bottomWall", size, scene, { y: -gameInstance.uiManager.groundSize!.height / 2 - height / 2, material });
    const topWall = createWall("topWall", size, scene, { y: gameInstance.uiManager.groundSize!.height / 2 + height / 2, material: material.clone("topWall") });
    [bottomWall, topWall].forEach(w => applyEdgeRendering(w));
    return { bottomWall, topWall };
  }

export function createMaterial(name: string, scene: Scene, color: Color3): StandardMaterial {
    const B = BabylonJsWrapper.getInstance();
    const mat = new B.StandardMaterial(name, scene);
    mat.diffuseColor = color;
    return mat;
  }

export function createPaddleMaterial(name: string, scene: Scene, d: Color3, e: Color3): StandardMaterial {
    const mat = createMaterial(name, scene, d);
    mat.emissiveColor = e;
    return mat;
  }

export function applyEdgeRendering(mesh: Mesh, width?: number, color?: Color4): void {
    mesh.enableEdgesRendering();
    mesh.edgesWidth = width ?? GameScene.getInstance().EDGE_WIDTH;
    mesh.edgesColor = color ?? GameScene.getInstance().EDGE_COLOR;
  }

export function createPaddle(name: string, size: any, scene: Scene, config: { x: number; y: number; material: StandardMaterial }): Mesh {
    const B = BabylonJsWrapper.getInstance();
    const paddle = B.MeshBuilder.MeshBuilder.CreateBox(name, size, scene);
    paddle.position.x = config.x;
    paddle.position.y = config.y;
    paddle.position.z = -size.depth / 2;
    paddle.material = config.material;
    return paddle;
  }

export function createWall(name: string, size: any, scene: Scene, config: { y: number; material: StandardMaterial }): Mesh {
    const B = BabylonJsWrapper.getInstance();
    const wall = B.MeshBuilder.MeshBuilder.CreateBox(name, size, scene);
    wall.position.x = 0;
    wall.position.y = config.y;
    wall.position.z = -size.depth / 2;
    wall.material = config.material;
    return wall;
  }

