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

// Add this function to plot requests per day
function plotRequestsPerDay(data) {
    // Aggregate counts per day
    const counts = {};
    data.forEach(row => {
        const date = new Date(row.Timestamp * 1000).toISOString().slice(0, 10);
        counts[date] = (counts[date] || 0) + 1;
    });
    const labels = Object.keys(counts).sort();
    const values = labels.map(date => counts[date]);

    // Create or get the canvas
    let canvas = document.getElementById('requests-per-day-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'requests-per-day-canvas';
        canvas.width = 320;
        canvas.height = 160;
        canvas.style.position = 'fixed';
        canvas.style.left = '20px';
        canvas.style.bottom = '20px';
        canvas.style.background = 'rgba(255,255,255,0.95)';
        canvas.style.border = '1px solid #ccc';
        canvas.style.zIndex = 1000;
        document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, 140);
    ctx.lineTo(310, 140);
    ctx.stroke();

    // Draw bars
    const maxVal = Math.max(...values, 1);
    const barWidth = Math.max(10, Math.floor((260 / values.length)));
    values.forEach((v, i) => {
        const x = 45 + i * barWidth;
        const y = 140 - (v / maxVal) * 120;
        ctx.fillStyle = '#4287f5';
        ctx.fillRect(x, y, barWidth - 2, 140 - y);
    });

    // Draw labels (dates, only every Nth if too many)
    ctx.fillStyle = '#222';
    ctx.font = '10px sans-serif';
    let step = 1;
    if (labels.length > 8) step = Math.ceil(labels.length / 8);
    labels.forEach((label, i) => {
        if (i % step === 0) {
            ctx.save();
            ctx.translate(45 + i * barWidth + barWidth / 2, 150);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText(label.slice(5), 0, 0); // show MM-DD
            ctx.restore();
        }
    });

    // Draw y-axis label
    ctx.save();
    ctx.translate(10, 100);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Requests', 0, 0);
    ctx.restore();

    // Draw title
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Requests per Day', 100, 20);
}

// Update this function to plot requests per hour
function plotRequestsPerHour(data) {
    // Aggregate counts per hour
    const counts = {};
    data.forEach(row => {
        const date = new Date(row.Timestamp * 1000);
        // Format: YYYY-MM-DD HH
        const hourLabel = date.toISOString().slice(0, 13).replace('T', ' ');
        counts[hourLabel] = (counts[hourLabel] || 0) + 1;
    });
    const labels = Object.keys(counts).sort();
    const values = labels.map(label => counts[label]);

    // Create or get the canvas
    let canvas = document.getElementById('requests-per-day-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'requests-per-day-canvas';
        canvas.width = 420;
        canvas.height = 180;
        canvas.style.position = 'fixed';
        canvas.style.left = '20px';
        canvas.style.bottom = '20px';
        canvas.style.background = 'rgba(255,255,255,0.95)';
        canvas.style.border = '1px solid #ccc';
        canvas.style.zIndex = 1000;
        document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, 150);
    ctx.lineTo(400, 150);
    ctx.stroke();

    // Draw bars
    const maxVal = Math.max(...values, 1);
    const barWidth = Math.max(6, Math.floor((340 / values.length)));
    values.forEach((v, i) => {
        const x = 55 + i * barWidth;
        const y = 150 - (v / maxVal) * 120;
        ctx.fillStyle = '#4287f5';
        ctx.fillRect(x, y, barWidth - 2, 150 - y);
    });

    // Draw labels (hours, only every Nth if too many)
    ctx.fillStyle = '#222';
    ctx.font = '10px sans-serif';
    let step = 1;
    if (labels.length > 12) step = Math.ceil(labels.length / 12);
    labels.forEach((label, i) => {
        if (i % step === 0) {
            ctx.save();
            ctx.translate(55 + i * barWidth + barWidth / 2, 160);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText(label.slice(11), 0, 0); // show HH
            ctx.restore();
        }
    });

    // Draw y-axis label
    ctx.save();
    ctx.translate(15, 100);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Requests', 0, 0);
    ctx.restore();

    // Draw title
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Requests per Hour', 140, 35);
}

// Update this function to plot requests per minute
function plotRequestsPerMinute(data) {
    // Aggregate counts per minute
    const counts = {};
    data.forEach(row => {
        const date = new Date(row.Timestamp * 1000);
        // Format: YYYY-MM-DD HH:MM
        const minLabel = date.toISOString().slice(0, 16).replace('T', ' ');
        counts[minLabel] = (counts[minLabel] || 0) + 1;
    });
    const labels = Object.keys(counts).sort();
    const values = labels.map(label => counts[label]);

    // Set a fixed, smaller canvas size for a compact plot
    const canvasWidth = 380;
    const canvasHeight = 120;
    let canvas = document.getElementById('requests-per-day-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'requests-per-day-canvas';
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.position = 'fixed';
        canvas.style.left = '20px';
        canvas.style.bottom = '20px';
        canvas.style.background = 'rgba(255,255,255,0.95)';
        canvas.style.border = '1px solid #ccc';
        canvas.style.zIndex = 1000;
        document.body.appendChild(canvas);
    } else {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Margins
    const marginLeft = 40;
    const marginRight = 10;
    const marginTop = 20;
    const marginBottom = 28;
    const plotWidth = canvasWidth - marginLeft - marginRight;
    const plotHeight = canvasHeight - marginTop - marginBottom;

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop);
    ctx.lineTo(marginLeft, canvasHeight - marginBottom);
    ctx.lineTo(canvasWidth - marginRight, canvasHeight - marginBottom);
    ctx.stroke();

    // Draw bars, fit all bars in plotWidth
    const maxVal = Math.max(...values, 1);
    const barWidth = Math.max(1, Math.floor(plotWidth / labels.length));
    values.forEach((v, i) => {
        const x = marginLeft + i * barWidth;
        const y = canvasHeight - marginBottom - (v / maxVal) * plotHeight;
        ctx.fillStyle = '#4287f5';
        ctx.fillRect(x, y, barWidth, (v / maxVal) * plotHeight);
    });

    // Draw labels (minutes, only every Nth if too many)
    ctx.fillStyle = '#222';
    ctx.font = '9px sans-serif';
    let step = 1;
    if (labels.length > 10) step = Math.ceil(labels.length / 10);
    labels.forEach((label, i) => {
        if (i % step === 0) {
            ctx.save();
            ctx.translate(marginLeft + i * barWidth + barWidth / 2, canvasHeight - marginBottom + 10);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText(label.slice(11), 0, 0); // show HH:MM
            ctx.restore();
        }
    });

    // Draw y-axis label
    ctx.save();
    ctx.translate(12, canvasHeight / 2 + 10);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Requests', 0, 0);
    ctx.restore();

    // Draw title
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Requests per Minute', marginLeft + 30, marginTop - 6);
}

async function main() {
    const data = await fetchData();

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

    plotRequestsPerDay(data);
    plotRequestsPerHour(data);
    plotRequestsPerMinute(data);

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