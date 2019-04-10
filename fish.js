// Fish variables
var minBorderX = -160; // area where fish are allowed to spawn
var maxBorderX = 160;
var minBorderY = -160;
var maxBorderY = 160;

// list storing all individual fish
var fishList = [];

class Fish {
    constructor(position, scene) {
      this.position = position;
      this.acceleration = new THREE.Vector3(0, 0, 0);
      this.rotation = Math.random() * 2 * Math.PI;
      this.velocity = new THREE.Vector3(Math.cos(this.rotation), Math.sin(this.rotation), 0);

      // maximum velocity a fish can travel in any direction
      this.maxVelocity = .5;

      // radius of neighboring fish
      this.radius = 15;

      // create fish mesh and add the fish to the scene
      // TODO: replace with fish model
      var geometry = new THREE.BoxGeometry(1, .5, .5);
      var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.set(position.x, position.y, position.z);
      this.mesh.rotation.z = this.rotation;
      scene.add(this.mesh);
    }

    RotateToward(destination) {
        var direction = new THREE.Vector3(destination.x - this.position.x, destination.y - this.position.y, destination.z - this.position.z);
        direction.normalize();
        direction = new THREE.Vector3(direction.x * this.maxVelocity, direction.y * this.maxVelocity, direction.z * this.maxVelocity);

        var newDirection = new THREE.Vector3(direction.x - this.velocity.x, direction.y - this.velocity.y, direction.z - this.velocity.z);
        newDirection.clampScalar(-this.maxForce, this.maxForce);
        return newDirection;
    }

    Update() {
        var allFish = fishList;

        // calculate alignment, cohesion, and separation
        var alignment = this.CalculateAlignment(allFish);
        var cohesion = this.CalculateCohesion(allFish);
        var separation = this.CalculateSeparation(allFish);
        alignment.multiplyScalar(1.5);
        cohesion.multiplyScalar(1.0);
        separation.multiplyScalar(1.0);
        this.ApplyForce(alignment);
        this.ApplyForce(cohesion);
        this.ApplyForce(separation);

        // add acceleration to velocity and update position
        this.velocity.add(this.acceleration);
        this.velocity.normalize();
        this.velocity.multiplyScalar(this.maxVelocity);
        this.position = new THREE.Vector3(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.position.z);
        this.WrapAround();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // calculate direction and set rotation of mesh
        this.rotation = Math.atan2(this.velocity.y, this.velocity.x);
        this.mesh.rotation.z = this.rotation;

        this.acceleration = new THREE.Vector3(0, 0, 0);
    }

    ApplyForce(force) {
        this.acceleration = new THREE.Vector3(this.acceleration.x + force.x, this.acceleration.y + force.y, this.acceleration.z + force.z);
    }

    // Finds the average position of neighboring fish and calculates a new velocity for current fish based on their center of mass
    CalculateCohesion(fishList) {
        var fishCount = 0;
        var velocity = new THREE.Vector3(0, 0, 0);

        // add up the positions of all neighboring fish
        for (var i = 0; i < fishList.length; i++) {
            if (fishList[i] != this && this.position.distanceTo(fishList[i].position) <= this.radius) {
                velocity.x += fishList[i].position.x;
                velocity.y += fishList[i].position.y;
                fishCount++;
            }
        }

        // calculate average position
        if (fishCount > 0) {
            velocity.x = velocity.x / fishCount;
            velocity.y = velocity.y / fishCount;

            // find direction towards center of mass of neighboring fish
            velocity = new THREE.Vector3(velocity.x - this.position.x, velocity.y - this.position.y, velocity.z - this.position.z);
            velocity.normalize();
        }

        return velocity;
    }

    // Finds the average direction/velocity of neighboring fish and calculates a new velocity for current fish based on this direction
    CalculateAlignment(fishList) {
        var fishCount = 0; // number of other fish in radius; used to calculate average
        var velocity = new THREE.Vector3(0, 0, 0);

        // add up the velocities of all neighboring fish
        for (var i = 0; i < fishList.length; i++) {
            if (fishList[i] != this && this.position.distanceTo(fishList[i].position) <= this.radius) {
                velocity.x += fishList[i].velocity.x;
                velocity.y += fishList[i].velocity.y;
                fishCount++;
            }
        }

        // calculate average velocity
        if (fishCount > 0) {
            velocity.x = velocity.x / fishCount;
            velocity.y = velocity.y / fishCount;
            velocity.normalize();
        }

        return velocity;
    }

    // Finds a new velocity vector that steers current fish away from the average position of neighboring fish
    CalculateSeparation(fishList) {
        var fishCount = 0; // number of other fish in radius; used to calculate average
        var velocity = new THREE.Vector3(0, 0, 0);

        // add up the distances between this fish and all neighboring fish
        for (var i = 0; i < fishList.length; i++) {
            if (fishList[i] != this && (this.position.distanceTo(fishList[i].position) <= this.radius)) {
                velocity.x += this.position.x - fishList[i].position.x;
                velocity.y += this.position.y - fishList[i].position.y;
                fishCount++;
            }
        }

        if (fishCount > 0) {
            velocity.divideScalar(fishCount);
            velocity.normalize();
            velocity.multiplyScalar(this.maxVelocity);
            velocity.sub(this.velocity);
        }

        return velocity;
    }

    WrapAround() {
        if (this.position.x < minBorderX)
            this.position.x = maxBorderX - 1;

        if (this.position.x > maxBorderX)
            this.position.x = minBorderX + 1;

        if (this.position.y < minBorderY)
            this.position.y = maxBorderY - 1;

        if (this.position.y > maxBorderY)
            this.position.y = minBorderY + 1;
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

// create a new fish object and add it to the scene
function CreateFish(scene) {
    // randomize the spawn position of the fish
    var x = minBorderX + (Math.random() * (maxBorderX - minBorderX));
    var y = minBorderY + (Math.random() * (maxBorderY - minBorderY));
    var z = 10;
    var position = new THREE.Vector3(x, y, z);

    //var f = new Fish(position, fish);
    var f = new Fish(position, scene);

    fishList.push(f);
}

// update all fish contained in list of fish
function UpdateFish() {
    for (var i = 0; i < fishList.length; i++) {
        fishList[i].Update();
    }
}
