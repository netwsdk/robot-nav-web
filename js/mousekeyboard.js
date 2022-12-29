var mouseX = 0, mouseY = 0, pmouseX = 0, pmouseY = 0;
var pressX = 0, pressY = 0;

var TOUCHMODES = {
	NONE: 0,
	SINGLE: 1,
	DOUBLE: 2,
};
var touchMode = TOUCHMODES.NONE;

function nullTouchEvent(from_x, from_y, to_x, to_y) {
}
var touchMoveCallbackFunc = nullTouchEvent;
var touchEndCallbackFunc = nullTouchEvent;

function determineTouchMode( event ){
	const touches = event.changedTouches;
	if( touches.length <=0 || touches.length >2 ){
		touchMode = TOUCHMODES.NONE;
		return;
	}

	if( touches.length === 1 ){
		touchMode = TOUCHMODES.SINGLE;
		return;
	}

	if( touches.length === 2 ){
		touchMode = TOUCHMODES.DOUBLE;
		return;
	}
}

function equalizeTouchTracking( event ){
	const touches = event.changedTouches;
	if (touches.length < 1 )
		return;

	var touch = touches[0];
	pmouseX = mouseX = touch.pageX;
	pmouseY = mouseY = touch.pageY;
}

function touchStart( event ){
	const touches = event.changedTouches;
	if (touches.length < 1 )
		return;

	determineTouchMode( event );
	equalizeTouchTracking( event );
	event.preventDefault();

	pressX = mouseX;
	pressY = mouseY;
}

function touchEnd( event ){
	determineTouchMode( event );
	equalizeTouchTracking( event );
	// event.preventDefault();

	if ( touchMode === TOUCHMODES.SINGLE ) {
		touchEndCallbackFunc(pressX, pressY, mouseX, mouseY);
	}
}

function touchMove( event ){
	determineTouchMode( event );

	// only process: single touch, used to select object3D in scene
	if ( touchMode === TOUCHMODES.SINGLE ) {
		pmouseX = mouseX;
		pmouseY = mouseY;

		var touch = event.touches[0];

		mouseX = touch.pageX;
		mouseY = touch.pageY;

		touchMoveCallbackFunc(pressX, pressY, mouseX, mouseY);
	}
}
