import {FreeCamera, Scene, HemisphericLight, MeshBuilder, Vector3, Color3, Mesh,
  StandardMaterial, Engine, KeyboardEventTypes} from "@babylonjs/core";
import { gameInstance } from "../play";
import { GameInfo } from "./network";

export function createCamera(scene: Scene) {
  const camera = new FreeCamera("Camera", new Vector3(0, 0, -20), scene);
  camera.setTarget(Vector3.Zero());

[new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 1, 0),
new Vector3(0, -1, 0)].forEach((direction, index) =>
  {
  const light = new HemisphericLight(`light${index + 1}`, direction, scene);
  light.intensity = 0.5;
  });


  // 1. Başlangıç ayarlarını saklayalım
  const initialPosition = camera.position.clone();

  // 2. Klavye dinleyicisi ekleyelim
   let angleXZ = 0;
   let angleYZ = 0;
   let radius = -20;
   let rotationActive = false;
  scene.onKeyboardObservable.add((kbInfo) =>
  {
    if (kbInfo.type !== KeyboardEventTypes.KEYDOWN) return;
    const evt = kbInfo.event as KeyboardEvent;
    const key = evt.key;

     
     const center = new Vector3(0, 0, 0);
    const zoomStep = 1;       // zum miktarı
    const rotStep = Math.PI / 32;  // döndürme açısı (~5.6°)

    switch (true) {
    case (evt.altKey && (evt.key === 'r' || evt.key === 'R')):
       if (rotationActive)
        {
          angleXZ = 0;
          angleYZ = 0;
          radius = -20;
          camera.position.copyFrom(initialPosition);
          camera.setTarget(center);
        }
      console.log("alt + R ye basıldı");
      rotationActive = !rotationActive;
      break;
    }

    switch (key) {   
      // Zoom In (yakınlaş)
      case "+":
        if (rotationActive)
        {
          if (2 <= Math.abs(radius - Math.sign(radius)*zoomStep) && Math.abs(radius - Math.sign(radius)*zoomStep) <= 40)
            radius -= Math.sign(radius)*zoomStep;
          camera.position = new Vector3(Math.sin(angleXZ) * radius, camera.position.y, Math.cos(angleXZ) * radius);
          camera.setTarget(center);
        }
        break;

      // Zoom Out (uzaklaş)
      case "-":
        if (rotationActive)
        {
          if (2 <= Math.abs(radius + Math.sign(radius)*zoomStep) && Math.abs(radius + Math.sign(radius)*zoomStep) <= 40)
            radius += Math.sign(radius)*zoomStep;
          camera.position = new Vector3(Math.sin(angleXZ) * radius, camera.position.y, Math.cos(angleXZ) * radius);
          camera.setTarget(center);
        }
        break;

      // Sağ dönüş (kamera sağa bakacak şekilde dönsün)
      case "6":
        if (rotationActive)
        {
          angleXZ += rotStep;
          camera.position = new Vector3(Math.sin(angleXZ) * radius, camera.position.y, Math.cos(angleXZ) * radius);
          camera.setTarget(center);
        }
        break;

      // Sol dönüş
      case "4":
        if (rotationActive)
        {
          angleXZ -= rotStep;
          camera.position = new Vector3(Math.sin(angleXZ) * radius, camera.position.y, Math.cos(angleXZ) * radius);
          camera.setTarget(center);
        }
        break;

      // Yukarı-aşağı dönüş istersen:
      case "8":
        if (rotationActive)
        {
          angleYZ += rotStep;
          camera.position = new Vector3(camera.position.x, Math.sin(angleYZ) * radius, Math.cos(angleYZ) * radius);
          camera.setTarget(center);
        }
        break;
      case "2":
        if (rotationActive)
        {
          angleYZ -= rotStep;
          camera.position = new Vector3(camera.position.x, Math.sin(angleYZ) * radius, Math.cos(angleYZ) * radius);
          camera.setTarget(center);
        }
        break;

        // Reset: ilk konuma/dönüşe dön
      case "r":
      case "R":
        if (rotationActive)
        {
          angleXZ = 0;
          angleYZ = 0;
          radius = -20;
          camera.position.copyFrom(initialPosition);
          camera.setTarget(center);
        }
        break;

    }
  });

  return camera;
}






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
export function createGround(scene: Scene, gameInfo: GameInfo)
{
  const width = gameInfo.constants?.groundWidth!;
  const groundSize = { width: width, height: width*(152.5)/274, sideOrientation: Mesh.DOUBLESIDE };
  const ground = MeshBuilder.CreatePlane("ground", groundSize, scene);
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseColor = new Color3(0.1, 0.1, 0.1); // Koyu gri
  ground.material = groundMaterial;

  return {ground, groundSize};
}



// 🎮 Paddle'lar ve top
export function createPaddles(scene: Scene, gameInfo: GameInfo)
{
  const wi = gameInfo.constants?.paddleWidth!;
  const paddleSize = { width: wi, height: gameInstance.groundSize!.height*(0.3), depth: 0.5 };
  const paddle1 = MeshBuilder.CreateBox("paddle1", paddleSize, scene);
  paddle1.position.x = -gameInstance.groundSize!.width/2 + paddleSize.width;
  paddle1.position.y = gameInfo.paddle?.p1y!;
  paddle1.position.z = -paddleSize.depth/2;

  const paddle2 = MeshBuilder.CreateBox("paddle2", paddleSize, scene);
  paddle2.position.x = gameInstance.groundSize!.width/2 - paddleSize.width;
  paddle2.position.y = gameInfo.paddle?.p2y!;
  paddle2.position.z = -paddleSize.depth/2;

  // Paddle material
  const paddleMaterial = new StandardMaterial("paddleMaterial", scene);
  paddleMaterial.diffuseColor = new Color3(0, 0, 0.7);
  paddleMaterial.emissiveColor = new Color3(0, 0, 0.5);
  paddle1.material = paddleMaterial;

  const paddle2Material = paddleMaterial.clone("paddle2Material") as StandardMaterial;
  paddle2Material.diffuseColor = new Color3(0.7, 0, 0);
  paddle2Material.emissiveColor = new Color3(0.5, 0, 0);
  paddle2.material = paddle2Material;

  return { paddle1, paddle2};
}



// 🎮 Duvarlar
export function createWalls(scene: Scene) 
{
  const wallSize = { width: gameInstance.groundSize!.width, height: 0.3, depth: 1 };

  const bottomWall = MeshBuilder.CreateBox("bottomWall", wallSize, scene);
  bottomWall.position.x = 0;  // Ortalanmış
  bottomWall.position.y = -gameInstance.groundSize!.height/2 - wallSize.height / 2;
  bottomWall.position.z = -wallSize.depth/2;

  const bottomWallMaterial = new StandardMaterial("bottomWallMaterial", scene);
  bottomWallMaterial.diffuseColor = new Color3(0.1, 0.5, 0.1); // yeşil tonlu duvar
  bottomWall.material = bottomWallMaterial;

  const topWall = MeshBuilder.CreateBox("topWall", wallSize, scene);
  topWall.position.x = 0;
  topWall.position.y = gameInstance.groundSize!.height/2 + wallSize.height / 2;
  topWall.position.z = -wallSize.depth/2;

  const topWallMaterial = bottomWallMaterial.clone("topWallMaterial");
  topWall.material = topWallMaterial;

  // return { bottomWall, topWall };
}


export function createPredictedBall(scene: Scene, paddleX: number)
{
  const predictedBallSize = { width: 3, height: 0.2, depth: 0.5 };

  const predictedBall = MeshBuilder.CreateBox("predictedBall", predictedBallSize, scene);
  predictedBall.position.x = paddleX + 1.5; 
  predictedBall.position.y = 0;
  predictedBall.position.z = -predictedBallSize.depth;

  const predictedBallMaterial = new StandardMaterial("predictedBallMaterial", scene);
  predictedBallMaterial.diffuseColor = new Color3(0, 0, 0.7);
  predictedBallMaterial.emissiveColor = new Color3(0, 0, 0.5);
  predictedBall.material =  predictedBallMaterial;

  return predictedBall;

}
