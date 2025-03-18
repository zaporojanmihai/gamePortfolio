class Car {
    constructor(scene, world, camera) {
        
        this.scene = scene;
        this.world = world;
        this.camera = camera;

        this.width = 1.8;     
        this.height = 1.4;    
        this.length = 4.0;    

        this.chassisMass = 150; 
        this.maxSpeed = 0.9;  
        this.acceleration = 0.002; 
        this.deceleration = 0.005;
        this.brakeForce = 0.010;
        this.turnSpeed = 0.030;

        this.mapBoundary = 90; 
        this.warningDistance = 15; 
        this.isNearBoundary = false;

        this.speed = 0;
        this.currentSpeed = 0;
        this.rotation = 0; 
        this.position = new THREE.Vector3(0, 0.6, 0);
        this.initialPosition = new CANNON.Vec3(0, 0.6, 0);
        this.initialRotation = 0; 

        this.cameraAngle = Math.PI;
        this.cameraDistance = 12;
        this.cameraHeight = 5;
        this.mouseDown = false;
        this.lastMouseX = 0;

        this.wheelRotation = 0;

        this.actions = {
            acceleration: false,
            braking: false,
            left: false,
            right: false
        };

        this.createCar();
        this.setupControls();
        this.setupCameraControls();
        
        console.log("Car created with body:", this.chassisBody);
    }
    
    createCar() {
        
        this.carGroup = new THREE.Group();
        this.scene.add(this.carGroup);

        const chassisShape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.length / 2));
        this.chassisBody = new CANNON.Body({ 
            mass: this.chassisMass,
            linearDamping: 0.95,
            angularDamping: 0.95
        });
        this.chassisBody.addShape(chassisShape);
        this.chassisBody.position.copy(this.initialPosition);

        this.chassisBody.fixedRotation = true;
        this.chassisBody.updateMassProperties();
        
        this.world.addBody(this.chassisBody);

        this.createNormalCar();

        this.wheelMeshes = [];
        
        const wheelRadius = 0.4; 
        const wheelThickness = 0.25;
        const wheelSegments = 16; 
        const wheelGeometry = new THREE.CylinderGeometry(
            wheelRadius, 
            wheelRadius, 
            wheelThickness, 
            wheelSegments
        );
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333, 
            metalness: 0.5,
            roughness: 0.7
        });

        const wheelPositions = [
            { x: -this.width/2 - wheelThickness/4, y: -this.height/2 + 0.4, z: this.length/2 - wheelRadius }, 
            { x: this.width/2 + wheelThickness/4, y: -this.height/2 + 0.4, z: this.length/2 - wheelRadius }, 
            { x: -this.width/2 - wheelThickness/4, y: -this.height/2 + 0.4, z: -this.length/2 + wheelRadius }, 
            { x: this.width/2 + wheelThickness/4, y: -this.height/2 + 0.4, z: -this.length/2 + wheelRadius }  
        ];

        for (const position of wheelPositions) {
            const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);

            wheelMesh.rotation.z = Math.PI / 2;

            wheelMesh.position.set(position.x, position.y, position.z);

            this.carGroup.add(wheelMesh);
            this.wheelMeshes.push(wheelMesh);
        }

        this.addTireTreads(wheelPositions, wheelRadius, wheelThickness);
    }

    createNormalCar() {
        
        const bodyColor = 0x3a86ff; 
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: bodyColor,
            metalness: 0.7, 
            roughness: 0.3
        });
        
        const glassMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333, 
            transparent: true,
            opacity: 0.7,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const detailMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.5,
            roughness: 0.5
        });

        const mainBodyGeometry = new THREE.BoxGeometry(this.width, this.height * 0.5, this.length * 0.8);
        const mainBody = new THREE.Mesh(mainBodyGeometry, bodyMaterial);
        mainBody.position.set(0, 0, 0);
        this.carGroup.add(mainBody);

        const cabinGeometry = new THREE.BoxGeometry(this.width * 0.85, this.height * 0.45, this.length * 0.55);
        const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
        cabin.position.set(0, this.height * 0.46, -this.length * 0.05);
        this.carGroup.add(cabin);

        const hoodGeometry = new THREE.BoxGeometry(this.width * 0.95, this.height * 0.15, this.length * 0.3);
        const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
        hood.position.set(0, this.height * 0.19, this.length * 0.32);
        this.carGroup.add(hood);

        const trunkGeometry = new THREE.BoxGeometry(this.width * 0.95, this.height * 0.25, this.length * 0.15);
        const trunk = new THREE.Mesh(trunkGeometry, bodyMaterial);
        trunk.position.set(0, this.height * 0.25, -this.length * 0.42);
        this.carGroup.add(trunk);

        const windshieldGeometry = new THREE.BoxGeometry(this.width * 0.82, this.height * 0.5, this.length * 0.1);
        const windshield = new THREE.Mesh(windshieldGeometry, glassMaterial);
        windshield.position.set(0, this.height * 0.45, this.length * 0.18);
        windshield.rotation.x = -Math.PI/8; 
        this.carGroup.add(windshield);

        const rearWindowGeometry = new THREE.BoxGeometry(this.width * 0.82, this.height * 0.4, this.length * 0.1);
        const rearWindow = new THREE.Mesh(rearWindowGeometry, glassMaterial);
        rearWindow.position.set(0, this.height * 0.45, -this.length * 0.3);
        rearWindow.rotation.x = Math.PI/8; 
        this.carGroup.add(rearWindow);

        const leftSideWindowGeometry = new THREE.BoxGeometry(this.width * 0.05, this.height * 0.35, this.length * 0.5);
        const leftSideWindow = new THREE.Mesh(leftSideWindowGeometry, glassMaterial);
        leftSideWindow.position.set(-this.width/2 + 0.02, this.height * 0.45, -this.length * 0.05);
        this.carGroup.add(leftSideWindow);

        const rightSideWindowGeometry = new THREE.BoxGeometry(this.width * 0.05, this.height * 0.35, this.length * 0.5);
        const rightSideWindow = new THREE.Mesh(rightSideWindowGeometry, glassMaterial);
        rightSideWindow.position.set(this.width/2 - 0.02, this.height * 0.45, -this.length * 0.05);
        this.carGroup.add(rightSideWindow);

        this.addNormalHeadlights();

        this.addNormalTaillights();

        this.addFrontGrill();

        this.addDoorHandles(bodyMaterial);
    }

    addNormalHeadlights() {
        const headlightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 0.8
        });

        const leftHeadlightGeometry = new THREE.BoxGeometry(this.width * 0.15, this.height * 0.12, this.height * 0.05);
        const leftHeadlight = new THREE.Mesh(leftHeadlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-this.width * 0.35, this.height * 0.15, this.length * 0.48);
        this.carGroup.add(leftHeadlight);

        const rightHeadlightGeometry = new THREE.BoxGeometry(this.width * 0.15, this.height * 0.12, this.height * 0.05);
        const rightHeadlight = new THREE.Mesh(rightHeadlightGeometry, headlightMaterial);
        rightHeadlight.position.set(this.width * 0.35, this.height * 0.15, this.length * 0.48);
        this.carGroup.add(rightHeadlight);
    }

    addNormalTaillights() {
        const taillightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.8
        });

        const leftTaillightGeometry = new THREE.BoxGeometry(this.width * 0.15, this.height * 0.1, this.height * 0.05);
        const leftTaillight = new THREE.Mesh(leftTaillightGeometry, taillightMaterial);
        leftTaillight.position.set(-this.width * 0.35, this.height * 0.25, -this.length * 0.49);
        this.carGroup.add(leftTaillight);

        const rightTaillightGeometry = new THREE.BoxGeometry(this.width * 0.15, this.height * 0.1, this.height * 0.05);
        const rightTaillight = new THREE.Mesh(rightTaillightGeometry, taillightMaterial);
        rightTaillight.position.set(this.width * 0.35, this.height * 0.25, -this.length * 0.49);
        this.carGroup.add(rightTaillight);
    }

    addFrontGrill() {
        const grillMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.6,
            roughness: 0.4
        });

        const grillGeometry = new THREE.BoxGeometry(this.width * 0.5, this.height * 0.15, this.height * 0.02);
        const grill = new THREE.Mesh(grillGeometry, grillMaterial);
        grill.position.set(0, this.height * 0.15, this.length * 0.49);
        this.carGroup.add(grill);

        for (let i = 0; i < 3; i++) {
            const barGeometry = new THREE.BoxGeometry(this.width * 0.48, this.height * 0.02, this.height * 0.025);
            const bar = new THREE.Mesh(barGeometry, grillMaterial);
            bar.position.set(0, this.height * (0.12 + i * 0.05), this.length * 0.495);
            this.carGroup.add(bar);
        }
    }

    addDoorHandles(bodyMaterial) {
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            metalness: 0.8,
            roughness: 0.2
        });

        const leftFrontHandleGeometry = new THREE.BoxGeometry(this.width * 0.02, this.height * 0.02, this.height * 0.08);
        const leftFrontHandle = new THREE.Mesh(leftFrontHandleGeometry, handleMaterial);
        leftFrontHandle.position.set(-this.width/2 - 0.01, this.height * 0.35, this.length * 0.1);
        this.carGroup.add(leftFrontHandle);

        const rightFrontHandleGeometry = new THREE.BoxGeometry(this.width * 0.02, this.height * 0.02, this.height * 0.08);
        const rightFrontHandle = new THREE.Mesh(rightFrontHandleGeometry, handleMaterial);
        rightFrontHandle.position.set(this.width/2 + 0.01, this.height * 0.35, this.length * 0.1);
        this.carGroup.add(rightFrontHandle);

        const leftRearHandleGeometry = new THREE.BoxGeometry(this.width * 0.02, this.height * 0.02, this.height * 0.08);
        const leftRearHandle = new THREE.Mesh(leftRearHandleGeometry, handleMaterial);
        leftRearHandle.position.set(-this.width/2 - 0.01, this.height * 0.35, -this.length * 0.15);
        this.carGroup.add(leftRearHandle);

        const rightRearHandleGeometry = new THREE.BoxGeometry(this.width * 0.02, this.height * 0.02, this.height * 0.08);
        const rightRearHandle = new THREE.Mesh(rightRearHandleGeometry, handleMaterial);
        rightRearHandle.position.set(this.width/2 + 0.01, this.height * 0.35, -this.length * 0.15);
        this.carGroup.add(rightRearHandle);
    }

    addTireTreads(wheelPositions, wheelRadius, wheelThickness) {
        const treadMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x050505,
            roughness: 0.9
        });
        
        for (let i = 0; i < wheelPositions.length; i++) {
            
            for (let j = 0; j < 12; j++) {
                const angle = (j / 12) * Math.PI * 2;
                const treadGeometry = new THREE.BoxGeometry(0.1, wheelRadius * 0.1, wheelThickness * 1.1);
                const tread = new THREE.Mesh(treadGeometry, treadMaterial);

                const x = Math.sin(angle) * wheelRadius;
                const y = Math.cos(angle) * wheelRadius;
                
                tread.position.set(
                    wheelPositions[i].x,
                    wheelPositions[i].y + y,
                    wheelPositions[i].z + x
                );

                tread.rotation.set(0, angle, 0);
                
                this.carGroup.add(tread);
            }
        }
    }
    
    setupControls() {
        
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.actions.acceleration = true;
                    break;
                case 'ArrowDown':
                    this.actions.braking = true;
                    break;
                case 'ArrowLeft':
                    this.actions.left = true;
                    break;
                case 'ArrowRight':
                    this.actions.right = true;
                    break;
                case 'r': 
                    this.resetCar();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.actions.acceleration = false;
                    break;
                case 'ArrowDown':
                    this.actions.braking = false;
                    break;
                case 'ArrowLeft':
                    this.actions.left = false;
                    break;
                case 'ArrowRight':
                    this.actions.right = false;
                    break;
            }
        });
    }
    
    setupCameraControls() {
        
        document.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.lastMouseX = e.clientX;
        });
        
        document.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.mouseDown) {
                
                const deltaX = e.clientX - this.lastMouseX;
                this.lastMouseX = e.clientX;

                this.cameraAngle -= deltaX * 0.01; 
            }
        });

        document.addEventListener('wheel', (e) => {
            
            this.cameraDistance += e.deltaY * 0.01;

            this.cameraDistance = Math.max(5, Math.min(25, this.cameraDistance));
        });
    }
    
    resetCar() {
        
        this.chassisBody.position.copy(this.initialPosition);
        this.chassisBody.velocity.set(0, 0, 0);
        this.chassisBody.angularVelocity.set(0, 0, 0);

        const yQuaternion = new CANNON.Quaternion();
        yQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.initialRotation);
        this.chassisBody.quaternion.copy(yQuaternion);

        this.currentSpeed = 0;
        this.speed = 0;
        this.rotation = this.initialRotation;
        this.wheelRotation = 0;

        if (this.isNearBoundary) {
            this.chassisMesh.material.color.setRGB(0.2, 0.4, 0.8); 
            this.isNearBoundary = false;
        }
        
        console.log("Car reset to initial position");
    }
    
    update() {
        try {

            if (this.chassisBody.position.y < 0 || this.chassisBody.position.y > 5) {
                this.resetCar();
                return;
            }

            const mapBoundary = 90; 
            if (Math.abs(this.chassisBody.position.x) > mapBoundary || 
                Math.abs(this.chassisBody.position.z) > mapBoundary) {
                console.log("Car left the map boundary, resetting position");
                this.resetCar();
                return;
            }

            const distanceToEdgeX = mapBoundary - Math.abs(this.chassisBody.position.x);
            const distanceToEdgeZ = mapBoundary - Math.abs(this.chassisBody.position.z);
            const minDistance = Math.min(distanceToEdgeX, distanceToEdgeZ);

            const wasNearBoundary = this.isNearBoundary;
            this.isNearBoundary = minDistance < this.warningDistance;

            if (this.isNearBoundary) {
                
                this.chassisMesh.material.color.setRGB(1, 0.3, 0.3);

                if (minDistance < this.warningDistance / 3) {
                    this.currentSpeed *= 0.95; 
                }
            } else if (wasNearBoundary) {
                
                this.chassisMesh.material.color.setRGB(0.2, 0.4, 0.8); 
            }

            if (this.actions.acceleration) {
                this.currentSpeed += this.acceleration;
                if (this.currentSpeed > this.maxSpeed) this.currentSpeed = this.maxSpeed;
            } else if (this.actions.braking) {
                if (this.currentSpeed > 0.1) {
                    this.currentSpeed -= this.brakeForce;
                } else if (Math.abs(this.currentSpeed) < 0.1) {
                    this.currentSpeed = -0.1;
                } else {
                    this.currentSpeed -= this.acceleration / 2;
                    if (this.currentSpeed < -this.maxSpeed/5) this.currentSpeed = -this.maxSpeed/5;
                }
            } else {
                
                if (this.currentSpeed > 0) {
                    this.currentSpeed -= this.deceleration;
                    if (this.currentSpeed < 0) this.currentSpeed = 0;
                } else if (this.currentSpeed < 0) {
                    this.currentSpeed += this.deceleration;
                    if (this.currentSpeed > 0) this.currentSpeed = 0;
                }
            }

            if (this.actions.left) {
                if (Math.abs(this.currentSpeed) > 0.05) { 
                    
                    const factor = Math.max(0.6, 1 - (Math.abs(this.currentSpeed) / this.maxSpeed) * 0.15);
                    this.rotation += this.turnSpeed * factor * (this.currentSpeed > 0 ? 1 : -1);
                }
            } else if (this.actions.right) {
                if (Math.abs(this.currentSpeed) > 0.05) { 
                    
                    const factor = Math.max(0.6, 1 - (Math.abs(this.currentSpeed) / this.maxSpeed) * 0.15);
                    this.rotation -= this.turnSpeed * factor * (this.currentSpeed > 0 ? 1 : -1);
                }
            }

            const moveX = Math.sin(this.rotation) * this.currentSpeed;
            const moveZ = Math.cos(this.rotation) * this.currentSpeed;

            const newX = this.chassisBody.position.x + moveX;
            const newZ = this.chassisBody.position.z + moveZ;

            this.chassisBody.position.x = newX;
            this.chassisBody.position.z = newZ;
            this.chassisBody.velocity.set(moveX * 10, this.chassisBody.velocity.y, moveZ * 10);

            const yQuaternion = new CANNON.Quaternion();
            yQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.rotation);
            this.chassisBody.quaternion.copy(yQuaternion);

            if (this.chassisBody.position.y < 0.5) {
                this.chassisBody.position.y = 0.5;
                this.chassisBody.velocity.y = 0;
            }

            this.speed = Math.abs(this.currentSpeed);

            this.carGroup.position.copy(this.chassisBody.position);
            this.carGroup.quaternion.copy(this.chassisBody.quaternion);

            const steeringAngle = Math.PI / 8; 
            
            if (this.actions.left) {
                
                this.wheelMeshes[0].rotation.y = steeringAngle;
                this.wheelMeshes[1].rotation.y = steeringAngle;
            } else if (this.actions.right) {
                
                this.wheelMeshes[0].rotation.y = -steeringAngle;
                this.wheelMeshes[1].rotation.y = -steeringAngle;
            } else {
                
                this.wheelMeshes[0].rotation.y = 0;
                this.wheelMeshes[1].rotation.y = 0;
            }

            const carPosition = new THREE.Vector3().copy(this.chassisBody.position);
            
            const cameraX = carPosition.x + Math.sin(this.cameraAngle) * this.cameraDistance;
            const cameraZ = carPosition.z + Math.cos(this.cameraAngle) * this.cameraDistance;
            const cameraY = carPosition.y + this.cameraHeight;
            
            this.camera.position.set(cameraX, cameraY, cameraZ);
            
            const lookAtPos = new THREE.Vector3(
                carPosition.x,
                carPosition.y + 1,
                carPosition.z
            );
            this.camera.lookAt(lookAtPos);
            
        } catch (error) {
            console.error("Error in car update:", error);
        }
    }

    getPosition() {
        return new THREE.Vector3(
            this.chassisBody.position.x,
            this.chassisBody.position.y,
            this.chassisBody.position.z
        );
    }

    getRotation() {
        return new THREE.Quaternion(
            this.chassisBody.quaternion.x,
            this.chassisBody.quaternion.y,
            this.chassisBody.quaternion.z,
            this.chassisBody.quaternion.w
        );
    }

    getSpeed() {
        return this.speed;
    }
} 