/**
 * @fileOverview
 * @author Jihoon Lee - jihoonlee.in@gmail.com
 * @author Russell Toris - rctoris@wpi.edu
 */

/**
 * A SceneNode can be used to keep track of a 3D object with respect to a ROS frame within a scene.
 *
 * @constructor
 * @param options - object with following keys:
 *
 *  * tfClient - a handle to the TF client
 *  * frameID - the frame ID this object belongs to
 *  * pose (optional) - the pose associated with this object
 *  * object - the THREE 3D object to be rendered
 */
SceneNode = function(options) {
  this.model_object = new THREE.Object3D();

  options = options || {};
  var that = this;
  this.tfClient = options.tfClient;
  this.frameID = options.frameID;
  var object = options.object;
  this.pose = options.pose || new ROSLIB.Pose();

  // Do not render this object until we receive a TF update
  this.model_object.visible = false; 

  // add the model to the model_object
  this.model_object.add(object);

  // set the inital pose
  this.updatePose(this.pose);

  // save the TF handler so we can remove it later
  this.tfUpdate = function(msg) {

    // apply the transform
    var tf = new ROSLIB.Transform(msg);
    var poseTransformed = new ROSLIB.Pose(that.pose);
    poseTransformed.applyTransform(tf);

    // update the world
    that.updatePose(poseTransformed);
    that.model_object.visible = true;
  };

  // listen for TF updates
  this.tfClient.subscribe(this.frameID, this.tfUpdate);
};

/**
 * Set the pose of the associated model.
 *
 * @param pose - the pose to update with
 */
SceneNode.prototype.updatePose = function(pose) {
  this.model_object.position.set( pose.position.x, pose.position.y, pose.position.z );
  this.model_object.quaternion.set(pose.orientation.x, pose.orientation.y,
      pose.orientation.z, pose.orientation.w);
  this.model_object.updateMatrixWorld(true);
};

SceneNode.prototype.unsubscribeTf = function() {
  this.tfClient.unsubscribe(this.frameID, this.tfUpdate);
};
