// Fish variables
var minBorderX = -20; // area where fish are allowed to spawn
var maxBorderX = 20;
var minBorderY = -20;
var maxBorderY = 20;

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
        var direction = new THREE.Vector3(Math.cos(this.rotation), Math.sin(this.rotation), 0);
        direction.normalize();

        // calculate alignment, cohesion, and separation
        var alignment = this.CalculateAlignment(allFish);
        var cohesion = this.CalculateCohesion(allFish);
        var separation = this.CalculateSeparation(allFish);
        this.ApplyForce(alignment);
        this.ApplyForce(cohesion);
        this.ApplyForce(separation);

        if (this == allFish[0])
            console.log(this.acceleration);

        //this.velocity = new THREE.Vector3(Math.cos(this.rotation) + alignment.x + cohesion.x + separation.x, Math.sin(this.rotation) + alignment.y + separation.y + cohesion.y, 0).normalize();
        //this.velocity = new THREE.Vector3(Math.cos(this.rotation) + this.acceleration.x, Math.sin(this.rotation) + this.acceleration.y, 0);
        //this.velocity = new THREE.Vector3(this.Clamp(this.velocity.x + this.acceleration.x, -this.maxVelocity, this.maxVelocity), 
        //                                  this.Clamp(this.velocity.y + this.acceleration.y, -this.maxVelocity, this.maxVelocity), 
        //                                  0);
        //this.velocity = new THREE.Vector3(Math.cos(this.rotation), Math.sin(this.rotation));
        this.velocity.add(this.acceleration);
        this.velocity.clampScalar(-this.maxVelocity, this.maxVelocity);
        this.position = new THREE.Vector3(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.position.z);
        this.WrapAround();
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        this.acceleration = new THREE.Vector3(0, 0, 0);
    }

    ApplyForce(force) {
        this.acceleration = new THREE.Vector3(this.acceleration.x + force.x, this.acceleration.y + force.y, this.acceleration.z + force.z);
    }

    // Finds the average position of neighboring fish and calculates a new velocity for current fish based on their center of mass
    CalculateCohesion(fishList) {
        var radius = 1;
        var fishCount = 0;
        var velocity = new THREE.Vector3(0, 0, 0);

        // add up the positions of all neighboring fish
        for (var i = 0; i < fishList.length; i++) {
            if (fishList[i] != this && this.position.distanceTo(fishList[i].position) <= radius) {
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
        var radius = 1; // will search for all other fish in this radius
        var fishCount = 0; // number of other fish in radius; used to calculate average
        var velocity = new THREE.Vector3(0, 0, 0);

        // add up the velocities of all neighboring fish
        for (var i = 0; i < fishList.length; i++) {
            if (fishList[i] != this && this.position.distanceTo(fishList[i].position) <= radius) {
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
        var radius = 1; // will search for all other fish in this radius
        var fishCount = 0; // number of other fish in radius; used to calculate average
        var velocity = new THREE.Vector3(0, 0, 0);

        // add up the distances between this fish and all neighboring fish
        for (var i = 0; i < fishList.length; i++) {
            if (fishList[i] != this && this.position.distanceTo(fishList[i].position) <= radius) {
                velocity.x += this.position.x - fishList[i].position.x;
                velocity.y += this.position.y - fishList[i].position.y;
                fishCount++;
            }
        }

        // calculate average distance and negate final vector so this fish will steer away from neighbors
        if (fishCount > 0) {
            velocity.x = -1 * (velocity.x / fishCount);
            velocity.y = -1 * (velocity.y / fishCount);
            velocity.normalize();
        }

        return velocity;
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