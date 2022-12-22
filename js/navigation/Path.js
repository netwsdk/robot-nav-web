/**
 * @fileOverview
 * @author David V. Lu!! - davidvlu@gmail.com
 */

/**
 * A Path client that listens to a given topic and displays a line connecting the poses.
 *
 * @constructor
 * @param options - object with following keys:
 *
 *  * ros - the ROSLIB.Ros connection handle
 *  * topic - the marker topic to listen to
 *  * tfClient - the TF client handle to use
 *  * rootObject (optional) - the root object to add this marker to
 *  * color (optional) - color for line (default: 0xcc00ff)
 */
NavPath = function(options) {
  this.path_object = new THREE.Object3D();
  options = options || {};
  this.ros = options.ros;
  this.topicName = options.topic || '/path';
  this.tfClient = options.tfClient;
  this.color = options.color || 0xcc00ff;
  this.rootObject = options.rootObject || new THREE.Object3D();
  this.lineType = options.linetype || 'line';   // 'line' or 'arrow'

  this.sn = null;
  this.line = null;

  this.rosTopic = undefined;
  this.subscribe();

  this.resMgr = new ResourceTracker();
  this.track = this.resMgr.track.bind(this.resMgr);
};

NavPath.prototype.unsubscribe = function(){
  if(this.rosTopic){
    this.rosTopic.unsubscribe(this.processMessage);
  }
};

NavPath.prototype.subscribe = function(){
  this.unsubscribe();

  // subscribe to the topic
  this.rosTopic = new ROSLIB.Topic({
      ros : this.ros,
      name : this.topicName,
      queue_length : 1,
      messageType : 'nav_msgs/Path'
  });
  this.rosTopic.subscribe(this.processMessage.bind(this));
};

NavPath.prototype.processMessage = function(message){
  this.resMgr.dispose();

  if(this.sn!==null){
      this.sn.unsubscribeTf();
      this.rootObject.remove(this.sn);
  }

  if(this.lineType == 'arrow') {
    const hex = this.color;
    for(var i=0; i<message.poses.length-1;i++){
      var from = new THREE.Vector3( message.poses[i].pose.position.x, message.poses[i].pose.position.y, message.poses[i].pose.position.z );
      var to = new THREE.Vector3( message.poses[i+1].pose.position.x, message.poses[i+1].pose.position.y, message.poses[i+1].pose.position.z );
      var dir = new THREE.Vector3();
      const length = from.distanceTo( to ) * 0.8;
      dir.subVectors(to, from).normalize();
      const arrowHelper = this.track(new THREE.ArrowHelper( dir, from, length, hex, 0.8*length, 0.3 ));
      this.path_object.add(arrowHelper);
    }
  } else {
  /*
    const material = this.track(new THREE.LineBasicMaterial({
      color: this.color
    }));
  */
    const material = this.track(new THREE.LineDashedMaterial( {
      color: this.color,
      linewidth: 3,
      scale: 1,
      dashSize: 3,
      gapSize: 1,
    } ));

    const points = [];
    for(var i=0; i<message.poses.length;i++){
      var v3 = new THREE.Vector3( message.poses[i].pose.position.x, message.poses[i].pose.position.y,
                                  message.poses[i].pose.position.z);
      points.push( v3 );
    }

    const geometry = this.track(new THREE.BufferGeometry().setFromPoints( points ));
    const line = this.track(new THREE.Line( geometry, material ));
    line.computeLineDistances();
    this.path_object.add(line);
  }

  this.sn = new SceneNode({
      frameID : message.header.frame_id,
      tfClient : this.tfClient,
      object : this.path_object
  });

  this.rootObject.add(this.sn.model_object);
};
