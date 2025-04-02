let targetRotationX = 0.000;
let targetRotationY = 0.000;
let mouseX = 0, mouseXOnMouseDown = 0, mouseY = 0, mouseYOnMouseDown = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
const slowingFactor = 0.98;
const dragFactor = 0.01;

async function fetchData() {
    try {
        const response = await fetch('/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}


function onDocumentMouseDown(event) {
    event.preventDefault();
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    mouseXOnMouseDown = event.clientX - windowHalfX;
    mouseYOnMouseDown = event.clientY - windowHalfY;
}

function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    targetRotationX = (mouseX - mouseXOnMouseDown) * dragFactor;
    mouseY = event.clientY - windowHalfY;
    targetRotationY = (mouseY - mouseYOnMouseDown) * dragFactor;
    mouseXOnMouseDown = mouseX;
    mouseYOnMouseDown = mouseY;
}

function onDocumentMouseUp(event) {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    targetRotationX = 0;
    targetRotationY = 0;
}

async function main() {
    const data = await fetchData();
    console.log(data);

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#globe') });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('texture/earthmap.jpeg'),
        bumpMap: new THREE.TextureLoader().load('texture/earthbump.jpeg'),
        bumpScale: 1,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    const pointLight = new THREE.PointLight(0xffffff, 5, 4);
    pointLight.position.set(1, 1, 2);
    scene.add(pointLight);

    const cloudGeometry = new THREE.SphereGeometry(0.52, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('texture/earthCloud.png'),
        transparent: true
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);

    const dots = [];

    const dotGeometry = new THREE.SphereGeometry(0.01, 8, 8);
    const dotMaterialSus = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const dotMaterialNormal = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    data.forEach(point => {
        const lat = point.Latitude * (Math.PI / 180);
        const lon = -point.Longitude * (Math.PI / 180);
        const r = 0.51;
        const x = r * Math.cos(lat) * Math.cos(lon);
        const y = r * Math.sin(lat);
        const z = r * Math.cos(lat) * Math.sin(lon);
        const dotMesh = new THREE.Mesh(dotGeometry, point.suspicious ? dotMaterialSus : dotMaterialNormal);
        dotMesh.position.set(x, y, z);

        dotMesh.userData.ipAddress = point["ip address"];
        dotMesh.userData.suspicious = point.suspicious;
        dotMesh.userData.z = z;
        earthMesh.add(dotMesh);
        dots.push(dotMesh);
    });

    const starGeometry = new THREE.SphereGeometry(5, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('texture/galaxy.png'),
        side: THREE.BackSide
    });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starMesh);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1.7;

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    renderer.domElement.addEventListener('mousemove', (event) => {
        mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        raycaster.setFromCamera(mouseVector, camera);
        const intersects = raycaster.intersectObjects(dots);
        if (intersects.length > 0) {
            const dotWorldPos = new THREE.Vector3();
            intersects[0].object.getWorldPosition(dotWorldPos);
            const normal = dotWorldPos.clone().normalize();
            const camToDot = camera.position.clone().sub(dotWorldPos).normalize();
            
            if (normal.dot(camToDot) > 0) {
                const ip = intersects[0].object.userData.ipAddress;
                const suspicious = intersects[0].object.userData.suspicious;
                tooltip.style.backgroundColor = suspicious ? 'rgba(240,10,50,0.6)' : 'rgba(10,240,50,0.6)';
                tooltip.innerHTML = 'IP Address: ' + ip;
                tooltip.style.left = (event.clientX + 10) + 'px';
                tooltip.style.top = (event.clientY + 10) + 'px';
                tooltip.style.display = 'block';
            } else {
                tooltip.style.display = 'none';
            }
        } else {
            tooltip.style.display = 'none';
        }
    });

    const render = () => {
        earthMesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), targetRotationX);
        earthMesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), targetRotationY);
        cloudMesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), targetRotationX);
        cloudMesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), targetRotationY);
        renderer.render(scene, camera);
    }
    const animate = () => {
        requestAnimationFrame(animate);
        render();
    }
    animate();
    document.addEventListener('mousedown', onDocumentMouseDown, false);
}
window.onload = main;