import { BabylonJsWrapper } from "./3d";
export class CameraController {
    angleXZ;
    angleYZ;
    radius;
    rotationActive;
    target;
    zoomStep;
    rotStep;
    camera;
    constructor(scene) {
        const B = BabylonJsWrapper.getInstance();
        this.angleXZ = 0;
        this.angleYZ = 0;
        this.radius = 20;
        this.rotationActive = false;
        this.target = B.Vector3.Zero();
        this.zoomStep = 1;
        this.rotStep = Math.PI / 32;
        this.camera = new B.FreeCamera("Camera", new B.Vector3(0, 0, -this.radius), scene);
        this.camera.setTarget(this.target);
        [
            new B.Vector3(1, 0, 0),
            new B.Vector3(-1, 0, 0),
            new B.Vector3(0, 1, 0),
            new B.Vector3(0, -1, 0)
        ]
            .forEach((direction, index) => {
            const light = new B.HemisphericLight(`light${index + 1}`, direction, scene);
            light.intensity = 0.5;
        });
        scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type !== B.KeyboardEventTypes.KEYDOWN)
                return;
            const evt = kbInfo.event;
            const key = evt.key;
            switch (true) {
                case (evt.shiftKey && (evt.key === 'r' || evt.key === 'R')):
                    if (this.rotationActive) {
                        console.log("resetcamera olacak");
                        this.resetCamera();
                    }
                    console.log(`shift + R ye basıldı, this.rotationActive = ${this.rotationActive}`);
                    this.rotationActive = !this.rotationActive;
                    break;
            }
            switch (key) {
                case "+":
                    if (this.rotationActive) {
                        const nextRadius = this.radius - Math.sign(this.radius) * this.zoomStep;
                        if (this.isValidRadius(nextRadius))
                            this.radius = nextRadius;
                        this.updateCamera();
                    }
                    break;
                case "-":
                    if (this.rotationActive) {
                        const nextRadius = this.radius + Math.sign(this.radius) * this.zoomStep;
                        if (this.isValidRadius(nextRadius))
                            this.radius = nextRadius;
                        this.updateCamera();
                    }
                    break;
                case "6":
                    if (this.rotationActive) {
                        this.angleXZ += this.rotStep;
                        this.updateCamera();
                    }
                    break;
                case "4":
                    if (this.rotationActive) {
                        this.angleXZ -= this.rotStep;
                        this.updateCamera();
                    }
                    break;
                case "8":
                    if (this.rotationActive) {
                        this.angleYZ += this.rotStep;
                        this.updateCamera();
                    }
                    break;
                case "2":
                    if (this.rotationActive) {
                        this.angleYZ -= this.rotStep;
                        this.updateCamera();
                    }
                    break;
                case "r":
                case "R":
                    if (this.rotationActive)
                        this.resetCamera();
                    break;
            }
        });
    }
    resetCamera() {
        this.angleXZ = 0;
        this.angleYZ = 0;
        this.radius = 20;
        const B = BabylonJsWrapper.getInstance();
        this.camera.position = new B.Vector3(0, 0, -this.radius);
        this.camera.setTarget(this.target);
    }
    updateCamera() {
        const x = Math.sin(this.angleXZ) * (-this.radius);
        const y = Math.sin(this.angleYZ) * (-this.radius);
        const z = Math.cos(this.angleXZ) * Math.cos(this.angleYZ) * (-this.radius);
        this.camera.position.set(x, y, z);
        this.camera.setTarget(this.target);
        this.camera.upVector.set(0, Math.cos(this.angleYZ) < 0 ? -1 : 1, 0);
    }
    isValidRadius(nextRadius) {
        return (2 <= Math.abs(nextRadius) && Math.abs(nextRadius) <= 40);
    }
}
