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

      // Create fish mesh out of many other meshes
      var mergedgeo = new THREE.Geometry();

      // Create the possibility of three different colors/scales of the fish
      var size;
      var material;
      var rand = Math.random()*3;
      if(rand < 1){
        size = .5;
        material = new THREE.MeshBasicMaterial( {color: 0xff0000});
      } else if(rand < 2){
        size = 2;
        material = new THREE.MeshBasicMaterial( {color: 0xfbff3f});
      } else {
        size = 1;
        material = new THREE.MeshBasicMaterial( {color: 0xff6c11});
      }

      // Fish body
      var bodygeo = new THREE.BoxGeometry(2, .5, .5);
      var body = new THREE.Mesh(bodygeo, material);
      body.updateMatrix();

      // Fish head
      var headgeo = new THREE.ConeGeometry(.3, .5);
      var head = new THREE.Mesh(headgeo, material);
      head.position.x = 1.2;
      head.rotation.z = -Math.PI/2;
      head.updateMatrix();

      // Fish Tail
      var tailgeo = new THREE.BoxGeometry(.4,.5,.1);
      var matrix = new THREE.Matrix4();
      matrix.set(1,  0,  0,  0,
                 2,  1,  0,  0,
                 0,  0,  1,  0,
                 0,  0,  0,  1, );
      tailgeo.applyMatrix(matrix);
      var tail = new THREE.Mesh(tailgeo, material);
      tail.position.x = -1.1;
      tail.position.z = .2;
      tail.rotation.x = Math.PI/2;
      tail.rotation.z = Math.PI/4;
      tail.updateMatrix();

      var tail2geo = new THREE.BoxGeometry(.4,.5,.1);
      tail2geo.applyMatrix(matrix);
      var tail2 = new THREE.Mesh(tail2geo, material);
      tail2.position.x = -1.1;
      tail2.position.z = -.2;
      tail2.rotation.x = Math.PI/2;
      tail2.rotation.z = Math.PI/4;
      tail2.rotation.y = Math.PI;
      tail2.updateMatrix();


      // Left fin
      var leftgeo = new THREE.BoxGeometry(1.2,.1,.4);
      var left = new THREE.Mesh(leftgeo, material);
      left.position.x = .3;
      left.position.y = .2;
      left.rotation.z = -Math.PI/4;
      left.updateMatrix();

      // Right fin
      var rightgeo = new THREE.BoxGeometry(1.2,.1,.4);
      var right = new THREE.Mesh(rightgeo, material);
      right.position.x = .3;
      right.position.y = -.2;
      right.rotation.z = Math.PI/4;
      right.updateMatrix();

      // Dorsal fin
      var dorsalgeo = new THREE.BoxGeometry(.9,.9,.1);
      var dorsal = new THREE.Mesh(dorsalgeo, material);
      dorsal.rotation.x = Math.PI/2;
      dorsal.rotation.z = Math.PI/4;
      dorsal.updateMatrix();

      // Merge 'em up
      mergedgeo.merge(body.geometry, body.matrix);
      mergedgeo.merge(head.geometry, head.matrix);
      mergedgeo.merge(tail.geometry, tail.matrix);
      mergedgeo.merge(tail2.geometry, tail2.matrix);
      mergedgeo.merge(left.geometry, left.matrix);
      mergedgeo.merge(right.geometry, right.matrix);
      mergedgeo.merge(dorsal.geometry, dorsal.matrix);

      // Scale properly
      mergedgeo.scale(size, size, size);


      this.mesh = new THREE.Mesh(mergedgeo, material);
      this.mesh.position.set(position.x, position.y, position.z);
      this.mesh.rotation.z = this.rotation;
      scene.add(this.mesh);
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
