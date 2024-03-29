/*global
    use, THREE, THREEx, $, Physijs, window, Detector, requestAnimationFrame
*/
Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';
var renderer, scene, container, controls, camera;
var keyboard = new THREEx.KeyboardState();
var dominos = [];
var touched = false;
var addDom = true;
var item = 0;
var pickedObject;
var selMaterial = 'floor15';
var floatDomino = 0;
var dominoGeometry = 0;
var floor = 0;

function handleCollision(ignore, b) {
    'use strict';
    var force = b;
    var listener = new THREE.AudioListener();
    camera.add(listener);
    var sound = new THREE.Audio(listener);
    scene.add(sound);
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/audio/snap.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        if ((3 < Math.abs(force.x) || 3 < Math.abs(force.y) || 3 < Math.abs(force.z)) && Math.abs(force.x) < 11 && Math.abs(force.y) < 11 && Math.abs(force.z) < 11) {
            sound.setVolume(0.05);
        } else if ((10 < Math.abs(force.x) || 10 < Math.abs(force.y) || 10 < Math.abs(force.z)) && Math.abs(force.x) < 51 && Math.abs(force.y) < 51 && Math.abs(force.z) < 51) {
            sound.setVolume(0.2);
        } else if (Math.abs(force.x) > 50 || Math.abs(force.y) > 50 || Math.abs(force.z) > 50) {
            sound.setVolume(0.5);
        } else {
            sound.setVolume(0.0);
        }
        sound.play();
    });
}

function onDocumentMouseDown(event) {
    'use strict';
    var a;
    var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector = vector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersectsDomino = raycaster.intersectObject(floor);
    if (event.button === 0 && touched === false && addDom === true && !keyboard.pressed("shift") && intersectsDomino[0] !== undefined) {
        var dominoTexture = new THREE.TextureLoader().load('assets/textures/' + selMaterial + '.png');
        dominoTexture.wrapS = THREE.RepeatWrapping;
        dominoTexture.wrapT = THREE.RepeatWrapping;
        dominoTexture.repeat.set(1, 8);
        var domino = new Physijs.BoxMesh(dominoGeometry, Physijs.createMaterial(
            new THREE.MeshLambertMaterial({
                map: dominoTexture,
                side: THREE.FrontSide
                //color: selColor
            }),
            0.5,
            0.5
        ));
        domino.__dirtyRotation = true;
        domino.position.y = 3.5;
        domino.material.needsUpdate = true;
        domino.position.x = intersectsDomino[0].point.x;
        domino.position.y = intersectsDomino[0].point.y + 30;
        domino.position.z = intersectsDomino[0].point.z;
        domino.rotation.y = floatDomino.rotation.y;
        domino._physijs.mass = 50;
        domino.value = 'domino';
        domino.addEventListener('collision', handleCollision);
        scene.add(domino);
        dominos.push(domino);
    }
    if (event.button === 0 && addDom === false) {
        for (a = 0; a < dominos.length; a += 1) {
            dominos[a].material.transparent = false;
            dominos[a].material.opacity = 1;
        }
        const intersectedObjects = raycaster.intersectObjects(scene.children);
        if (intersectedObjects.length) {
            if (intersectedObjects[0].object.value === 'domino') {
                pickedObject = intersectedObjects[0].object;
                //  pickedObject.material.color.setHex(selColor);
                pickedObject.material.map = new THREE.TextureLoader().load('assets/textures/' + selMaterial + '.png');
                pickedObject.material.transparent = true;
                pickedObject.material.opacity = 0.6;
                pickedObject.material.needsUpdate = true;
            }
        }
    }
}

function onDocumentMouseMove(event) {
    'use strict';
    var vertexIndex, localVertex, globalVertex, directionVector, ray, collisionResults;
    var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector = vector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersectsFloatDomino = raycaster.intersectObject(floor);
    if (intersectsFloatDomino[0]) {
        floatDomino.position.set(intersectsFloatDomino[0].point.x, intersectsFloatDomino[0].point.y + 30, intersectsFloatDomino[0].point.z);
    }
    //  floatDomino.material.color.setHex(selColor);
    //floatDomino.material.map = new THREE.TextureLoader().load('../assets/textures/' + selMaterial + '.png');
    //floatDomino.material.needsUpdate = true;
    var originPoint = floatDomino.position.clone();
    for (vertexIndex = 0; vertexIndex < floatDomino.geometry.vertices.length; vertexIndex += 1) {
        localVertex = floatDomino.geometry.vertices[vertexIndex].clone();
        globalVertex = localVertex.applyMatrix4(floatDomino.matrix);
        directionVector = globalVertex.sub(floatDomino.position);
        ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        collisionResults = ray.intersectObjects(dominos);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            floatDomino.material.wireframe = true;
            touched = true;
        } else {
            floatDomino.material.wireframe = false;
            touched = false;
        }
    }
}

function onDocumentKeyDown(event) {
    'use strict';
    var rotateAngle = Math.PI / 16;
    if (keyboard.pressed("a")) {
        scene.add(floatDomino);
        addDom = true;
    }
    if (event.code === "Escape") {
        scene.remove(floatDomino);
        addDom = false;
    }
    if ((keyboard.pressed("x") || event.code === "Delete") && addDom === false && pickedObject !== undefined) {
        scene.remove(pickedObject);
        dominos = dominos.filter(function () {
            return item !== pickedObject;
        });
        pickedObject = undefined;
    }
    if (keyboard.pressed("right") && addDom === false) {
        if (pickedObject !== undefined) {
            pickedObject.rotation.x = -0.3;
            pickedObject.rotation.z = -0.3;
            pickedObject.__dirtyRotation = true;
        } else if (dominos[0] !== undefined) {
            dominos[0].rotation.x = -0.3;
            dominos[0].rotation.z = -0.3;
            dominos[0].__dirtyRotation = true;
        } else {
            return;
        }
    }
    if (keyboard.pressed("0")) {
        location.reload();
    }
    if (keyboard.pressed("r") && addDom === true) {
        floatDomino.rotation.y += rotateAngle;
        floatDomino.__dirtyRotation = true;
    }
    if (keyboard.pressed("r") && addDom === false && pickedObject !== undefined) {
        pickedObject.rotation.y -= rotateAngle;
        pickedObject.__dirtyRotation = true;
    }
}

function init() {
    'use strict';
    var i;
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener("keydown", onDocumentKeyDown, false);
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -2000, 0));
    var screen_w = window.innerWidth;
    var screen_h = window.innerHeight;
    var view_angle = 45;
    var aspect = screen_w / screen_h;
    var near = 0.1;
    var far = 20000;
    camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);
    scene.add(camera);
    camera.position.set(0, 150, 400);
    camera.lookAt(scene.position);
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
    } else {
        renderer = new THREE.CanvasRenderer();
    }
    renderer.setSize(screen_w, screen_h);
    container = document.getElementById('dominoSite');
    container.appendChild(renderer.domElement);
    THREEx.WindowResize(renderer, camera);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    var dominoTexture = new THREE.TextureLoader().load('assets/textures/' + selMaterial + '.png');
    dominoTexture.wrapS = THREE.RepeatWrapping;
    dominoTexture.wrapT = THREE.RepeatWrapping;
    dominoTexture.repeat.set(1, 8);
    var dominoMaterial = Physijs.createMaterial(
        new THREE.MeshLambertMaterial(new THREE.MeshLambertMaterial({
            map: dominoTexture,
            side: THREE.FrontSide
                //color: selColor
        }),
                0.5,
                0.5)
    );
    dominoGeometry = new THREE.BoxGeometry(5, 60, 25, dominoMaterial);
    var light = new THREE.HemisphereLight(0xffffbb, 0xadd8e6, 1);
    scene.add(light);
    var floorTexture = new THREE.TextureLoader().load('assets/textures/floor_08.png');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(8, 8);
    var floorMaterial = Physijs.createMaterial(new THREE.MeshPhongMaterial({
        map: floorTexture,
        side: THREE.FrontSide
    }), 0.9, 0.3);
    floor = new Physijs.BoxMesh(new THREE.BoxGeometry(500, 500, 3), floorMaterial, 0);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    var imagePrefix = "assets/textures/15.png";
    var wallTexture = new THREE.TextureLoader().load(imagePrefix);
    //wallTexture.repeat.set( 8, 8 );
    //  var directions  = ["1", "2", "3", "4", "5", "6"];
    //  var imageSuffix = ".jpg";
    var backgroundPic = new THREE.BoxGeometry(5000, 5000, 5000);
    var materialArray = [];
    for (i = 0; i < 6; i += 1) {
        materialArray.push(new THREE.MeshBasicMaterial({
            map: wallTexture,
            side: THREE.BackSide
        }));
    }
    //var backgroundMaterial = new THREE.Mesh( materialArray );
    var backgroundBox = new THREE.Mesh(backgroundPic, materialArray);
    scene.add(backgroundBox);
    floatDomino = new THREE.Mesh(dominoGeometry, dominoMaterial);
    floatDomino.position.x = 0;
    floatDomino.position.y = 30;
    floatDomino.position.z = 0;
    floatDomino.material.needsUpdate = true;
    scene.add(floatDomino);
}
$(function () {
    'use strict';
    $("#infoBox").css({
        background: "rgba(255,255,255,0.5)"
    }).dialog({
        autoOpen: false,
        show: {
            effect: 'fade',
            duration: 500
        },
        hide: {
            effect: 'fade',
            duration: 500
        }
    });

    $("#infoButton")
        .text("") // sets text to empty
        .css({
            "z-index": "2",
            background: "rgba(0,0,0,0)",
            opacity: "0.9",
            position: "absolute",
            top: "8px",
            left: "14px"
        }) // adds CSS
        .append("<img width='32' height='32' src='assets/textures/icinf.png'/>")
        .button()
        .click(
            function () {
                $("#infoBox").dialog("open");
            }
        );

    $("#color")
        .css({
            "z-index": "2",
            backgroung: "rgba(0,0,0,0)",
            opacity: "0.9",
            position: "absolute",
            top: "8px",
            right: "14px"
        })
        .append("<img width='32' id='red' height='32' src='assets/textures/icon-red.png'/>")
        .append("<img width='32' id='green' height='32' src='assets/textures/icon-green.png'/>")
        .append("<img width='32' id='blue' height='32' src='assets/textures/icon-blue.png'/>");

    $("#red").click(function () {
        selMaterial = 'floor06';
        floatDomino.material.map = new THREE.TextureLoader().load('assets/textures/' + selMaterial + '.png');
        floatDomino.material.map.wrapS = THREE.RepeatWrapping;
        floatDomino.material.map.wrapT = THREE.RepeatWrapping;
        floatDomino.material.map.repeat.set(1, 8);
        floatDomino.material.needsUpdate = true;
    });

    $("#green").click(function () {
        selMaterial = 'floor_06';
        floatDomino.material.map = new THREE.TextureLoader().load('assets/textures/' + selMaterial + '.png');
        floatDomino.material.map.wrapS = THREE.RepeatWrapping;
        floatDomino.material.map.wrapT = THREE.RepeatWrapping;
        floatDomino.material.map.repeat.set(1, 8);
        floatDomino.material.needsUpdate = true;
    });

    $("#blue").click(function () {
        selMaterial = 'floor15';
        floatDomino.material.map = new THREE.TextureLoader().load('assets/textures/' + selMaterial + '.png');
        floatDomino.material.map.wrapS = THREE.RepeatWrapping;
        floatDomino.material.map.wrapT = THREE.RepeatWrapping;
        floatDomino.material.map.repeat.set(1, 8);
        floatDomino.material.needsUpdate = true;
    });
});


function update() {
    'use strict';
    controls.update();
}

function render() {
    'use strict';
    scene.simulate(undefined, 1);
    renderer.render(scene, camera);
}

function animate() {
    'use strict';
    requestAnimationFrame(animate);
    render();
    update();
}

init();
animate();
