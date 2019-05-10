
var CannonJSPlugin = BABYLON.CannonJSPlugin;

CannonJSPlugin.prototype.setGravity = function (gravity) {
    this.world.gravity.copy(gravity);
};
CannonJSPlugin.prototype.setTimeStep = function (timeStep) {
    this._fixedTimeStep = timeStep;
};
CannonJSPlugin.prototype.executeStep = function (delta, impostors) {
    this.world.step(this._fixedTimeStep, this._useDeltaForWorldStep ? delta * 1000 : 0, 3);
};
CannonJSPlugin.prototype.generatePhysicsBody = function (impostor) {
    //parent-child relationship. Does this impostor has a parent impostor?
    if (impostor.parent) {
        if (impostor.physicsBody) {
            this.removePhysicsBody(impostor);
            //TODO is that needed?
            impostor.forceUpdate();
        }
        return;
    }
    //should a new body be created for this impostor?
    if (impostor.isBodyInitRequired()) {
        var shape = this._createShape(impostor);
        //unregister events, if body is being changed
        var oldBody = impostor.physicsBody;
        if (oldBody) {
            this.removePhysicsBody(impostor);
        }
        //create the body and material
        var material = this._addMaterial("mat-" + impostor.uniqueId, impostor.getParam("friction"), impostor.getParam("restitution"));
        var bodyCreationObject = {
            mass: impostor.getParam("mass"),
            material: material
        };
        // A simple extend, in case native options were used.
        var nativeOptions = impostor.getParam("nativeOptions");
        for (var key in nativeOptions) {
            if (nativeOptions.hasOwnProperty(key)) {
                bodyCreationObject[key] = nativeOptions[key];
            }
        }
        impostor.physicsBody = new CANNON.Body(bodyCreationObject);
        impostor.physicsBody.addEventListener("collide", impostor.onCollide);
        this.world.addEventListener("preStep", impostor.beforeStep);
        this.world.addEventListener("postStep", impostor.afterStep);
        impostor.physicsBody.addShape(shape);
        this.world.add(impostor.physicsBody);
        //try to keep the body moving in the right direction by taking old properties.
        //Should be tested!
        if (oldBody) {
            ['force', 'torque', 'velocity', 'angularVelocity'].forEach(function (param) {
                impostor.physicsBody[param].copy(oldBody[param]);
            });
        }
        this._processChildMeshes(impostor);
    }
    //now update the body's transformation
    this._updatePhysicsBodyTransformation(impostor);
};

/*
 CannonJSPlugin.prototype._createShape = function (impostor) {
 var object = impostor.object;
 var returnValue;
 var extendSize = impostor.getObjectExtendSize();
 switch (impostor.type) {
 case BABYLON.PhysicsImpostor.SphereImpostor:
 var radiusX = extendSize.x;
 var radiusY = extendSize.y;
 var radiusZ = extendSize.z;
 returnValue = new CANNON.Sphere(Math.max(this._checkWithEpsilon(radiusX), this._checkWithEpsilon(radiusY), this._checkWithEpsilon(radiusZ)) / 2);
 break;
 //TMP also for cylinder - TODO Cannon supports cylinder natively.
 case BABYLON.PhysicsImpostor.CylinderImpostor:
 returnValue = new CANNON.Cylinder(this._checkWithEpsilon(extendSize.x) / 2, this._checkWithEpsilon(extendSize.x) / 2, this._checkWithEpsilon(extendSize.y), 16);
 break;
 case BABYLON.PhysicsImpostor.BoxImpostor:
 var box = extendSize.scale(0.5);
 returnValue = new CANNON.Box(new CANNON.Vec3(this._checkWithEpsilon(box.x), this._checkWithEpsilon(box.y), this._checkWithEpsilon(box.z)));
 break;
 case BABYLON.PhysicsImpostor.PlaneImpostor:
 BABYLON.Tools.Warn("Attention, PlaneImposter might not behave as you expect. Consider using BoxImposter instead");
 returnValue = new CANNON.Plane();
 break;
 case BABYLON.PhysicsImpostor.MeshImpostor:
 var rawVerts = object.getVerticesData ? object.getVerticesData(BABYLON.VertexBuffer.PositionKind) : [];
 var rawFaces = object.getIndices ? object.getIndices() : [];
 BABYLON.Tools.Warn("MeshImpostor only collides against spheres.");
 returnValue = new CANNON.Trimesh(rawVerts, rawFaces);
 break;
 case BABYLON.PhysicsImpostor.HeightmapImpostor:
 returnValue = this._createHeightmap(object);
 break;
 case BABYLON.PhysicsImpostor.ParticleImpostor:
 returnValue = new CANNON.Particle();
 break;
 }
 return returnValue;
 };
 */

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.CannonJSPlugin());

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.5;

    var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 0.9, 700, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    var useBoxes = true;
    var b;
    var createShape = function () {
        if (useBoxes) {
            b = BABYLON.Mesh.CreateBox("s", 8, scene);
            b.physicsImpostor = new BABYLON.PhysicsImpostor(b, BABYLON.PhysicsImpostor.BoxImpostor, { mass: .1, friction: 0, restitution: 1.0 }, scene);
        }
        else {
            b = BABYLON.Mesh.CreateSphere("s", 8, 8, scene);
            b.physicsImpostor = new BABYLON.PhysicsImpostor(b, BABYLON.PhysicsImpostor.SphereImpostor, { mass: .1, friction: 0, restitution: 1.0 }, scene);
        }
        // console.log(b.physicsImpostor._physicsBody);
        b.position.x = Math.random()-.5 * 350;
        b.position.z = Math.random()-.5 * 350;
        b.position.y = 80;

    }

    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "https://upload.wikimedia.org/wikipedia/commons/5/57/Heightmap.png",
        500, 500, 50, 0, 40, scene, true, function () {
            var ground2 = ground.clone();
            ground2.material = new BABYLON.StandardMaterial("wire", scene);
            ground2.material.diffuseColor = BABYLON.Color3.Black();
            ground2.material.wireframe = true;


            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0, restitution: 0.1 }, scene);

            for (var ii = 0; ii < 20; ii++) {
                createShape();
            }

            ground.convertToFlatShadedMesh();

            scene.registerBeforeRender(function () {
                scene.meshes.forEach(function (m) {
                    if (m.name=="s" && m.position.y < -20) {

                        // m.physicsImpostor.setLinearVelocity(new CANNON.Vec3(0,0,0));
                        // m.physicsImpostor.setAngularVelocity(new CANNON.Vec3(0,0,0));

                        m.physicsImpostor._physicsBody.velocity = new CANNON.Vec3(0,0,0);
                        m.physicsImpostor._physicsBody.angularVelocity = new CANNON.Vec3(0,0,0);

                        m.position.y = 100;
                        m.position.x = (Math.random() * 150) * ((Math.random() < 0.5) ? -1 : 1);
                        m.position.z = (Math.random() * 150) * ((Math.random() < 0.5) ? -1 : 1);
                        // m.dispose();
                        // m.physicsImpostor.dispose();
                        // createShape();
                    }
                })
            });
        });
    return scene;
}