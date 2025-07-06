// BallController.ts
import { MeshBuilder, StandardMaterial, Color3, Vector3 } from "@babylonjs/core";
import { activeBallColor } from "../../components/ball-coler";
export class BallController {
    ball;
    velocity;
    position;
    constructor(scene, gameInfo) {
        const [r, g, b] = activeBallColor();
        this.ball = MeshBuilder.CreateSphere("ball", { diameter: 2 * gameInfo.constants?.ballRadius }, scene);
        const ballMaterial = new StandardMaterial("ballMaterial", scene);
        ballMaterial.diffuseColor = new Color3(r, g, b);
        this.ball.material = ballMaterial;
        this.velocity = new Vector3(gameInfo.ballState?.bv.x, gameInfo.ballState?.bv.y, -gameInfo.constants?.ballRadius);
        this.position = new Vector3(gameInfo.ballState?.bp.x, gameInfo.ballState?.bp.y, -gameInfo.constants?.ballRadius);
    }
}
