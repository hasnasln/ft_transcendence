// BallController.ts
import { Mesh, MeshBuilder, Scene, StandardMaterial, Color3, Vector3 } from "@babylonjs/core";
import { GameInfo } from "./network";
import { activeBallColor } from "../../components/ball-coler";


export class BallController
{
  ball: Mesh;
  velocity: Vector3;
  position: {x: number, y: number};

  
  constructor(scene: Scene, gameInfo: GameInfo)
  {
    const [r, g, b] = activeBallColor();
    this.ball = MeshBuilder.CreateSphere("ball", { diameter: 2 * gameInfo.constants?.ballRadius! }, scene);
    const ballMaterial = new StandardMaterial("ballMaterial", scene);
    ballMaterial.diffuseColor = new Color3(r, g, b);
    this.ball.material = ballMaterial;

    this.velocity = new Vector3(gameInfo.ballState?.bv.x, gameInfo.ballState?.bv.y, -gameInfo.constants?.ballRadius!);
    this.position = new Vector3(gameInfo.ballState?.bp!.x, gameInfo.ballState?.bp!.y, -gameInfo.constants?.ballRadius!);
  }
}
