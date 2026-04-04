"use strict";

function BackgroundMoveTool(drawingArea) {
    var that = this;
    var isDragging = false;
    var previousPoint = { x: 0, y: 0 };

    $('#drawing_area canvas.drawing').css('cursor', 'move');

    function updatePosition(x, y) {
        //drawingArea.currentPage.backgroundPosition.x += (x - previousPoint.x) / drawingArea.currentPage.backgroundScale;
        //drawingArea.currentPage.backgroundPosition.y += (y - previousPoint.y) / drawingArea.currentPage.backgroundScale;
        drawingArea.currentPage.backgroundPosition.x += (x - previousPoint.x);
        drawingArea.currentPage.backgroundPosition.y += (y - previousPoint.y);
    }

    this.handleMouseMove = function (x, y) {
        if (!drawingArea.currentPage.backgroundImage) {
            return;
        }

        if (isDragging) {
            updatePosition(x, y);
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
            updatePosition(x, y);
            drawingArea.currentPage.drawBackground();
            drawingArea.onPaint();
            previousPoint = { x: 0, y: 0 };
        }
    }

}