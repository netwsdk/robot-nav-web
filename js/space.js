/*
 * Name          : space.js
 * @author       : CLEMENT DUAN
 */

let maxAniso = 1;
let shaderTiming = 0;
let rotateYAccumulate = 0;
var startTime = Date.now();

var SpaceBackGround = (function(pScene, backimageUrl)
{
    // These are used by solider 3D animitation
    let geometry, space_mesh, texture_loader, outside;
    let is_loadCompleted = false;
    let light = [];
    let light_cycle = [];
    let light_object = [];

    const resMgr = new ResourceTracker();
    const track = resMgr.track.bind(resMgr);

    const intensity = 0.1;
    const lightcolor = 0xffffff;

    // 环绕原点，创建很多个光源，以球形包围原点，这样任何角度都能光照到
    let li = 0;
    for(let i=0; i<8; i++) {
        light_object[i] = track(new THREE.Object3D());
        for(let j=0; j<8; j++) {
            light_cycle[li] = track(new THREE.Object3D());
            light[li] = track(new THREE.PointLight(lightcolor, intensity));
            light[li].position.set(0, 900, 0);
            light[li].castShadow = false;
            light_cycle[li].add(light[li]);
            light_cycle[li].rotation.z += j*(Math.PI/4);

            light_object[i].add(light_cycle[li]);
            li++;
        }
        light_object[i].rotation.y += i*(Math.PI/4);
        pScene.add(light_object[i]);
    }
    
    // 全景场景
    geometry = track(new THREE.SphereGeometry(1000, 60, 60));
    // 按z轴翻转
    geometry.scale(1, 1, -1);

    //异步加载高清纹理图
    texture_loader = track(new THREE.TextureLoader().load(backimageUrl, texture => {
        outside = track(new THREE.MeshBasicMaterial({ map: texture }));
        space_mesh = track(new THREE.Mesh(geometry, outside));
        space_mesh.receiveShadow = false;
        pScene.add(space_mesh);

        is_loadCompleted = true;
    }));

    function release() {
        resMgr.dispose();
    }

    /******************************************************
     * Public methods
     *****************************************************/
    return {
        // 需要外部访问的函数，定义在下方，相当于声明一下外部可调用
        release: release,
        
        // 外部需要访问的变量定义为函数，将变量引用到外部，才能够访问，并且外部可以直接修改变量的数值！
        // 注意这种变量要求必须是 class 类变量，普通数值变量，则必须定义2个函数：读取数值 和 写入数值！
        isLoadCompleted: function (){return is_loadCompleted;}
	};
});
