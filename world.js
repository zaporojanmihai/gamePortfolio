class World {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        this.sections = [
            {
                id: 'about',
                title: 'About Me',
                content: 'Experienced in JavaScript, React, PHP, WordPress Development & Design, I build dynamic and performance websites and applications with a focus on functionality and user experience.',
                position: new THREE.Vector3(15, 0, 15), 
                color: 0x00ffff
            },
            // {
            //     id: 'skills',
            //     title: 'My Skills',
            //     content: 'JavaScript, React, PHP, Wordpress Development, WordPress Design, MySQL, GatsbyJS, GraphQL, TypeScript, SASS, Jenkins, GIT, Jira, 3D Animation, WebGL, Three.js',
            //     position: new THREE.Vector3(15, 0, -15), 
            //     color: 0xff00ff
            // },
            {
                id: 'projects',
                title: 'Projects',
                content: 'Check out my projects on <a href="https://github.com/zaporojanmihai" target="_blank">GitHub</a>.',
                position: new THREE.Vector3(-15, 0, -15), 
                color: 0xffff00
            },
            {
                id: 'contact',
                title: 'Contact Me',
                content: 'Want to work together? Feel free to reach out via <a href="mailto:zaporojanmihai@gmail.com">email</a> or connect with me on <a href="https://www.linkedin.com/in/mihai-zaporojan/" target="_blank">LinkedIn</a>. I\'m always open to new opportunities and collaborations.',
                position: new THREE.Vector3(-15, 0, 15), 
                color: 0xff0000
            }
        ];

        this.interactiveObjects = [];

        this.createSkybox();
        this.createGround();
        this.createLighting();
        this.createRoad();
        this.createTrees();
        this.createClouds();
        this.createSections();
        this.createBoundaries();
    }
    
    createSkybox() {
        
        this.scene.background = new THREE.Color(0x87CEEB); 

        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 100);
    }
    
    createGround() {
        
        const groundSize = 200; 
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4CBB17, 
            roughness: 0.8,
            metalness: 0.1
        });

        this.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        this.groundMesh.rotation.x = -Math.PI / 2;
        this.groundMesh.receiveShadow = true;
        this.scene.add(this.groundMesh);

        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 }); 
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.physicsWorld.addBody(groundBody);
    }
    
    createRoad() {
        
        const roadWidth = 8;
        const roadLength = 200;

        const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength);
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333, 
            roughness: 0.7,
            metalness: 0.1
        });

        const mainRoad = new THREE.Mesh(roadGeometry, roadMaterial);
        mainRoad.rotation.x = -Math.PI / 2;
        mainRoad.position.y = 0.01; 
        this.scene.add(mainRoad);

        this.createRoadMarkings(roadWidth, roadLength);

        this.createCircularRoad(60, 5);
    }
    
    createRoadMarkings(roadWidth, roadLength) {
        
        const centerLineGeometry = new THREE.PlaneGeometry(0.2, roadLength);
        const linesMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        const centerLine = new THREE.Mesh(centerLineGeometry, linesMaterial);
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.y = 0.02; 
        this.scene.add(centerLine);

        const dashLength = 3;
        const dashGap = 3;
        const numDashes = Math.floor(roadLength / (dashLength + dashGap));
        
        for (let i = 0; i < numDashes; i++) {
            const dashGeometry = new THREE.PlaneGeometry(0.2, dashLength);
            const dash = new THREE.Mesh(dashGeometry, linesMaterial);
            dash.rotation.x = -Math.PI / 2;

            const posZ = -roadLength/2 + (i + 0.5) * (dashLength + dashGap);

            const rightDash = dash.clone();
            rightDash.position.set(roadWidth/4, 0.02, posZ);
            this.scene.add(rightDash);

            const leftDash = dash.clone();
            leftDash.position.set(-roadWidth/4, 0.02, posZ);
            this.scene.add(leftDash);
        }
    }
    
    createCircularRoad(radius, width) {
        
        const circleSegments = 60;
        const innerRadius = radius - width/2;
        const outerRadius = radius + width/2;

        const roadGeometry = new THREE.RingGeometry(innerRadius, outerRadius, circleSegments);
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333, 
            roughness: 0.7,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        
        const circularRoad = new THREE.Mesh(roadGeometry, roadMaterial);
        circularRoad.rotation.x = -Math.PI / 2;
        circularRoad.position.y = 0.01; 
        this.scene.add(circularRoad);

        const centerRadius = (innerRadius + outerRadius) / 2;

        const centerLineGeometry = new THREE.RingGeometry(centerRadius - 0.1, centerRadius + 0.1, circleSegments);
        const linesMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        });
        
        const centerLine = new THREE.Mesh(centerLineGeometry, linesMaterial);
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.y = 0.02; 
        this.scene.add(centerLine);
    }
    
    createTrees() {
        
        const numTrees = 30; 

        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3, 8);
        const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
        
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); 
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); 

        for (let i = 0; i < numTrees; i++) {
            
            const tree = new THREE.Group();

            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1.5; 
            trunk.castShadow = true;
            tree.add(trunk);

            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 5; 
            leaves.castShadow = true;
            tree.add(leaves);

            let validPosition = false;
            let x, z;
            
            while (!validPosition) {
                
                x = (Math.random() - 0.5) * 150; 
                z = (Math.random() - 0.5) * 150; 

                const distFromOrigin = Math.sqrt(x*x + z*z);
                const notOnCircularRoad = (distFromOrigin < 55 || distFromOrigin > 65);

                const notOnStraightRoad = Math.abs(x) > 4;

                let notNearSections = true;
                for (const section of this.sections) {
                    const dx = section.position.x - x;
                    const dz = section.position.z - z;
                    const distToSection = Math.sqrt(dx*dx + dz*dz);
                    
                    if (distToSection < 10) {
                        notNearSections = false;
                        break;
                    }
                }

                let notNearOtherTrees = true;
                for (const existingTree of this.scene.children) {
                    if (existingTree instanceof THREE.Group && existingTree.children.length === 2) {
                        const dx = existingTree.position.x - x;
                        const dz = existingTree.position.z - z;
                        const distToTree = Math.sqrt(dx*dx + dz*dz);
                        
                        if (distToTree < 15) { 
                            notNearOtherTrees = false;
                            break;
                        }
                    }
                }
                
                if (notOnCircularRoad && notOnStraightRoad && notNearSections && notNearOtherTrees) {
                    validPosition = true;
                }
            }

            tree.position.set(x, 0, z);
            this.scene.add(tree);

            const treeShape = new CANNON.Cylinder(0.5, 0.7, 3, 8);
            const treeBody = new CANNON.Body({ 
                mass: 0, 
                position: new CANNON.Vec3(x, 1.5, z)
            });
            treeBody.addShape(treeShape);
            this.physicsWorld.addBody(treeBody);
        }
    }
    
    createClouds() {
        
        const numClouds = 20;
        
        for (let i = 0; i < numClouds; i++) {
            
            const cloud = new THREE.Group();

            const numPuffs = 3 + Math.floor(Math.random() * 3);
            const puffSize = 2 + Math.random() * 3;
            
            const cloudMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.9
            });
            
            for (let j = 0; j < numPuffs; j++) {
                const puffGeometry = new THREE.SphereGeometry(puffSize - Math.random(), 8, 8);
                const puff = new THREE.Mesh(puffGeometry, cloudMaterial);

                puff.position.x = j * (puffSize * 0.7) - (numPuffs * puffSize * 0.7) / 4;
                puff.position.y = Math.random() * puffSize * 0.3;
                puff.position.z = Math.random() * puffSize * 0.3 - puffSize * 0.15;
                
                cloud.add(puff);
            }

            const angle = Math.random() * Math.PI * 2;
            const radius = 60 + Math.random() * 100;
            const height = 50 + Math.random() * 30;
            
            cloud.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );

            cloud.rotation.y = Math.random() * Math.PI * 2;
            
            this.scene.add(cloud);
        }
    }
    
    createLighting() {
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xFDB813, 1); 
        directionalLight.position.set(30, 100, 30);
        directionalLight.castShadow = true;

        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);

        const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFDB813, 
            emissive: 0xFDB813
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.copy(directionalLight.position);
        this.scene.add(sun);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x4CBB17, 0.3);
        this.scene.add(hemiLight);
    }
    
    createSections() {
        this.sections.forEach(section => {
            
            this.addFloatingText(section.title, section.position, section.color);

            this.addDecorativeElements(section);

            const interactionTrigger = new THREE.Mesh(
                new THREE.BoxGeometry(4, 2, 4),
                new THREE.MeshBasicMaterial({ 
                    visible: false 
                })
            );
            interactionTrigger.position.copy(section.position);
            interactionTrigger.position.y = 1.0;
            this.scene.add(interactionTrigger);

            this.interactiveObjects.push({
                mesh: interactionTrigger,
                type: 'section',
                data: section,
                distance: 5 
            });
        });
    }
    
    addDecorativeElements(section) {
        
        switch(section.id) {
            case 'about':
                
                this.createPersonWithObject(section.position, "heart");
                break;
                
            case 'skills':
                
                this.createPersonWithObject(section.position, "code");
                break;
                
            case 'projects':
                
                this.createPersonWithObject(section.position, "tools");
                break;
                
            case 'contact':
                
                this.createPersonWithObject(section.position, "mailbox");
                break;
        }
    }

    createPersonWithObject(position, objectType) {
        
        const figureGroup = new THREE.Group();

        const skinColor = 0xF5D0A9; 
        const clothingColor = 0x4169E1; 

        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        figureGroup.add(head);

        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: clothingColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        figureGroup.add(body);

        const handGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const handMaterial = new THREE.MeshStandardMaterial({ color: skinColor });

        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.3, 1.0, 0.3); 
        figureGroup.add(leftHand);

        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.3, 1.0, 0.3); 
        figureGroup.add(rightHand);

        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: clothingColor });

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.3, 1.3, 0.15); 
        leftArm.rotation.x = Math.PI / 4; 
        figureGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.3, 1.3, 0.15); 
        rightArm.rotation.x = Math.PI / 4; 
        figureGroup.add(rightArm);

        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a }); 

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, 0.2, 0);
        figureGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, 0.2, 0);
        figureGroup.add(rightLeg);

        let object;
        
        switch(objectType) {
            case "heart":
                
                object = this.createHeart();
                object.position.set(0, 1.0, 0.4); 
                object.scale.set(0.75, 0.75, 0.75); 
                break;
                
            case "code":
                
                object = this.createCodeSymbol();
                object.position.set(0, 1.0, 0.4); 
                object.scale.set(1.0, 1.0, 0.25); 
                break;
                
            case "tools":
                
                object = this.createTools();
                object.position.set(0, 1.0, 0.4); 
                object.scale.set(0.75, 0.75, 0.75); 
                break;
                
            case "mailbox":
                
                object = this.createMailbox();
                object.position.set(0, 1.0, 0.4); 
                object.scale.set(0.9, 0.9, 0.9); 
                break;
        }
        
        if (object) {
            figureGroup.add(object);
        }

        figureGroup.position.copy(position);
        
        figureGroup.position.y = 0; 

        this.scene.add(figureGroup);
    }

    createHeart() {
        const heartGroup = new THREE.Group();

        const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const heartMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        
        const leftLobe = new THREE.Mesh(sphereGeometry, heartMaterial);
        leftLobe.position.set(-0.25, 0, 0);
        heartGroup.add(leftLobe);
        
        const rightLobe = new THREE.Mesh(sphereGeometry, heartMaterial);
        rightLobe.position.set(0.25, 0, 0);
        heartGroup.add(rightLobe);

        const coneGeometry = new THREE.ConeGeometry(0.7, 1, 16);
        const cone = new THREE.Mesh(coneGeometry, heartMaterial);
        cone.position.set(0, -0.7, 0);
        cone.rotation.x = Math.PI; 
        heartGroup.add(cone);
        
        return heartGroup;
    }

    createCodeSymbol() {
        const codeGroup = new THREE.Group();

        const codeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

        const leftBracketGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.1);
        const leftBracketLeft = new THREE.Mesh(leftBracketGeometry, codeMaterial);
        leftBracketLeft.position.set(-0.8, 0, 0);
        leftBracketLeft.rotation.z = Math.PI / 4;
        codeGroup.add(leftBracketLeft);
        
        const leftBracketRight = new THREE.Mesh(leftBracketGeometry, codeMaterial);
        leftBracketRight.position.set(-0.8, 0, 0);
        leftBracketRight.rotation.z = -Math.PI / 4;
        codeGroup.add(leftBracketRight);

        const rightBracketLeft = new THREE.Mesh(leftBracketGeometry, codeMaterial);
        rightBracketLeft.position.set(0.8, 0, 0);
        rightBracketLeft.rotation.z = -Math.PI / 4;
        codeGroup.add(rightBracketLeft);
        
        const rightBracketRight = new THREE.Mesh(leftBracketGeometry, codeMaterial);
        rightBracketRight.position.set(0.8, 0, 0);
        rightBracketRight.rotation.z = Math.PI / 4;
        codeGroup.add(rightBracketRight);

        const slashGeometry = new THREE.BoxGeometry(0.2, 1.2, 0.1);
        const slash = new THREE.Mesh(slashGeometry, codeMaterial);
        slash.position.set(0, 0, 0);
        slash.rotation.z = Math.PI / 4;
        codeGroup.add(slash);
        
        return codeGroup;
    }

    createTools() {
        const toolsGroup = new THREE.Group();

        const wrenchMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

        const handleGeometry = new THREE.BoxGeometry(0.15, 1, 0.15);
        const handle = new THREE.Mesh(handleGeometry, wrenchMaterial);
        handle.position.set(-0.4, 0, 0);
        toolsGroup.add(handle);

        const headGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16);
        const head = new THREE.Mesh(headGeometry, wrenchMaterial);
        head.position.set(-0.4, 0.5, 0);
        head.rotation.x = Math.PI / 2;
        toolsGroup.add(head);

        const hammerMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

        const hammerHandleGeometry = new THREE.BoxGeometry(0.15, 1, 0.15);
        const hammerHandle = new THREE.Mesh(hammerHandleGeometry, hammerMaterial);
        hammerHandle.position.set(0.4, 0, 0);
        toolsGroup.add(hammerHandle);

        const hammerHeadMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        const hammerHeadGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.25);
        const hammerHead = new THREE.Mesh(hammerHeadGeometry, hammerHeadMaterial);
        hammerHead.position.set(0.4, 0.5, 0);
        toolsGroup.add(hammerHead);
        
        return toolsGroup;
    }

    createMailbox() {
        const mailboxGroup = new THREE.Group();

        const mailboxMaterial = new THREE.MeshStandardMaterial({ color: 0x4682B4 });
        const boxGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.4);
        const mailbox = new THREE.Mesh(boxGeometry, mailboxMaterial);
        mailboxGroup.add(mailbox);

        const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const doorGeometry = new THREE.PlaneGeometry(0.7, 0.5);
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0, 0.21);
        mailboxGroup.add(door);

        const slotGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.05);
        const slot = new THREE.Mesh(slotGeometry, doorMaterial);
        slot.position.set(0, 0, 0.22);
        mailboxGroup.add(slot);

        const flagMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const flagPoleGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.05);
        const flagPole = new THREE.Mesh(flagPoleGeometry, flagMaterial);
        flagPole.position.set(0.425, 0.25, 0);
        mailboxGroup.add(flagPole);
        
        const flagGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.05);
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(0.6, 0.4, 0);
        mailboxGroup.add(flag);
        
        return mailboxGroup;
    }
    
    createBoundaries() {
        
        const wallSize = 100;
        const wallHeight = 5;
        const wallThickness = 1;

        const wallGeometry = new THREE.BoxGeometry(wallSize, wallHeight, wallThickness);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.2
        });

        const wallPositions = [
            { position: new THREE.Vector3(0, wallHeight / 2, wallSize / 2), rotation: new THREE.Vector3(0, 0, 0) },
            { position: new THREE.Vector3(0, wallHeight / 2, -wallSize / 2), rotation: new THREE.Vector3(0, 0, 0) },
            { position: new THREE.Vector3(wallSize / 2, wallHeight / 2, 0), rotation: new THREE.Vector3(0, Math.PI / 2, 0) },
            { position: new THREE.Vector3(-wallSize / 2, wallHeight / 2, 0), rotation: new THREE.Vector3(0, Math.PI / 2, 0) }
        ];

        wallPositions.forEach(wall => {
            
            const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
            wallMesh.position.copy(wall.position);
            wallMesh.rotation.set(wall.rotation.x, wall.rotation.y, wall.rotation.z);
            wallMesh.visible = false; 
            this.scene.add(wallMesh);

            const wallShape = new CANNON.Box(new CANNON.Vec3(wallSize / 2, wallHeight / 2, wallThickness / 2));
            const wallBody = new CANNON.Body({ mass: 0 });
            wallBody.addShape(wallShape);

            wallBody.position.set(wall.position.x, wall.position.y, wall.position.z);
            
            if (wall.rotation.y !== 0) {
                wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), wall.rotation.y);
            }
            
            this.physicsWorld.addBody(wallBody);
        });
    }

    checkInteractions(carPosition) {
        let closestObject = null;
        let closestDistance = Infinity;
        
        this.interactiveObjects.forEach(obj => {
            const distance = carPosition.distanceTo(obj.mesh.position);
            
            if (distance < obj.distance && distance < closestDistance) {
                closestDistance = distance;
                closestObject = obj;
            }
        });
        
        return closestObject;
    }

    addFloatingText(text, position, color) {
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;

        context.font = 'Bold 72px Arial';
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const gradient = context.createLinearGradient(0, 0, canvas.width, 0);

        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 1.0)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.8)`);

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'white';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        const textPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 1.25),
            material
        );

        textPlane.position.set(position.x, 6.0, position.z);

        this.scene.add(textPlane);

        if (!this.floatingTexts) this.floatingTexts = [];
        this.floatingTexts.push(textPlane);
    }

    update(deltaTime, camera) {
        
        this.scene.children.forEach(child => {
            if (child.geometry && child.geometry.type === 'BoxGeometry' && child.geometry.parameters.width === 1) {
                child.rotation.y += deltaTime * 0.5;
                child.rotation.x += deltaTime * 0.2;
            }
        });

        if (this.floatingTexts && camera) {
            this.floatingTexts.forEach(textPlane => {
                textPlane.lookAt(camera.position);
            });
        }
    }
} 