
document.addEventListener('DOMContentLoaded', () => {
    
    const canvas = document.getElementById('game-canvas');
    const loadingScreen = document.querySelector('.loading-screen');
    const startButton = document.getElementById('start-button');
    const progressBar = document.querySelector('.progress-bar');

    let scene, camera, renderer, physicsWorld;
    let car, world;
    let clock, lastElapsedTime = 0;
    let currentInteractiveObject = null;
    let isExperienceStarted = false;

    function init() {
        try {
            console.log('Initializing game...');
            
            setupThreeJS();

            setupPhysics();

            world = new World(scene, physicsWorld);

            car = new Car(scene, physicsWorld, camera);

            if (isMobile()) {
                setupMobileControls(car);
            }

            setupEventListeners();

            clock = new THREE.Clock();
            animate();
            
            console.log('Game initialized successfully!');

            hideLoadingScreen();

            document.querySelector('.footer').style.opacity = '1';
        } catch (error) {
            console.error('Error initializing game:', error);
            debug.update('Error: ' + error.message);
        }
    }

    function setupThreeJS() {
        
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.FogExp2(0x000000, 0.01);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 3, -6);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        window.addEventListener('resize', () => {
            
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }

    function setupPhysics() {
        physicsWorld = new CANNON.World();
        physicsWorld.gravity.set(0, -9.82, 0); 
        physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
        physicsWorld.defaultContactMaterial.friction = 0.3;
    }

    function setupEventListeners() {
        
        startButton.addEventListener('click', () => {
            startExperience();
            isExperienceStarted = true;

            document.querySelector('.footer').style.opacity = '1';
        });

        const closeButton = document.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            document.getElementById('info-panel').classList.add('hidden');
        });
    }

    function hideLoadingScreen() {
        
        progressBar.style.width = '100%';

        setTimeout(() => {
            gsap.to(loadingScreen, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    loadingScreen.style.display = 'none';
                }
            });
        }, 500);
    }

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - lastElapsedTime;
        lastElapsedTime = elapsedTime;

        if (deltaTime > 0.1) return;

        physicsWorld.step(1/60, deltaTime, 3);

        if (car) {
            car.update();

            if (isExperienceStarted) {
                checkInteractions();
            }
        }

        if (world) {
            world.update(deltaTime, camera);
        }

        renderer.render(scene, camera);
    }

    function checkInteractions() {
        const carPosition = car.getPosition();
        const interactiveObject = world.checkInteractions(carPosition);

        if (interactiveObject && (!currentInteractiveObject || interactiveObject.data.id !== currentInteractiveObject.data.id)) {
            currentInteractiveObject = interactiveObject;

            if (interactiveObject.type === 'section') {
                const section = interactiveObject.data;
                showInfoPanel(section.title, section.content);
            }
        } 
        
        else if (!interactiveObject && currentInteractiveObject) {
            currentInteractiveObject = null;
            hideInfoPanel();
        }
    }

    console.log('Starting initialization...');

    setTimeout(() => {
        
        init();
    }, 1000);

    function startExperience() {
        
        const introOverlay = document.querySelector('.intro-overlay');
        gsap.to(introOverlay, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                introOverlay.style.display = 'none';

                document.body.classList.add('game-active');

                if (isMobile()) {
                    document.querySelector('.mobile-controls').classList.remove('hidden');
                }
            }
        });
    }
}); 