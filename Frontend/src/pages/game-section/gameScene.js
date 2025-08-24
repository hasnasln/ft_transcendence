import { BabylonJsWrapper } from "./3d";
import { gameInstance } from "../play";
export class GameScene {
    static _instance;
    EDGE_WIDTH = 2;
    EDGE_COLOR;
    GROUND_COLOR;
    EDGE_COLOR_LIGHT;
    PADDLE1_DIFFUSE;
    PADDLE1_EMISSIVE;
    PADDLE2_DIFFUSE;
    PADDLE2_EMISSIVE;
    WALL_COLOR;
    constructor() {
    }
    static getInstance() {
        if (!GameScene._instance) {
            GameScene._instance = new GameScene();
        }
        return GameScene._instance;
    }
}
export function createScene() {
    const canvas = document.getElementById("game-canvas");
    const engine = new (BabylonJsWrapper.getInstance().Engine)(canvas, true);
    const scene = new (BabylonJsWrapper.getInstance().Scene)(engine);
    scene.clearColor = new (BabylonJsWrapper.getInstance().Color4)(0, 0, 0, 0);
    return { canvas, engine, scene };
}
export function createGround(scene, gameInfo) {
    const width = gameInfo.constants?.groundWidth;
    const groundSize = {
        width,
        height: width * (152.5 / 274),
        sideOrientation: BabylonJsWrapper.getInstance().Mesh.DOUBLESIDE,
    };
    const ground = BabylonJsWrapper.getInstance().MeshBuilder.MeshBuilder.CreatePlane("ground", groundSize, scene);
    ground.material = createMaterial("groundMaterial", scene, GameScene.getInstance().GROUND_COLOR);
    const edgeWidth = GameScene.getInstance().EDGE_WIDTH * window.devicePixelRatio;
    applyEdgeRendering(ground, edgeWidth, GameScene.getInstance().EDGE_COLOR_LIGHT);
    return { ground, groundSize };
}
export function createPaddles(scene, gameInfo) {
    const width = gameInfo.constants?.paddleWidth;
    const size = { width, height: gameInstance.uiManager.groundSize.height * 0.3, depth: 0.6 };
    const groundWidth = gameInstance.uiManager.groundSize.width;
    const paddle1 = createPaddle("paddle1", size, scene, {
        x: -groundWidth / 2 + size.width,
        y: gameInfo.paddle?.p1y,
        material: createPaddleMaterial("p1", scene, GameScene.getInstance().PADDLE1_DIFFUSE, GameScene.getInstance().PADDLE1_EMISSIVE)
    });
    const paddle2 = createPaddle("paddle2", size, scene, {
        x: groundWidth / 2 - size.width,
        y: gameInfo.paddle?.p2y,
        material: createPaddleMaterial("p2", scene, GameScene.getInstance().PADDLE2_DIFFUSE, GameScene.getInstance().PADDLE2_EMISSIVE)
    });
    [paddle1, paddle2].forEach(p => applyEdgeRendering(p));
    return { paddle1, paddle2 };
}
export function createWalls(scene, gameInfo) {
    const height = 1.5 * gameInfo.constants?.paddleWidth;
    const size = { width: gameInstance.uiManager.groundSize.width, height, depth: 1 };
    const material = createMaterial("wall", scene, GameScene.getInstance().WALL_COLOR);
    const bottomWall = createWall("bottomWall", size, scene, {
        y: -gameInstance.uiManager.groundSize.height / 2 - height / 2,
        material
    });
    const topWall = createWall("topWall", size, scene, {
        y: gameInstance.uiManager.groundSize.height / 2 + height / 2,
        material: material.clone("topWall")
    });
    [bottomWall, topWall].forEach(w => applyEdgeRendering(w));
    return { bottomWall, topWall };
}
export function createMaterial(name, scene, color) {
    const B = BabylonJsWrapper.getInstance();
    const mat = new B.StandardMaterial(name, scene);
    mat.diffuseColor = color;
    return mat;
}
export function createPaddleMaterial(name, scene, d, e) {
    const mat = createMaterial(name, scene, d);
    mat.emissiveColor = e;
    return mat;
}
export function applyEdgeRendering(mesh, width, color) {
    mesh.enableEdgesRendering();
    mesh.edgesWidth = width ?? GameScene.getInstance().EDGE_WIDTH * window.devicePixelRatio;
    mesh.edgesColor = color ?? GameScene.getInstance().EDGE_COLOR;
}
export function createPaddle(name, size, scene, config) {
    const B = BabylonJsWrapper.getInstance();
    const paddle = B.MeshBuilder.MeshBuilder.CreateBox(name, size, scene);
    paddle.position.x = config.x;
    paddle.position.y = config.y;
    paddle.position.z = -size.depth / 2;
    paddle.material = config.material;
    return paddle;
}
export function createWall(name, size, scene, config) {
    const B = BabylonJsWrapper.getInstance();
    const wall = B.MeshBuilder.MeshBuilder.CreateBox(name, size, scene);
    wall.position.x = 0;
    wall.position.y = config.y;
    wall.position.z = -size.depth / 2;
    wall.material = config.material;
    return wall;
}
