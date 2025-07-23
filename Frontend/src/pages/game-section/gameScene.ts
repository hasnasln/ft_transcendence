import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 }  from "@babylonjs/core/Maths/math.color";
import { Engine } from "@babylonjs/core/Engines/engine";
import { gameInstance } from "../play";
import { GameInfo } from "./network";

const EDGE_WIDTH = 2;
const EDGE_COLOR = new Color4(0.7, 0.7, 0.7, 1); // light gray
const GROUND_COLOR = new Color3(0.1, 0.1, 0.1); // dark gray
const EDGE_COLOR_LIGHT = new Color4(0.6, 0.6, 0.6, 1); // lighter gray
const PADDLE1_DIFFUSE = new Color3(0, 0, 0.7); // blue
const PADDLE1_EMISSIVE = new Color3(0, 0, 0.5); // dark blue
const PADDLE2_DIFFUSE = new Color3(0.7, 0, 0); // red
const PADDLE2_EMISSIVE = new Color3(0.5, 0, 0); // dark red
const WALL_COLOR = new Color3(87/255, 43/255, 158/255); // purple

export function createScene() {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  
  scene.clearColor = new Color4(0, 0, 0, 0);
  
  engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
  return { canvas, engine, scene };
}

export function createGround(scene: Scene, gameInfo: GameInfo) {
  const width = gameInfo.constants?.groundWidth!;
  const groundSize = { 
    width, 
    height: width * (152.5 / 274), 
    sideOrientation: Mesh.DOUBLESIDE 
  };
  
  const ground = MeshBuilder.CreatePlane("ground", groundSize, scene);
  ground.material = createMaterial("groundMaterial", scene, GROUND_COLOR);
  
  applyEdgeRendering(ground, 2, EDGE_COLOR_LIGHT);
  
  return { ground, groundSize };
}

export function createPaddles(scene: Scene, gameInfo: GameInfo) {
  const paddleWidth = gameInfo.constants?.paddleWidth!;
  const paddleSize = { 
    width: paddleWidth, 
    height: gameInstance.uiManager.groundSize!.height * 0.3, 
    depth: 0.6 
  };
  
  const groundWidth = gameInstance.uiManager.groundSize!.width;
  
  const paddle1 = createPaddle("paddle1", paddleSize, scene, {
    x: -groundWidth / 2 + paddleSize.width,
    y: gameInfo.paddle?.p1y!,
    material: createPaddleMaterial("paddleMaterial", scene, 
      PADDLE1_DIFFUSE, 
      PADDLE1_EMISSIVE
    )
  });
  
  const paddle2 = createPaddle("paddle2", paddleSize, scene, {
    x: groundWidth / 2 - paddleSize.width,
    y: gameInfo.paddle?.p2y!,
    material: createPaddleMaterial("paddle2Material", scene, 
      PADDLE2_DIFFUSE, 
      PADDLE2_EMISSIVE
    )
  });
  
  [paddle1, paddle2].forEach(paddle => applyEdgeRendering(paddle));
  
  return { paddle1, paddle2 };
}

export function createWalls(scene: Scene, gameInfo: GameInfo) {
  const wallSize = { 
    width: gameInstance.uiManager.groundSize!.width, 
    height: 1.5 * gameInfo.constants?.paddleWidth!, 
    depth: 1 
  };
  
  const wallMaterial = createMaterial("bottomWallMaterial", scene, WALL_COLOR);
  const groundHeight = gameInstance.uiManager.groundSize!.height;
  
  const bottomWall = createWall("bottomWall", wallSize, scene, {
    y: -groundHeight / 2 - wallSize.height / 2,
    material: wallMaterial
  });
  
  const topWall = createWall("topWall", wallSize, scene, {
    y: groundHeight / 2 + wallSize.height / 2,
    material: wallMaterial.clone("topWallMaterial")
  });
  
  [bottomWall, topWall].forEach(wall => applyEdgeRendering(wall));
}

function createMaterial(name: string, scene: Scene, diffuseColor: Color3): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = diffuseColor;
  return material;
}

function createPaddleMaterial(name: string, scene: Scene, diffuseColor: Color3, emissiveColor: Color3): StandardMaterial {
  const material = createMaterial(name, scene, diffuseColor);
  material.emissiveColor = emissiveColor;
  return material;
}

function applyEdgeRendering(mesh: Mesh, width = EDGE_WIDTH, color = EDGE_COLOR): void {
  mesh.enableEdgesRendering();
  mesh.edgesWidth = width;
  mesh.edgesColor = color;
}

function createPaddle(name: string, size: any, scene: Scene, config: { x: number, y: number, material: StandardMaterial }): Mesh {
  const paddle = MeshBuilder.CreateBox(name, size, scene);
  paddle.position.x = config.x;
  paddle.position.y = config.y;
  paddle.position.z = -size.depth / 2;
  paddle.material = config.material;
  return paddle;
}

function createWall(name: string, size: any, scene: Scene, config: { y: number, material: StandardMaterial }): Mesh {
  const wall = MeshBuilder.CreateBox(name, size, scene);
  wall.position.x = 0;
  wall.position.y = config.y;
  wall.position.z = -size.depth / 2;
  wall.material = config.material;
  return wall;
}
