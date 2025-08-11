import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { BabylonJsWrapper } from "./3d";
import { GameInfo } from "./network";
import { activeBallColor } from "../../components/ballColor";

export class BallController {
	ball: Mesh;
	position: Vector3;

	constructor(scene: Scene, gameInfo: GameInfo) {
		const B = BabylonJsWrapper.getInstance();

		const [r, g, b] = activeBallColor();

		this.ball = B.SphereBuilder.CreateSphere(
			"ball",
			{ diameter: 2 * gameInfo.constants!.ballRadius! },
			scene
		);

		const ballMaterial = new B.StandardMaterial("ballMaterial", scene);
		ballMaterial.diffuseColor = new B.Color3(r, g, b);
		this.ball.material = ballMaterial;

		this.position = new B.Vector3(
			gameInfo.ballPosition!.x,
			gameInfo.ballPosition!.y,
			-gameInfo.constants!.ballRadius!
		);
	}
}
