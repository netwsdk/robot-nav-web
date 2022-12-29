/*
 * Name          : navpath.js
 * @author       : CLEMENT DUAN
 */
var NavPathLine = (function(options, pScene, pCamera)
{
    options = options || {};
    let topicName = options.topic || '/path';
    let color = options.color || 0xcc00ff;
    let lineType = options.linetype || 'line';   // 'line' or 'arrow'

    let resMgr = new ResourceTracker();
    let track = resMgr.track.bind(resMgr);

    let path_object = new THREE.Object3D();

    // 模型是否加载完毕
    let loadCompleted = false;
    let path_frame_id = '';

    // there is no init process, the 3d object created when get the path points from websocket
    path_object.visible = false;
    pScene.add(path_object);
    loadCompleted = true;

    function setVisible(isVisible) {
        path_object.visible = isVisible;
    }

    function updatePath(message) {
        // remove the old path line resource
        resMgr.dispose();
        
        path_frame_id = message.frame_id;
        
        if(lineType == 'arrow') {
            const hex = color;
            for(var i=0; i<message.poses.length-1;i++){
                var from = new THREE.Vector3( message.poses[i].position.x, message.poses[i].position.y, message.poses[i].position.z );
                var to = new THREE.Vector3( message.poses[i+1].position.x, message.poses[i+1].position.y, message.poses[i+1].position.z );
                var dir = new THREE.Vector3();
                const length = from.distanceTo( to ) * 0.8;
                dir.subVectors(to, from).normalize();
                const arrowHelper = track(new THREE.ArrowHelper( dir, from, length, hex, 0.8*length, 0.3 ));
                path_object.add(arrowHelper);
            }
        } else {
        /*
            const material = track(new THREE.LineBasicMaterial({
            color: color
            }));
        */
            const material = track(new THREE.LineDashedMaterial( {
                color: color,
                linewidth: 3,
                scale: 1,
                dashSize: 3,
                gapSize: 1,
            } ));
        
            const points = [];
            for(var i=0; i<message.poses.length;i++){
                var v3 = new THREE.Vector3( message.poses[i].position.x, message.poses[i].position.y,
                                            message.poses[i].position.z);
                points.push( v3 );
            }
        
            const geometry = track(new THREE.BufferGeometry().setFromPoints( points ));
            const line = track(new THREE.Line( geometry, material ));
            line.computeLineDistances();
            path_object.add(line);
        }
    }

    function updatePose(pos, rotation) {
        path_object.position.set( pos.x, pos.y, pos.z );
        path_object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        path_object.updateMatrixWorld(true);
    }

    /******************************************************
     * Public methods
     *****************************************************/
    return {
        // 需要外部访问的函数，定义在下方，相当于声明一下外部可调用
        updatePath: updatePath,
        updatePose: updatePose,
        setVisible: setVisible,

        // 外部需要访问的变量定义为函数，将变量引用到外部，才能够访问，并且外部可以直接修改变量的数值！
        pathObject: function (){return path_object;},
        isLoadCompleted: function (){return loadCompleted;},
        pathFrameId: function (){return path_frame_id;}
	};
});
