/*
 * Grammar information.
 */
var generations =                           3;
var pitch =                              22.5;
var yaw =                                22.5;
var axiom_sequence =                    "X+X";
var x_sequence = "X=F->[[X]+X]<+F[R+<FGX>]-X";
var f_sequence =                        "F=F";

// Quickly tokenize sequences for use below
var axiom = axiom_sequence.split("");
var x_seq = x_sequence.split("=")[1].split("");
var f_seq = f_sequence.split("=")[1].split("");

// Convert pitch, yaw to radians
var rot_angle_Z = pitch * Math.PI / 180;
var rot_angle_X = yaw * Math.PI / 180;

/*
 * Scene and renderer setup
 */
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/*
 * Camera setup
 */
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 0, 40);
camera.up.set( 0, 0, 1 );
var controls = new THREE.OrbitControls( camera );
controls.update();

/*
* Add fish to the scene
*/
var numberOfFish = 300;

for (var i = 0; i < numberOfFish; i++) {
    CreateFish(scene);
}

// Start plant
var i;
for (i = -8; i <= 8; i++) {
  var j;
  for (j = -8; j <= 8; j++) {
    var start = new THREE.Vector3(i * 20, j * 20, 0);
    var axiom_copy = axiom.slice(0);
    draw(start, axiom_copy);
  }
}

// Sandy Terrain
var loader = new THREE.TextureLoader();
var groundGeometry = new THREE.PlaneGeometry( 1000, 1000 );
var groundMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, map: loader.load( 'textures/ground_texture.png' ), repeat: new THREE.Vector2(100, 100) } );
var ground = new THREE.Mesh( groundGeometry, groundMaterial );
scene.add( ground );

// Ocean
var oceanGeometry = new THREE.SphereGeometry( 750 );
var oceanMaterial = new THREE.MeshBasicMaterial( { color: 0x0077be, side: THREE.DoubleSide } );
var ocean = new THREE.Mesh( oceanGeometry, oceanMaterial );
scene.add( ocean );

// Fog
scene.fog = new THREE.Fog( 0x0077be, 50, 500 );

/*
 * Render
 */
render();

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    render();
}
animate();

function render() {
    UpdateFish();
    renderer.render( scene, camera );
}

function draw(v, seq, gen = 0, angle_Z = 1.57079632679, angle_X = 1) {
    var result = "";
    if (gen >= generations) {
        return result;
    }
    var color = 0x00ff00;
    while (seq.length > 0) {
        var token = seq.shift();
        if (token == 'F') {
            var v_copy = new THREE.Vector3().copy(v);
            v.x += Math.pow(1, gen) * Math.sin(angle_X) * Math.cos(angle_Z);
            v.y += Math.pow(1, gen) * Math.sin(angle_Z);
            v.z += Math.pow(1, gen) * Math.cos(angle_X) * Math.sin(angle_Z);
            drawLine(v, v_copy, color);
            var f_seq_copy = f_seq.slice(0);
            result += "F" + draw(v, f_seq_copy, gen + 1, angle_Z, angle_X);
        } else if (token == 'X') {
            var x_seq_copy = x_seq.slice(0);
            var v_copy = new THREE.Vector3().copy(v);
            result += draw(v_copy, x_seq_copy, gen + 1, angle_Z, angle_X);
        } else if (token == '+') {
            result += "+";
            angle_Z += randAngle(rot_angle_Z);
        } else if (token == '-') {
            result += "-";
            angle_Z -= randAngle(rot_angle_Z);
        } else if (token == '>') {
            result += ">";
            angle_X += randAngle(rot_angle_X);
        } else if (token == '<') {
            result += "<";
            angle_X -= randAngle(rot_angle_X);
        } else if (token == '[') {
            result += draw(v, seq, gen, angle_Z, angle_X);
        } else if (token == ']') {
            return result;
        } else if (token == 'R') {
            result += "R";
            color = 0xFF0000;
        } else if (token == 'G') {
            result += "G";
            color = 0x00FF00;
        } else if (token == '#') {
            result += "#";
            var boxGeometry = new THREE.BoxGeometry( 0.05, 0.05, 0.05 );
            var boxMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFF00 });
            var box = new THREE.Mesh ( boxGeometry, boxMaterial );
            box.position.set(v.x, v.y, v.z);
            scene.add( box );
        } else {
            console.error("Unexpected symbol: \'" + token + "\'")
        }
    }
    return result;
}

function drawLine(v1, v2, color) {
    var material = new THREE.LineBasicMaterial( { color: color } );
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3().copy(v1) );
    geometry.vertices.push(new THREE.Vector3().copy(v2) );
    var line = new THREE.Line( geometry, material );
    scene.add(line);
}

function randAngle(rot_angle) {
    return Math.random() * (rot_angle + 0.025) + (rot_angle - 0.025);
}
