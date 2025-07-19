import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";

import { Color3 }  from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import { Scene } from "@babylonjs/core/scene";
import { GameInfo } from "./network";
import { activeBallColor } from "../../components/ball-coler";

export class BallController {
	ball: Mesh;
	position: Vector3;

	constructor(scene: Scene, gameInfo: GameInfo) {
		const [r, g, b] = activeBallColor();
		this.ball = CreateSphere("ball", { diameter: 2 * gameInfo.constants?.ballRadius! }, scene);
		const ballMaterial = new StandardMaterial("ballMaterial", scene);
		ballMaterial.diffuseColor = new Color3(r, g, b);
		this.ball.material = ballMaterial;


		this.position = new Vector3(gameInfo.ballPosition!.x, gameInfo.ballPosition!.y, -gameInfo.constants?.ballRadius!);
	}
}
