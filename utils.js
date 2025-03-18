function updateLoadingProgress(progress) {
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${progress * 100}%`;
}

function showInfoPanel(title, content) {
    const infoPanel = document.getElementById('info-panel');
    const infoTitle = document.getElementById('info-title');
    const infoContent = document.getElementById('info-content');
    
    infoTitle.textContent = title;
    infoContent.innerHTML = content;
    infoPanel.classList.remove('hidden');

    const closeButton = infoPanel.querySelector('.close-button');
    if (!closeButton.hasListener) {
        closeButton.addEventListener('click', () => {
            infoPanel.classList.add('hidden');
        });
        closeButton.hasListener = true;
    }
}

function hideInfoPanel() {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.classList.add('hidden');
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function showMobileControls() {
    if (isMobile()) {
        const mobileControls = document.querySelector('.mobile-controls');
        mobileControls.classList.remove('hidden');
    }
}

function setupMobileControls(car) {
    const forwardButton = document.getElementById('forward-button');
    const backwardButton = document.getElementById('backward-button');
    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');

    forwardButton.addEventListener('touchstart', () => {
        car.actions.acceleration = true;
    });
    forwardButton.addEventListener('touchend', () => {
        car.actions.acceleration = false;
    });

    backwardButton.addEventListener('touchstart', () => {
        car.actions.braking = true;
    });
    backwardButton.addEventListener('touchend', () => {
        car.actions.braking = false;
    });

    leftButton.addEventListener('touchstart', () => {
        car.actions.left = true;
    });
    leftButton.addEventListener('touchend', () => {
        car.actions.left = false;
    });

    rightButton.addEventListener('touchstart', () => {
        car.actions.right = true;
    });
    rightButton.addEventListener('touchend', () => {
        car.actions.right = false;
    });
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function startExperience() {
    
    const introOverlay = document.querySelector('.intro-overlay');
    gsap.to(introOverlay, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            introOverlay.style.display = 'none';

            if (isMobile()) {
                showMobileControls();
            }
        }
    });
}

function createDebugText() {
    const debugElement = document.createElement('div');
    debugElement.style.position = 'absolute';
    debugElement.style.top = '10px';
    debugElement.style.left = '10px';
    debugElement.style.color = 'white';
    debugElement.style.fontFamily = 'monospace';
    debugElement.style.fontSize = '12px';
    debugElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    debugElement.style.padding = '5px';
    debugElement.style.borderRadius = '3px';
    debugElement.style.zIndex = '1000';
    document.body.appendChild(debugElement);
    
    return {
        update: (text) => {
            debugElement.textContent = text;
        }
    };
}

function loadModel(path, onProgress, onComplete) {
    try {
        const loader = new THREE.GLTFLoader();
        
        loader.load(
            path,
            
            (gltf) => {
                if (onComplete) onComplete(gltf);
            },
            
            (xhr) => {
                if (xhr.lengthComputable) {
                    const percentComplete = xhr.loaded / xhr.total;
                    if (onProgress) onProgress(percentComplete);
                }
            },
            
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    } catch (error) {
        console.error('Error setting up model loader:', error);
    }
} 