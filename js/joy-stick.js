/*
 * Name          : joy.js
 * @author       : Roberto D'Amico (Bobboteck)
 * Last modified : 09.06.2020
 * Revision      : 1.1.6
 *
 * Modification History:
 * Date         Version     Modified By     Description
 * 2021-12-21   2.0.0       Roberto D'Amico New version of the project that integrates the callback functions, while 
 *                                          maintaining compatibility with previous versions. Fixed Issue #27 too, 
 *                                          thanks to @artisticfox8 for the suggestion.
 * 2020-06-09   1.1.6       Roberto D'Amico Fixed Issue #10 and #11
 * 2020-04-20   1.1.5       Roberto D'Amico Correct: Two sticks in a row, thanks to @liamw9534 for the suggestion
 * 2020-04-03               Roberto D'Amico Correct: InternalRadius when change the size of canvas, thanks to 
 *                                          @vanslipon for the suggestion
 * 2020-01-07   1.1.4       Roberto D'Amico Close #6 by implementing a new parameter to set the functionality of 
 *                                          auto-return to 0 position
 * 2019-11-18   1.1.3       Roberto D'Amico Close #5 correct indication of East direction
 * 2019-11-12   1.1.2       Roberto D'Amico Removed Fix #4 incorrectly introduced and restored operation with touch 
 *                                          devices
 * 2019-11-12   1.1.1       Roberto D'Amico Fixed Issue #4 - Now JoyStick work in any position in the page, not only 
 *                                          at 0,0
 * 
 * The MIT License (MIT)
 *
 *  This file is part of the JoyStick Project (https://github.com/bobboteck/JoyStick).
 *	Copyright (c) 2015 Roberto D'Amico (Bobboteck).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @desc Principal object that draw a joystick, you only need to initialize the object and suggest the HTML container
 * @costructor
 * @param container {String} - HTML object that contains the Joystick
 * @param parameters (optional) - object with following keys:
 *  title {String} (optional) - The ID of canvas (Default value is 'joystick')
 *  width {Int} (optional) - The width of canvas, if not specified is setted at width of container object (Default value is the width of container object)
 *  height {Int} (optional) - The height of canvas, if not specified is setted at height of container object (Default value is the height of container object)
 *  internalFillColor {String} (optional) - Internal color of Stick (Default value is '#00AA00')
 *  internalLineWidth {Int} (optional) - Border width of Stick (Default value is 2)
 *  internalStrokeColor {String}(optional) - Border color of Stick (Default value is '#003300')
 *  externalLineWidth {Int} (optional) - External reference circonference width (Default value is 2)
 *  externalStrokeColor {String} (optional) - External reference circonference color (Default value is '#008000')
 *  autoReturnToCenter {Bool} (optional) - Sets the behavior of the stick, whether or not, it should return to zero position when released (Default value is True and return to zero)
 * @param callback {StickStatus} - 
 */
var JoyStick = (function(container, parameters, callback)
{
    let StickStatus =
        {
            xPosition: 0,
            yPosition: 0,
            x: 0,
            y: 0,
            cardinalDirection: "C",
            status: "UP"
        };

    parameters = parameters || {};
    var title = (typeof parameters.title === "undefined" ? "joystick" : parameters.title),
        width = (typeof parameters.width === "undefined" ? 0 : parameters.width),
        height = (typeof parameters.height === "undefined" ? 0 : parameters.height),
        mode = (typeof parameters.mode === "undefined" ? "stick" : parameters.mode),    // two kinds of button: "stick" or "button"(up/down button)
        internalFillColor = (typeof parameters.internalFillColor === "undefined" ? "#00AA00" : parameters.internalFillColor),
        internalLineWidth = (typeof parameters.internalLineWidth === "undefined" ? 2 : parameters.internalLineWidth),
        internalStrokeColor = (typeof parameters.internalStrokeColor === "undefined" ? "#003300" : parameters.internalStrokeColor),
        internalDownColor = (typeof parameters.internalDownColor === "undefined" ? "#003300" : parameters.internalDownColor),
        externalLineWidth = (typeof parameters.externalLineWidth === "undefined" ? 2 : parameters.externalLineWidth),
        externalStrokeColor = (typeof parameters.externalStrokeColor ===  "undefined" ? "#008000" : parameters.externalStrokeColor),
        autoReturnToCenter = (typeof parameters.autoReturnToCenter === "undefined" ? true : parameters.autoReturnToCenter);

    callback = callback || function(StickStatus) {};

    // Create Canvas element and add it in the Container object
    var objContainer = document.getElementById(container);
    
    // Fixing Unable to preventDefault inside passive event listener due to target being treated as passive in Chrome [Thanks to https://github.com/artisticfox8 for this suggestion]
    objContainer.style.touchAction = "none";

    var canvas = document.createElement("canvas");
    canvas.id = title;
    if(width === 0) { width = objContainer.clientWidth; }
    if(height === 0) { height = objContainer.clientHeight; }
    canvas.width = width;
    canvas.height = height;
    objContainer.appendChild(canvas);
    var context=canvas.getContext("2d");

    var touchID = -1;
    var pressed = 0; // Bool - 1=Yes - 0=No
    var circumference = 2 * Math.PI;

    var internalRadius, maxMoveStick, externalRadius, centerX, centerY, 
    directionHorizontalLimitPos, directionHorizontalLimitNeg, directionVerticalLimitPos, directionVerticalLimitNeg;

    if(mode === "stick")
    {
        internalRadius = canvas.width/8;
        maxMoveStick = 40;
        externalRadius = 70;

        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        directionHorizontalLimitPos = canvas.width / 10;
        directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
        directionVerticalLimitPos = canvas.height / 10;
        directionVerticalLimitNeg = directionVerticalLimitPos * -1;
    }
    else 
    {
        internalRadius = (canvas.width/2)-5;
        //  maxMoveStick含义：以 canvas 左上角为(0,0)原点，按钮圆形的中心点最大偏移时，X 和 Y 能够偏移的数值
        // 由于 mode = "button"，所以这个数值要很靠近canvas的中心点，差距在 5/2 范围以内
        maxMoveStick = internalRadius+3;    // 必须比 externalRadius 要小
        externalRadius = internalRadius + 5;

        centerX = canvas.width / 2;
        centerY = canvas.height / 2;

        // all the belows are not used when mode is "button" in fact
        directionHorizontalLimitPos = canvas.width / 10;
        directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
        directionVerticalLimitPos = canvas.height / 10;
        directionVerticalLimitNeg = directionVerticalLimitPos * -1;
    }
    
    // Used to save current position of stick
    var movedX=centerX;
    var movedY=centerY;

    // Check if the device support the touch or not
    if("ontouchstart" in document.documentElement)
    {
        canvas.addEventListener("touchstart", onTouchStart, false);
        canvas.addEventListener("touchmove", onTouchMove, false);
        canvas.addEventListener("touchend", onTouchEnd, false);
    }
    else
    {
        canvas.addEventListener("mousedown", onMouseDown, false);
        canvas.addEventListener("mousemove", onMouseMove, false);
        canvas.addEventListener("mouseup", onMouseUp, false);
    }
    // Draw the object
    drawExternal();
    drawInternal();

    /******************************************************
     * Private methods
     *****************************************************/

    /**
     * @desc Draw the external circle used as reference position
     */
    function drawExternal()
    {
        context.beginPath();
        context.arc(centerX, centerY, externalRadius, 0, circumference, false);
        context.lineWidth = externalLineWidth;
        context.strokeStyle = externalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Draw the internal stick in the current position the user have moved it
     */
    function drawInternal()
    {
        context.beginPath();

        if(movedX<internalRadius) { movedX=internalRadius; }
        if((movedX+internalRadius) > canvas.width) { movedX = canvas.width-(internalRadius); }
        if(movedY<internalRadius) { movedY=internalRadius; }
        if((movedY+internalRadius) > canvas.height) { movedY = canvas.height-(internalRadius); }

        context.arc(movedX, movedY, internalRadius, 0, circumference, false);
        // create radial gradient
        var grd = context.createRadialGradient(centerX, centerY, 5, centerX, centerY, 200);
        // Light color
        // when button is in touchdown status, we use internalDownColor.
        if(pressed === 1)
        {
            grd.addColorStop(0, internalDownColor);
        }
        else 
        {
            grd.addColorStop(0, internalFillColor);
        }
        
        // Dark color
        grd.addColorStop(1, internalStrokeColor);
        context.fillStyle = grd;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Events for manage touch
     */
    function onTouchStart(event) 
    {
        event.preventDefault();	//阻止默认行为（滚动条滚动）

        const touches = event.changedTouches;
        for (let i = 0; i < touches.length; i++) 
        {
            if(touches[i].target === canvas) 
            {
                pressed = 1;
                touchID = touches[i].identifier;

                // Delete canvas
                context.clearRect(0, 0, canvas.width, canvas.height);
                // Redraw object
                drawExternal();
                drawInternal();

                // Set attribute of callback
                StickStatus.xPosition = movedX;
                StickStatus.yPosition = movedY;
                StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
                StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
                StickStatus.cardinalDirection = getCardinalDirection();
                StickStatus.status = "DOWN";
                callback(StickStatus);
            }
        }
    }

    function onTouchMove(event)
    {
        event.preventDefault();	//阻止默认行为（滚动条滚动）
        
        const touches = event.changedTouches;
        for (let i = 0; i < touches.length; i++) 
        {
            if(touches[i].identifier === touchID && pressed === 1) 
            {
                movedX = event.targetTouches[0].pageX;
                movedY = event.targetTouches[0].pageY;

                // Manage offset : 把 movedX 和 movedY 转换成 canvas 以左上角为(0,0)原点的坐标
                if(canvas.offsetParent.tagName.toUpperCase() === "BODY")
                {
                    movedX -= canvas.offsetLeft;
                    movedY -= canvas.offsetTop;
                }
                else
                {
                    movedX -= canvas.offsetParent.offsetLeft;
                    movedY -= canvas.offsetParent.offsetTop;
                }
                // Delete canvas
                context.clearRect(0, 0, canvas.width, canvas.height);
                // Redraw object
                drawExternal();
                drawInternal();

                // Set attribute of callback
                StickStatus.xPosition = movedX;
                StickStatus.yPosition = movedY;
                StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
                StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
                StickStatus.cardinalDirection = getCardinalDirection();
                StickStatus.status = "MOVE";
                callback(StickStatus);
            }
        }
    } 

    function onTouchEnd(event) 
    {
        event.preventDefault();	//阻止默认行为（滚动条滚动）

        const touches = event.changedTouches;
        for (let i = 0; i < touches.length; i++) 
        {
            if(touches[i].identifier === touchID && pressed === 1) 
            {
                pressed = 0;
                touchID = -1;

                // If required reset position store variable
                if(autoReturnToCenter)
                {
                    movedX = centerX;
                    movedY = centerY;
                }
                // Delete canvas
                context.clearRect(0, 0, canvas.width, canvas.height);
                // Redraw object
                drawExternal();
                drawInternal();

                // Set attribute of callback
                // 以canvas左上角为原点，圆形按钮当前中心的坐标
                StickStatus.xPosition = movedX;
                StickStatus.yPosition = movedY;

                // 以canvas的中心为原点，圆形按钮当前中心点偏移的 百分比，偏移数值范围： -100 ~ 100
                StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
                StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();

                StickStatus.cardinalDirection = getCardinalDirection();
                StickStatus.status = "UP";
                callback(StickStatus);
            }
        }
    }

    /**
     * @desc Events for manage mouse
     */
    function onMouseDown(event) 
    {
        event.preventDefault();	//阻止默认行为（滚动条滚动）

        pressed = 1;
    }

    /* To simplify this code there was a new experimental feature here: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX , but it present only in Mouse case not metod presents in Touch case :-( */
    function onMouseMove(event) 
    {
        event.preventDefault();	//阻止默认行为（滚动条滚动）

        if(pressed === 1)
        {
            movedX = event.pageX;
            movedY = event.pageY;
            // Manage offset
            if(canvas.offsetParent.tagName.toUpperCase() === "BODY")
            {
                movedX -= canvas.offsetLeft;
                movedY -= canvas.offsetTop;
            }
            else
            {
                movedX -= canvas.offsetParent.offsetLeft;
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();

            // Set attribute of callback
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
            StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
            StickStatus.cardinalDirection = getCardinalDirection();
            callback(StickStatus);
        }
    }

    function onMouseUp(event) 
    {
        event.preventDefault();	//阻止默认行为（滚动条滚动）
        
        pressed = 0;
        // If required reset position store variable
        if(autoReturnToCenter)
        {
            movedX = centerX;
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();

        // Set attribute of callback
        StickStatus.xPosition = movedX;
        StickStatus.yPosition = movedY;
        StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
        StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
        StickStatus.cardinalDirection = getCardinalDirection();
        callback(StickStatus);
    }

    function getCardinalDirection()
    {
        let result = "";
        let orizontal = movedX - centerX;
        let vertical = movedY - centerY;
        
        if(vertical >= directionVerticalLimitNeg && vertical <= directionVerticalLimitPos)
        {
            result = "C";
        }
        if(vertical < directionVerticalLimitNeg)
        {
            result = "N";
        }
        if(vertical > directionVerticalLimitPos)
        {
            result = "S";
        }
        
        if(orizontal < directionHorizontalLimitNeg)
        {
            if(result === "C")
            { 
                result = "W";
            }
            else
            {
                result += "W";
            }
        }
        if(orizontal > directionHorizontalLimitPos)
        {
            if(result === "C")
            { 
                result = "E";
            }
            else
            {
                result += "E";
            }
        }
        
        return result;
    }

    /******************************************************
     * Public methods
     *****************************************************/

    /**
     * @desc The width of canvas
     * @return Number of pixel width 
     */
    this.GetWidth = function () 
    {
        return canvas.width;
    };

    /**
     * @desc The height of canvas
     * @return Number of pixel height
     */
    this.GetHeight = function () 
    {
        return canvas.height;
    };

    /**
     * @desc The X position of the cursor relative to the canvas that contains it and to its dimensions
     * @return Number that indicate relative position
     */
    this.GetPosX = function ()
    {
        return movedX;
    };

    /**
     * @desc The Y position of the cursor relative to the canvas that contains it and to its dimensions
     * @return Number that indicate relative position
     */
    this.GetPosY = function ()
    {
        return movedY;
    };

    /**
     * @desc Normalizzed value of X move of stick
     * @return Integer from -100 to +100
     */
    this.GetX = function ()
    {
        return (100*((movedX - centerX)/maxMoveStick)).toFixed();
    };

    /**
     * @desc Normalizzed value of Y move of stick
     * @return Integer from -100 to +100
     */
    this.GetY = function ()
    {
        return ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
    };

    /**
     * @desc Get the direction of the cursor as a string that indicates the cardinal points where this is oriented
     * @return String of cardinal point N, NE, E, SE, S, SW, W, NW and C when it is placed in the center
     */
    this.GetDir = function()
    {
        return getCardinalDirection();
    };

    // set the color of button
    this.setColor = function(fillColor, strokeColor, downColor)
    {
        internalFillColor = fillColor;
        internalStrokeColor = strokeColor;
        internalDownColor = downColor;

        drawInternal();
    };
});
