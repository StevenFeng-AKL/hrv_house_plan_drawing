function HeatpumpTool(drawingArea, index, modelNumber, indoor, ducted) {
    var that = this;
    var isDrawing = false;
    var startPoint = { x: 0, y: 0 };
    var rotation = 0;
    var width = 60;
    var height = 30;
    var icon = new Image();

    if (indoor) {
        if (ducted) {
            icon.src = "Images/icon_heatpump_indoor_ducted.png" + "?v=" + new Date().getTime();
        }
        else {
            icon.src = "Images/icon_heatpump_indoor.png" + "?v=" + new Date().getTime();
        }
    }
    else {
        icon.src = "Images/icon_heatpump_outdoor.png" + "?v=" + new Date().getTime();
    }

    var toolCanvas = document.createElement('canvas');
    var toolCtx = toolCanvas.getContext('2d');
    toolCanvas.width = drawingArea.canvas.width;
    toolCanvas.height = drawingArea.canvas.height;
    toolCtx.lineWidth = 2;
    toolCtx.lineJoin = 'round';
    toolCtx.lineCap = 'butt';

    var eraseCanvas = document.createElement('canvas');
    var eraseCtx = eraseCanvas.getContext('2d');
    eraseCanvas.width = drawingArea.canvas.width;
    eraseCanvas.height = drawingArea.canvas.height;
    eraseCtx.lineWidth = 15;
    eraseCtx.lineJoin = 'round';
    eraseCtx.lineCap = 'butt';

    this.handleMouseMove = function (x, y) {
        startPoint.x = x;
        startPoint.y = y;
        toolPaint();
        drawingArea.onPaint();
    }

    this.onPaint = function (context) {
        
        context.save();
        context.globalCompositeOperation = "destination-out";
        context.drawImage(eraseCanvas, 0, 0);
        context.restore();

        context.drawImage(toolCanvas, 0, 0);
    }

    this.rotate = function (angle) {
        rotation += angle;
        rotation = rotation % 360;

        if (rotation < 0)
            rotation = 360 + rotation;

        toolPaint();
        drawingArea.onPaint();
    }

    function toolPaint() {

        if (!icon.complete)
            return;

        toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);

        toolCtx.save();
        
        toolCtx.translate(startPoint.x, startPoint.y);
        toolCtx.rotate(degreesToRadians(rotation));

        toolCtx.drawImage(icon, -(icon.width / 2), -icon.height);

        toolCtx.fillStyle = "#ff0000";

        var textHeight = 12;
        toolCtx.font = textHeight + "px Arial";
        var textWidth = toolCtx.measureText(modelNumber).width;

        if (indoor) {

            if (rotation == 180) {
                toolCtx.translate(0, 5 + (textHeight / 2));
                toolCtx.rotate(degreesToRadians(180));
                toolCtx.translate(0, -(5 + (textHeight / 2)));
            }
            toolCtx.fillText(modelNumber, -textWidth / 2, 5 + textHeight);
        }
        else {
            if (rotation == 180) {
                toolCtx.translate(0, -icon.height - 5 - textHeight / 2);
                toolCtx.rotate(degreesToRadians(180));
                toolCtx.translate(0, icon.height + 5 + textHeight / 2);
            }
            toolCtx.fillText(modelNumber, -textWidth / 2, -icon.height - 5);
        }

        toolCtx.restore();

        eraseCtx.clearRect(0, 0, eraseCanvas.width, eraseCanvas.height);

        /*
        eraseCtx.save();

        eraseCtx.translate(startPoint.x, startPoint.y);
        eraseCtx.rotate(degreesToRadians(rotation));

        eraseCtx.beginPath();
        eraseCtx.rect(-(icon.width / 2), -icon.height, icon.width, icon.height);
        eraseCtx.fill();
        
        eraseCtx.restore();
        */

    }

    this.mouseDown = function (x, y) {
        isDrawing = true;
        startPoint.x = x;
        startPoint.y = y;
        toolPaint();
        drawingArea.onPaint();
    }

    this.mouseUp = function (x, y) {
        if (isDrawing) {
            isDrawing = false;
            startPoint.x = x;
            startPoint.y = y;
            toolPaint();
            drawingArea.eraseFromCanvas(eraseCanvas);
            drawingArea.drawToCanvas(toolCanvas);
            toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
            eraseCtx.clearRect(0, 0, eraseCanvas.width, eraseCanvas.height);
            drawingArea.onPaint();
            drawingArea.heatpumpPlaced(index);
        }
    }

}
