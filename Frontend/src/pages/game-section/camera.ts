import { FreeCamera }          from "@babylonjs/core/Cameras/freeCamera";
import { Scene }               from "@babylonjs/core/scene";
import { HemisphericLight }    from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 }             from "@babylonjs/core/Maths/math.vector";
import { KeyboardEventTypes }  from "@babylonjs/core/Events/keyboardEvents";

export class CameraController
{
  angleXZ: number;
  angleYZ: number;
  radius: number;
  rotationActive: boolean;
  target: Vector3;
  zoomStep: number;
  rotStep: number;
  camera: FreeCamera;

  constructor(scene: Scene)
  {
    this.angleXZ = 0;
    this.angleYZ = 0;
    this.radius = 20;
    this.rotationActive = false;
    this.target = Vector3.Zero();
    this.zoomStep = 1;
    this.rotStep = Math.PI / 32;

    this.camera = new FreeCamera("Camera", new Vector3(0, 0, -this.radius), scene);
    this.camera.setTarget(this.target);

    [new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 1, 0),
    new Vector3(0, -1, 0)].forEach((direction, index) =>
    {
        const light = new HemisphericLight(`light${index + 1}`, direction, scene);
        light.intensity = 0.5;
    });

    // 2. Klavye dinleyicisi ekleyelim
    scene.onKeyboardObservable.add((kbInfo) =>
    {
        if (kbInfo.type !== KeyboardEventTypes.KEYDOWN) return;
        const evt = kbInfo.event as KeyboardEvent;
        const key = evt.key;

        switch (true) {
        case (evt.altKey && (evt.key === 'r' || evt.key === 'R')):
        if (this.rotationActive)
            {console.log("resetcamera olacak");
                this.resetCamera();}
        console.log(`alt + R ye basıldı, this.rotationActive = ${this.rotationActive}`);
        this.rotationActive = !this.rotationActive;
        break;
        }

        switch (key)
        {   
        // Zoom In (yakınlaş)
        case "+":
            if (this.rotationActive)
            {
                const nextRadius = this.radius - Math.sign(this.radius)*this.zoomStep;
                if (this.isValidRadius(nextRadius))
                    this.radius = nextRadius;
                this.updateCamera();
            }
            break;

        // Zoom Out (uzaklaş)
        case "-":
            if (this.rotationActive)
            {
                const nextRadius = this.radius + Math.sign(this.radius)*this.zoomStep;
            if (this.isValidRadius(nextRadius))
                this.radius = nextRadius;
            this.updateCamera();
            }
            break;

        // Sağ dönüş (kamera sağa bakacak şekilde dönsün)
        case "6":
            if (this.rotationActive)
            {
            this.angleXZ += this.rotStep;
            this.updateCamera();
            }
            break;

        // Sol dönüş
        case "4":
            if (this.rotationActive)
            {
            this.angleXZ -= this.rotStep;
            this.updateCamera();
            }
            break;

        // Yukarı-aşağı dönüş istersen:
        case "8":
            if (this.rotationActive)
            {
            this.angleYZ += this.rotStep;
            this.updateCamera();
            }
            break;
        case "2":
            if (this.rotationActive)
            {
            this.angleYZ -= this.rotStep;
            this.updateCamera();
            }
            break;

            // Reset: ilk konuma/dönüşe dön
        case "r":
        case "R":
            if (this.rotationActive)
                this.resetCamera();
            break;

        }
    });
  }

    public resetCamera() {
        this.angleXZ = 0;
        this.angleYZ = 0;
        this.radius = 20;
        this.camera.position = new Vector3(0, 0, -this.radius);
        this.camera.setTarget(this.target);
    }

    public updateCamera()
    {
        const x = Math.sin(this.angleXZ) * (-this.radius);
        const y = Math.sin(this.angleYZ) * (-this.radius);
        const z = Math.cos(this.angleXZ) * Math.cos(this.angleYZ) * (-this.radius);
        this.camera.position.set(x, y, z);
        console.log(`ayarlanan camera.position = (${x}, ${y}, ${z});`);
        console.log(`this.angleYZ = ${this.angleYZ}`);
        this.camera.setTarget(this.target);
        this.camera.upVector.set(0, Math.cos(this.angleYZ) < 0 ? -1 : 1, 0);
    }

    public isValidRadius(nextRadius: number): boolean
    {
        return (2 <= Math.abs(nextRadius) && Math.abs(nextRadius) <= 40);
    }
}
