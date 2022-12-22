/*
 * Name          : soldier3D.js
 * @author       : CLEMENT DUAN
 */
const CAR_LENGTH = 3;
const CAR_WIDTH = 1.5;
const CAR_HEIGHT = 1.2;

var RobotCar3D = (function(parameters, pScene, pCamera)
{
    parameters = parameters || {};
    var robot_type = (typeof parameters.robot_type === "undefined" ? "ackermann_car" : parameters.robot_type);

    // 模型是否加载完毕
    let loadCompleted = false;
    let robotcar_object = new THREE.Object3D();

    let car_body, car_head, wheel_f_L, wheel_f_R, wheel_b_L, wheel_b_R;

    if(robot_type == "ackermann_car") {
        const geometry = new THREE.BoxGeometry( CAR_LENGTH, CAR_WIDTH, CAR_HEIGHT );
        const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        car_body = new THREE.Mesh( geometry, material );
        car_body.position.z += CAR_HEIGHT;
        robotcar_object.add(car_body);

        const h_geometry = new THREE.ConeGeometry( CAR_WIDTH/2, CAR_LENGTH/3, 32 );
        const h_material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        car_head = new THREE.Mesh( h_geometry, h_material );
        car_head.position.x += CAR_LENGTH/2 + (CAR_LENGTH/3)/2;
        car_head.rotation.z -= Math.PI/2;
        car_head.position.z += CAR_HEIGHT;
        robotcar_object.add( car_head );

        const w_geometry = new THREE.CylinderGeometry( CAR_HEIGHT/2, CAR_HEIGHT/2, CAR_HEIGHT/4, 32 );
        const w_material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        wheel_f_L = new THREE.Mesh( w_geometry, w_material );
        wheel_f_L.position.x = (CAR_LENGTH/2) - (CAR_HEIGHT/2);
        wheel_f_L.position.y = (CAR_WIDTH/2) + (CAR_HEIGHT/4);
        wheel_f_L.position.z -= (CAR_HEIGHT/2);
        wheel_f_L.position.z += CAR_HEIGHT;
        robotcar_object.add( wheel_f_L );

        wheel_f_R = new THREE.Mesh( w_geometry, w_material );
        wheel_f_R.position.x = (CAR_LENGTH/2) - (CAR_HEIGHT/2);
        wheel_f_R.position.y -= (CAR_WIDTH/2) + (CAR_HEIGHT/4);
        wheel_f_R.position.z -= (CAR_HEIGHT/2);
        wheel_f_R.position.z += CAR_HEIGHT;
        robotcar_object.add( wheel_f_R );

        wheel_b_L = new THREE.Mesh( w_geometry, w_material );
        wheel_b_L.position.x -= (CAR_LENGTH/2) - (CAR_HEIGHT/2);
        wheel_b_L.position.y = (CAR_WIDTH/2) + (CAR_HEIGHT/4);
        wheel_b_L.position.z -= (CAR_HEIGHT/2);
        wheel_b_L.position.z += CAR_HEIGHT;
        robotcar_object.add( wheel_b_L );

        wheel_b_R = new THREE.Mesh( w_geometry, w_material );
        wheel_b_R.position.x -= (CAR_LENGTH/2) - (CAR_HEIGHT/2);
        wheel_b_R.position.y -= (CAR_WIDTH/2) + (CAR_HEIGHT/4);
        wheel_b_R.position.z -= (CAR_HEIGHT/2);
        wheel_b_R.position.z += CAR_HEIGHT;
        robotcar_object.add( wheel_b_R );

        robotcar_object.scale.x = 0.1;
        robotcar_object.scale.y = 0.1;
        robotcar_object.scale.z = 0.1;
    }
    pScene.add( robotcar_object );
    loadCompleted = true;

    function setSteeringAngle(angle) {
        wheel_f_L.rotation.z = angle;
        wheel_f_R.rotation.z = angle;
    }

    function setRotation(x, y, z) {
        robotcar_object.rotation.x = x
        robotcar_object.rotation.y = y
        robotcar_object.rotation.z = z
    }

    function setPos(x, y, z) {
		robotcar_object.position.set( x,  y, z);
    }

    function setVisible(isVisible) {
        robotcar_object.visible = isVisible;
    }

    /******************************************************
     * Public methods
     *****************************************************/
    return {
        // 需要外部访问的函数，定义在下方，相当于声明一下外部可调用
        setPos: setPos,
        setRotation: setRotation,
        setVisible: setVisible,
        setSteeringAngle: setSteeringAngle,

        // 外部需要访问的变量定义为函数，将变量引用到外部，才能够访问，并且外部可以直接修改变量的数值！
        robotcarObject: function (){return robotcar_object;},
        isLoadCompleted: function (){return loadCompleted;}
	};
});
