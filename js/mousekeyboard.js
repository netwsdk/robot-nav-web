var mouseX = 0, mouseY = 0, pmouseX = 0, pmouseY = 0;
var pressX = 0, pressY = 0;

var TOUCHMODES = {
	NONE: 0,
	SINGLE: 1,
	DOUBLE: 2,
};
var touchMode = TOUCHMODES.NONE;

function nullCloseProcess() {
	console.log("Please replace nullCloseProcess if your scene need some close process!");
}

var closeCallbackFunc = nullCloseProcess;
// default function for close button at the top-right corner.
$('.close').click(function(){
	closeCallbackFunc();
});

// NullTouchProcess is used in some scene_xxxx module, used to process some button's touch and click
function NullTouchProcess(event)
{
	if (event.preventDefault)
		event.preventDefault();	//阻止默认行为（滚动条滚动）
}

function nullClickEvent(x, y) {
	console.log('detect a click, but there is no callback function setting!');
}
var clickCallbackFunc = nullClickEvent;

function nullXscrollEvent(start_x, cur_x) {
}
var XscrollCallbackFunc = nullXscrollEvent;

function nullXscrollEndEvent(x, y) {
}
var XscrollEndCallbackFunc = nullXscrollEndEvent;

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
		if( Math.abs(pressX - mouseX) > 3 || Math.abs(pressY - mouseY) > 3 ) {
			XscrollEndCallbackFunc(mouseX, mouseY);
			return;
		}
	
		clickCallbackFunc(pressX, pressY);
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

		XscrollCallbackFunc(pressX, mouseX);
	}
}
