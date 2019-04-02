// Fish variables
var minBorderX = -20; // area where fish are allowed to spawn
var maxBorderX = 20;
var minBorderY = -20;
var maxBorderY = 20;

class Fish {
    constructor(position, mesh) {
      this.position = position;
      this.mesh = mesh;
      this.velocity = new THREE.Vector3(0, 0, 0);
      this.acceleration = new THREE.Vector3(.001, 0, 0);
      this.heading; // angle that fish is currently facing

      // maximum velocity a fish can travel in any direction
      this.maxVelocity = 1;
    }

    Update() {
        this.velocity = new THREE.Vector3(this.Clamp(this.velocity.x + this.acceleration.x, 0, this.maxVelocity),
                                          this.Clamp(this.velocity.y + this.acceleration.y, 0, this.maxVelocity),
                                          this.Clamp(this.velocity.z + this.acceleration.z, 0, this.maxVelocity));
        this.position = new THREE.Vector3(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.position.z + this.velocity.z);
        this.WrapAround();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    }

    ApplyForce(force) {
        this.acceleration = new THREE.Vector3(this.acceleration.x + force.x, this.acceleration.y + force.y, this.acceleration.z + force.z);
    }

    WrapAround() {
        if (this.position.x < minBorderX)
            this.position.x = maxBorderX;

        if (this.position.x > maxBorderX)
            this.position.x = minBorderX;

        if (this.position.y < minBorderY)
            this.position.y = maxBorderY;

        if (this.position.y > maxBorderY)
            this.position.y = minBorderY;
    }

    // clamps a value to a minimum and maximum value
    Clamp(x, min, max) {
        if (x < min)
            return min;
        else if (x > max)
            return max;
        else
            return x;
    }
}

var fishList = [];

function CreateFish(scene) {
    var x = minBorderX + (Math.random() * (maxBorderX - minBorderX));
    var y = minBorderY + (Math.random() * (maxBorderY - minBorderY));
    var z = 10;
    var position = new THREE.Vector3(x, y, z);

    // for now, create a sphere to represent a fish
    // TODO: replace with fish model
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    //var color = new THREE.Color(Math.random(), Math.random(), Math.random());
    var color = new THREE.Color(.9, .1, .1);
    var material = new THREE.MeshBasicMaterial( {color: color} );
    var fish = new THREE.Mesh(geometry, material);
    fish.position.set(position.x, position.y, position.z);
    scene.add(fish);

    var f = new Fish(position, fish);

    fishList.push(f);
}

function UpdateFish() {
    for (var i = 0; i < fishList.length; i++) {
        fishList[i].Update();
    }
}