import {Scene, MeshBuilder, Color3, Mesh, StandardMaterial, Engine, Color4} from "@babylonjs/core";
import { Game } from "../play";

export function createScene()
{
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error("Canvas element not found");
}

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  return { canvas, engine, scene };
}



// 🎮 Zemin
export function createGround(game: Game)
{
  if (!game.gameInfo) return;
  const width = game.gameInfo.constants?.groundWidth!;
  const groundSize = { width: width, height: width*(152.5)/274, sideOrientation: Mesh.DOUBLESIDE };
  const ground = MeshBuilder.CreatePlane("ground", groundSize, game.scene);
  const groundMaterial = new StandardMaterial("groundMaterial", game.scene);
  groundMaterial.diffuseColor = new Color3(0.1, 0.1, 0.1); // Koyu gri
  ground.material = groundMaterial;

       // Kenar çizgilerini etkinleştir ve renklendir
    ground.enableEdgesRendering();
    ground.edgesWidth = 2;
    ground.edgesColor = new Color4(0.6, 0.6, 0.6, 1); 

  return {ground, groundSize};
}



// 🎮 Paddle'lar ve top
export function createPaddles(game: Game)
{
  if (!game.gameInfo) return;
  const wi = game.gameInfo.constants?.paddleWidth!;
  const paddleSize = { width: wi, height: game.groundSize!.height*(0.3), depth: 0.6 };
  const paddle1 = MeshBuilder.CreateBox("paddle1", paddleSize, game.scene);
  paddle1.position.x = -game.groundSize!.width/2 + paddleSize.width;
  paddle1.position.y = game.gameInfo.paddle?.p1y!;
  paddle1.position.z = -paddleSize.depth/2;

  const paddle2 = MeshBuilder.CreateBox("paddle2", paddleSize, game.scene);
  paddle2.position.x = game.groundSize!.width/2 - paddleSize.width;
  paddle2.position.y = game.gameInfo.paddle?.p2y!;
  paddle2.position.z = -paddleSize.depth/2;

  // Paddle material
  const paddleMaterial = new StandardMaterial("paddleMaterial", game.scene);
  paddleMaterial.diffuseColor = new Color3(0, 0, 0.7);
  paddleMaterial.emissiveColor = new Color3(0, 0, 0.5);
  paddle1.material = paddleMaterial;

  const paddle2Material = paddleMaterial.clone("paddle2Material") as StandardMaterial;
  paddle2Material.diffuseColor = new Color3(0.7, 0, 0);
  paddle2Material.emissiveColor = new Color3(0.5, 0, 0);
  paddle2.material = paddle2Material;

    // Kenar çizgilerini etkinleştir ve renklendir
  [paddle1, paddle2].forEach(p => {
    p.enableEdgesRendering();
    p.edgesWidth = 2;
    p.edgesColor = new Color4(1, 1, 1, 1); 
  });

  return { paddle1, paddle2};
}



// 🎮 Duvarlar
export function createWalls(game: Game)
{
  if (!game.gameInfo) return;
  const wallSize = { width: game.groundSize!.width, height: 1.5 * game.gameInfo.constants?.paddleWidth!, depth: 1 };

  const bottomWall = MeshBuilder.CreateBox("bottomWall", wallSize, game.scene);
  bottomWall.position.x = 0;  // Ortalanmış
  bottomWall.position.y = -game.groundSize!.height/2 - wallSize.height / 2;
  bottomWall.position.z = -wallSize.depth/2;

  const bottomWallMaterial = new StandardMaterial("bottomWallMaterial", game.scene);
  bottomWallMaterial.diffuseColor = new Color3(0.1, 0.5, 0.1); // yeşil tonlu duvar
  bottomWall.material = bottomWallMaterial;

  const topWall = MeshBuilder.CreateBox("topWall", wallSize, game.scene);
  topWall.position.x = 0;
  topWall.position.y = game.groundSize!.height/2 + wallSize.height / 2;
  topWall.position.z = -wallSize.depth/2;

  const topWallMaterial = bottomWallMaterial.clone("topWallMaterial");
  topWall.material = topWallMaterial;

      // Kenar çizgilerini etkinleştir ve renklendir
  [bottomWall, topWall].forEach(p => {
    p.enableEdgesRendering();
    p.edgesWidth = 2;
    p.edgesColor = new Color4(0.7, 0.7, 0.7, 1); 
  });

}
