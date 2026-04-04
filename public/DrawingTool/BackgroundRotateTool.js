"use strict";

function BackgroundRotateTool(drawingArea) {
    var that = this;
    var isDragging = false;
    var previousPoint = { x: 0, y: 0 };

    $('#drawing_area canvas.drawing').css('cursor', 'nesw-resize');

    function updateScale(x, y) {

        var previousPointRotation = getDirectionToPoint(previousPoint.x, previousPoint.y, drawingArea.currentPage.backgroundPosition.x, drawingArea.currentPage.backgroundPosition.y);
        var currentPointRotation = getDirectionToPoint(x, y, drawingArea.currentPage.backgroundPosition.x, drawingArea.currentPage.backgroundPosition.y);

        var rotation = (currentPointRotation - previousPointRotation);

        drawingArea.currentPage.backgroundRotation += radiansToDegrees(rotation);

        drawingArea.currentPage.backgroundRotation = drawingArea.currentPage.backgroundRotation % 360;
    }

    this.handleMouseMove = function (x, y) {
        if (!drawingArea.currentPage.backgroundImage) {
            return;
        }

        if (isDragging) {
            updateScale(x, y);
            drawingArea.currentPage.drawBackground();
            drawingArea.onPaint();
            previousPoint.x = x;
            previousPoint.y = y;
        }
    }

    this.mouseDown = function (x, y) {
        if (!drawingArea.currentPage.backgroundImage) {
            return;
        }

        if (!isDragging) {
            isDragging = true;
            previousPoint.x = x;
            previousPoint.y = y;
            drawingArea.currentPage.drawBackground();
            drawingArea.onPaint();
        }
    }

    
    this.mouseUp = function (x, y) {
        if (!drawingArea.currentPage.backgroundImage) {
            return;
        }

        if (isDragging) {
            isDragging = false;
            updateScale(x, y);
            drawingArea.currentPage.drawBackground();
            drawingArea.onPaint();
            previousPoint = { x: 0, y: 0 };
        }
    }

}