/*
 * Name          : worldmap.js
 * @author       : CLEMENT DUAN
 */
var WorldMap = (function(options, map_callback, pScene, pCamera)
{
    options = options || {};
    topicName = options.topic || '/map';
    compression = options.compression || 'cbor';
    color = options.color || {r:255,g:255,b:255,a:255};
    opacity = options.opacity || 1.0;

    let resMgr = new ResourceTracker();
    let track = resMgr.track.bind(resMgr);

    let mesh;
    let map_object = new THREE.Object3D();
    let map_received = false;
    let map_update_callback = map_callback;

    // 模型是否加载完毕
    let loadCompleted = false;
    let map_frame_id = '';

    // there is no init process, the 3d object created when get the path points from websocket
    map_object.visible = false;
    pScene.add(map_object);
    loadCompleted = true;

    function setVisible(isVisible) {
        map_object.visible = isVisible;
    }

    function updateMap(message) {
        if(map_received && message.update <= 0) {
            return;
        }

        // remove the old path line resource
        resMgr.dispose();

        // create the geometry
        map_frame_id = message.frame_id;

        var origin = message.origin_pose;
        var width = message.width;
        var height = message.height;
        var geom = track(new THREE.PlaneBufferGeometry(width, height));

        // create the color material
        var imageData = new Uint8Array(width * height * 4);
        var texture = track(new THREE.DataTexture(imageData, width, height, THREE.RGBAFormat));
        texture.flipY = true;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;

        var material = track(new THREE.MeshBasicMaterial({
            map : texture,
            transparent : opacity < 1.0,
            opacity : opacity
        }));
        material.side = THREE.DoubleSide;

        // create the mesh
        mesh = track(new THREE.Mesh(geom, material));
        // move the map so the corner is at X, Y and correct orientation (informations from message.info)

        mesh.quaternion.copy(new THREE.Quaternion(
            origin.orientation.x,
            origin.orientation.y,
            origin.orientation.z,
            origin.orientation.w
        ));
        mesh.position.x = (width * message.resolution) / 2 + origin.position.x;
        mesh.position.y = (height * message.resolution) / 2 + origin.position.y;
        mesh.position.z = origin.position.z;

        mesh.scale.x = message.resolution;
        mesh.scale.y = message.resolution;

        data = message.data;
        // update the texture (after the the super call and this are accessible)
        mesh.color = color;
        mesh.material = material;
        mesh.texture = texture;

        for ( var row = 0; row < height; row++) {
            for ( var col = 0; col < width; col++) {

                // determine the index into the map data
                var invRow = (height - row - 1);
                var mapI = col + (invRow * width);
                // determine the value
                var val = getValue(mapI, invRow, col, data);

                // determine the color
                var color = getColor(mapI, invRow, col, val);

                // determine the index into the image data array
                var i = (col + (row * width)) * 4;

                // copy the color
                imageData.set(color, i);
            }
        }

        texture.needsUpdate = true;

        map_object.add(mesh);
        map_object.visible = true;

        map_received = true;

        map_update_callback(mesh);
    }

    function getValue(index, row, col, data) {
        return data[index];
    }

    function getColor(index, row, col, value) {
        return [
          (value * color.r) / 255,
          (value * color.g) / 255,
          (value * color.b) / 255,
          255
        ];
    }

    function updatePose(pos, rotation) {
        map_object.position.set( pos.x, pos.y, pos.z );
        map_object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        map_object.updateMatrixWorld(true);
    }

    /******************************************************
     * Public methods
     *****************************************************/
    return {
        // 需要外部访问的函数，定义在下方，相当于声明一下外部可调用
        updateMap: updateMap,
        updatePose: updatePose,
        setVisible: setVisible,

        // 外部需要访问的变量定义为函数，将变量引用到外部，才能够访问，并且外部可以直接修改变量的数值！
        mapObject: function (){return map_object;},
        isLoadCompleted: function (){return loadCompleted;},
        mapFrameId: function (){return map_frame_id;}
	};
});
