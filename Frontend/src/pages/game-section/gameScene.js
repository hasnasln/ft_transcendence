import { Scene, MeshBuilder, Color3, Mesh, StandardMaterial, Engine, Color4 } from "@babylonjs/core";
import { gameInstance } from "../play";
export function createScene() {
    const canvas = document.getElementById("game-canvas");
    if (!canvas) {
        throw new Error("Canvas element not found");
    }
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    return { canvas, engine, scene };
}
// 🎮 Zemin
export function createGround(scene, gameInfo) {
    const width = gameInfo.constants?.groundWidth;
    const groundSize = { width: width, height: width * (152.5) / 274, sideOrientation: Mesh.DOUBLESIDE };
    const ground = MeshBuilder.CreatePlane("ground", groundSize, scene);
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new Color3(0.1, 0.1, 0.1); // Koyu gri
    ground.material = groundMaterial;
    // Kenar çizgilerini etkinleştir ve renklendir
    ground.enableEdgesRendering();
    ground.edgesWidth = 2;
    ground.edgesColor = new Color4(0.6, 0.6, 0.6, 1);
    return { ground, groundSize };
}
// 🎮 Paddle'lar ve top
export function createPaddles(scene, gameInfo) {
    const wi = gameInfo.constants?.paddleWidth;
    const paddleSize = { width: wi, height: gameInstance.groundSize.height * (0.3), depth: 0.6 };
    const paddle1 = MeshBuilder.CreateBox("paddle1", paddleSize, scene);
    paddle1.position.x = -gameInstance.groundSize.width / 2 + paddleSize.width;
    paddle1.position.y = gameInfo.paddle?.p1y;
    paddle1.position.z = -paddleSize.depth / 2;
    const paddle2 = MeshBuilder.CreateBox("paddle2", paddleSize, scene);
    paddle2.position.x = gameInstance.groundSize.width / 2 - paddleSize.width;
    paddle2.position.y = gameInfo.paddle?.p2y;
    paddle2.position.z = -paddleSize.depth / 2;
    // Paddle material
    const paddleMaterial = new StandardMaterial("paddleMaterial", scene);
    paddleMaterial.diffuseColor = new Color3(0, 0, 0.7);
    paddleMaterial.emissiveColor = new Color3(0, 0, 0.5);
    paddle1.material = paddleMaterial;
    const paddle2Material = paddleMaterial.clone("paddle2Material");
    paddle2Material.diffuseColor = new Color3(0.7, 0, 0);
    paddle2Material.emissiveColor = new Color3(0.5, 0, 0);
    paddle2.material = paddle2Material;
    // Kenar çizgilerini etkinleştir ve renklendir
    [paddle1, paddle2].forEach(p => {
        p.enableEdgesRendering();
        p.edgesWidth = 2;
        p.edgesColor = new Color4(0.7, 0.7, 0.7, 1);
    });
    return { paddle1, paddle2 };
}
// 🎮 Duvarlar
export function createWalls(scene, gameInfo) {
    const wallSize = { width: gameInstance.groundSize.width, height: 1.5 * gameInfo.constants?.paddleWidth, depth: 1 };
    const bottomWall = MeshBuilder.CreateBox("bottomWall", wallSize, scene);
    bottomWall.position.x = 0; // Ortalanmış
    bottomWall.position.y = -gameInstance.groundSize.height / 2 - wallSize.height / 2;
    bottomWall.position.z = -wallSize.depth / 2;
    const bottomWallMaterial = new StandardMaterial("bottomWallMaterial", scene);
    bottomWallMaterial.diffuseColor = new Color3(0.1, 0.5, 0.1); // yeşil tonlu duvar
    bottomWall.material = bottomWallMaterial;
    const topWall = MeshBuilder.CreateBox("topWall", wallSize, scene);
    topWall.position.x = 0;
    topWall.position.y = gameInstance.groundSize.height / 2 + wallSize.height / 2;
    topWall.position.z = -wallSize.depth / 2;
    const topWallMaterial = bottomWallMaterial.clone("topWallMaterial");
    topWall.material = topWallMaterial;
    // Kenar çizgilerini etkinleştir ve renklendir
    [bottomWall, topWall].forEach(p => {
        p.enableEdgesRendering();
        p.edgesWidth = 2;
        p.edgesColor = new Color4(0.7, 0.7, 0.7, 1);
    });
}
