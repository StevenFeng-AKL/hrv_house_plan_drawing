function ArrowTool(drawingArea) {
    var that = this;
    var isDrawing = false;
    var startPoint = { x: 0, y: 0 };
    var endPoint = { x: 0, y: 0 };
    var colour = "#000000";

    var toolCanvas = document.createElement('canvas');
    var toolCtx = toolCanvas.getContext('2d');
    toolCanvas.width = drawingArea.canvas.width;
    toolCanvas.height = drawingArea.canvas.height;
    toolCtx.lineWidth = 2;
    toolCtx.lineJoin = 'round';
    toolCtx.lineCap = 'round';

    this.setColour = function (newColour) {
        colour = newColour;
        toolCtx.strokeStyle = colour;
        this.previewPaint();
    }

    this.handleMouseMove = function (x, y) {
        if (isDrawing) {
            endPoint.x = x;
            endPoint.y = y;
            toolPaint();
            drawingArea.onPaint();
        }
    }

    this.onPaint = function (context) {
        context.drawImage(toolCanvas, 0, 0);
    }

    function toolPaint() {

        var canvas = toolCanvas;
        var context = toolCtx;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();

        var angle = getDirectionToPoint(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

        context.translate(startPoint.x, startPoint.y);
        context.rotate(angle);
       
        var length = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(length - 10, 0);
        context.stroke();

        context.beginPath();
        context.moveTo(length, 0);
        context.lineTo(length - 10, -5);
        context.lineTo(length - 10, 5);
        context.closePath();
        context.fill();

        context.restore();
    }

    this.previewPaint = function() {
        var canvas = drawingArea.previewCanvas;
        var ctx = drawingArea.previewCtx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = toolCtx.lineWidth;
        ctx.lineJoin = toolCtx.lineJoin;
        ctx.lineCap = toolCtx.lineCap;
        ctx.strokeStyle = toolCtx.strokeStyle;
        ctx.fillStyle = toolCtx.fillStyle;

        var start = { x: canvas.width * 0.1, y: canvas.height / 2 };
        var end = { x: canvas.width * 0.9, y: canvas.height / 2 };
        var angle = getDirectionToPoint(start.x, start.y, end.x, end.y);

        ctx.save();
        ctx.translate(start.x, start.y);
        ctx.rotate(angle);

        var length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(length - 10, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(length, 0);
        ctx.lineTo(length - 10, -5);
        ctx.lineTo(length - 10, 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    this.mouseDown = function (x, y) {
        if (!isDrawing) {
            isDrawing = true;
            startPoint.x = x;
            startPoint.y = y;
            endPoint.x = x;
            endPoint.y = y;
            toolPaint();
            drawingArea.onPaint();
        }
    }

    this.mouseUp = function (x, y) {
        if (isDrawing) {
            isDrawing = false;
            endPoint.x = x;
            endPoint.y = y;
            toolPaint();
            drawingArea.drawToCanvas(toolCanvas);
            toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
            drawingArea.onPaint();
            startPoint = { x: 0, y: 0 };
            endPoint = { x: 0, y: 0 };
        }
    }

}