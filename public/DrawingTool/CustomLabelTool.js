function CustomLabelTool(drawingArea, text) {
    var that = this;
    var label = text;
    var isDrawing = false;
    var startPoint = { x: 0, y: 0 };
    var rotation = 0;

    var toolCanvas = document.createElement('canvas');
    var toolCtx = toolCanvas.getContext('2d');
    toolCanvas.width = drawingArea.canvas.width;
    toolCanvas.height = drawingArea.canvas.height;
    toolCtx.lineWidth = 4;
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
        toolPaint();
        drawingArea.onPaint();
    }

    function toolPaint() {

        toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);

        toolCtx.save();
        
        toolCtx.translate(startPoint.x, startPoint.y);
        toolCtx.rotate(degreesToRadians(rotation));

        var textHeight = 12;
        toolCtx.font = textHeight + "px Arial";
        var textWidth = toolCtx.measureText(label).width;

        toolCtx.fillText(label, 0, 0);
        toolCtx.restore();

        eraseCtx.clearRect(0, 0, eraseCanvas.width, eraseCanvas.height);
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

        ctx.save();
        var textHeight = 20;
        ctx.font = textHeight + "px Arial";
        var textWidth = ctx.measureText(label).width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(degreesToRadians(rotation));

        ctx.fillText(label, -(textWidth / 2), textHeight/2);
        ctx.restore();
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
        }
    }

}