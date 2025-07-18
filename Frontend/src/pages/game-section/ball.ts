// BallController.ts
import { Mesh, MeshBuilder, StandardMaterial, Color3, Vector3 } from "@babylonjs/core";
import { activeBallColor } from "../../components/ball-coler";
import { Game } from "../play";


export class BallController
{
  ball: Mesh;
  velocity: Vector3;
  position: {x: number, y: number};

  
  constructor(game: Game)
  {
    const [r, g, b] = activeBallColor();
    this.ball = MeshBuilder.CreateSphere("ball", { diameter: 2 * game.gameInfo!.constants?.ballRadius! }, game.scene);
    const ballMaterial = new StandardMaterial("ballMaterial", game.scene);
    ballMaterial.diffuseColor = new Color3(r, g, b);
    this.ball.material = ballMaterial;

    this.velocity = new Vector3(game.gameInfo!.ballState?.bv.x, game.gameInfo!.ballState?.bv.y, -game.gameInfo!.constants?.ballRadius!);
    this.position = new Vector3(game.gameInfo!.ballState?.bp!.x, game.gameInfo!.ballState?.bp!.y, -game.gameInfo!.constants?.ballRadius!);
  }
}
