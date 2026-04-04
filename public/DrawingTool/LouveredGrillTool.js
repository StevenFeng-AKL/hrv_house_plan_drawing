function LouveredGrillTool(drawingArea) {
    var that = this;
    var isDrawing = false;
    var startPoint = { x: 0, y: 0 };
    var rotation = 0;

    var toolCanvas = document.createElement('canvas');
    var toolCtx = toolCanvas.getContext('2d');
    toolCanvas.width = drawingArea.canvas.width;
    toolCanvas.height = drawingArea.canvas.height;
    toolCtx.lineWidth = 1.5;
    toolCtx.lineJoin = 'round';
    toolCtx.lineCap = 'round';
    toolCtx.strokeStyle = '#000000';
    toolCtx.fillStyle = '#000000';

    var eraseCanvas = document.createElement('canvas');
    var eraseCtx = eraseCanvas.getContext('2d');
    eraseCanvas.width = drawingArea.canvas.width;
    eraseCanvas.height = drawingArea.canvas.height;
    eraseCtx.lineWidth = 15;
    eraseCtx.lineJoin = 'round';
    eraseCtx.lineCap = 'round';

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
        if (rotation < 0) rotation = 360 + rotation;
        toolPaint();
        drawingArea.onPaint();
    }

    function toolPaint() {
        toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
        toolCtx.save();
        toolCtx.translate(startPoint.x, startPoint.y);
        toolCtx.rotate(degreesToRadians(rotation));

        var w = 18, h = 12;
        toolCtx.fillStyle = '#000000';
        toolCtx.fillRect(-w/2, -h/2, w, h/3);
        toolCtx.beginPath();
        toolCtx.moveTo(-w/2 + 2, -h/2 + h/3); toolCtx.lineTo(-w/2 + 2, h/2);
        toolCtx.moveTo(0, -h/2 + h/3); toolCtx.lineTo(0, h/2);
        toolCtx.moveTo(w/2 - 2, -h/2 + h/3); toolCtx.lineTo(w/2 - 2, h/2);
        toolCtx.stroke();
        
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
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(degreesToRadians(rotation));
        ctx.scale(1.5, 1.5);

        var toolCtxObj = toolCtx;
        var originalToolCtx = toolCtx;
        // mock toolCtx to ctx just for drawing logic re-use!
        toolCtx = ctx;

        var w = 18, h = 12;
        toolCtx.fillStyle = '#000000';
        toolCtx.fillRect(-w/2, -h/2, w, h/3);
        toolCtx.beginPath();
        toolCtx.moveTo(-w/2 + 2, -h/2 + h/3); toolCtx.lineTo(-w/2 + 2, h/2);
        toolCtx.moveTo(0, -h/2 + h/3); toolCtx.lineTo(0, h/2);
        toolCtx.moveTo(w/2 - 2, -h/2 + h/3); toolCtx.lineTo(w/2 - 2, h/2);
        toolCtx.stroke();

        toolCtx = originalToolCtx;
        ctx.restore();
    }

    this.mouseDown = function (x, y) {
        isDrawing = true;
        startPoint.x = x;
        startPoint.y = y;
        toolPaint();
        this.previewPaint();
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
