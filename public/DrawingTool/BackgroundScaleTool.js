"use strict";

function BackgroundScaleTool(drawingArea) {
    var that = this;
    var isDragging = false;
    var previousPoint = { x: 0, y: 0 };

    $('#drawing_area canvas.drawing').css('cursor', 'nesw-resize');

    function updateScale(x, y) {

        var previousPointDistance = Math.sqrt(Math.pow(previousPoint.x - drawingArea.currentPage.backgroundPosition.x, 2) + Math.pow(previousPoint.y - drawingArea.currentPage.backgroundPosition.y, 2));
        var currentPointDistance = Math.sqrt(Math.pow(x - drawingArea.currentPage.backgroundPosition.x, 2) + Math.pow(y - drawingArea.currentPage.backgroundPosition.y, 2));

        var distance = (currentPointDistance - previousPointDistance) * 0.01;

        drawingArea.currentPage.backgroundScale += distance;

        if (drawingArea.currentPage.backgroundScale < 0)
            drawingArea.currentPage.backgroundScale = 0;
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