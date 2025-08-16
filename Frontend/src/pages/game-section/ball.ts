import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { TrailMesh } from "@babylonjs/core/Meshes/trailMesh";

import { BabylonJsWrapper } from "./3d";
import { GameInfo } from "./network";
import { activeBallColor } from "../../components/ballColor";

export class BallController {
	ball: Mesh;
	position: Vector3;
	trail: TrailMesh;

	constructor(scene: Scene, gameInfo: GameInfo) {
		const B = BabylonJsWrapper.getInstance();

		const [r, g, b] = activeBallColor();

		this.ball = B.SphereBuilder.CreateSphere(
			"ball",
			{ diameter: 2 * gameInfo.constants!.ballRadius! },
			scene
		);

		const ballMaterial = new B.StandardMaterial("ballMaterial", scene);
		ballMaterial.diffuseColor = new B.Color3(r,g,b);
		this.ball.material = ballMaterial;

		const tMat = new B.StandardMaterial("trailMat", scene);
		tMat.emissiveColor = new B.Color3(r, g, b);
		tMat.backFaceCulling = false;
		tMat.alpha = 0.45;

		this.trail = new B.TrailMesh("ballTrail", this.ball, scene, 0.2, 10, true);
		this.trail.material = tMat;

		this.position = new B.Vector3(
			gameInfo.ballPosition!.x,
			gameInfo.ballPosition!.y,
			-gameInfo.constants!.ballRadius!
		);
	}
}
