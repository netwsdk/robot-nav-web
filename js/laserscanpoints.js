/*
 * Name          : laserscanpoints.js
 * @author       : CLEMENT DUAN
 */
var LaserScanPoints = (function(options, pScene, pCamera)
{
    let max_pts = options.max_pts || 10000;
    let material = options.material || {size: 0.1, color: 0xff00ff};

    // 模型是否加载完毕
    let loadCompleted = false;
    let laser_frame_id = '';
    let laserscan_object = new THREE.Object3D();
    let geom = new THREE.BufferGeometry();

    let points_pos = [];
    for ( var i = 0; i < max_pts; i ++ ) {
        points_pos.push( 0, 0, 0 );
    }
    let points_positions = new THREE.Float32BufferAttribute( points_pos, 3 );
    points_positions.setUsage(THREE.DynamicDrawUsage);
    
    geom.setAttribute( 'position', points_positions );

    let points_object = new THREE.Points( geom, new THREE.PointsMaterial(material) );

    laserscan_object.add(points_object);
    laserscan_object.visible = false;

    pScene.add( laserscan_object );
    loadCompleted = true;

    function setVisible(isVisible) {
        laserscan_object.visible = isVisible;
    }

    function updatePoints(message) {
        var n = message.ranges.length;
        var j = 0;

        laser_frame_id = message.frame_id;

        // if there are too many points data, and CPU render very slow, we can think about use i+=5, to reduce the points number to 1/5
        for(var i=0;i<n;i++) {
            var range = message.ranges[i];
            if(range >= message.range_min && range <= message.range_max){
                var angle = message.angle_min + i * message.angle_increment;

                // range is the R of laser scan cycle.
                // angle is the target point to center of laser scan cycle, to the X axis direction.
                points_positions.array[j] = range * Math.cos(angle);
                points_positions.array[j+1] = range * Math.sin(angle);
                points_positions.array[j+2] = 0.0;
        
                // console.log("point[" + (j/3) + "]: x=" + points_positions.array[j] + " y=" + points_positions.array[j+1] + " z=" + points_positions.array[j+2]);
                j+=3;
            }
        }
        geom.setDrawRange(0,(j/3));
        points_positions.needsUpdate = true;
        points_positions.updateRange.count = (j/3) * points_positions.itemSize;
    }

    function updatePose(pos, rotation) {
        laserscan_object.position.set( pos.x, pos.y, pos.z );
        laserscan_object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        laserscan_object.updateMatrixWorld(true);
    }

    /******************************************************
     * Public methods
     *****************************************************/
    return {
        // 需要外部访问的函数，定义在下方，相当于声明一下外部可调用
        updatePoints: updatePoints,
        updatePose: updatePose,
        setVisible: setVisible,

        // 外部需要访问的变量定义为函数，将变量引用到外部，才能够访问，并且外部可以直接修改变量的数值！
        laserScanObject: function (){return laserscan_object;},
        isLoadCompleted: function (){return loadCompleted;},
        laserFrameId: function (){return laser_frame_id;}
	};
});
