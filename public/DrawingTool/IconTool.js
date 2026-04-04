function IconTool(drawingArea, iconURL) {
    var that = this;
    var isDrawing = false;
    var startPoint = { x: 0, y: 0 };
    var rotation = 0;
    var icon = new Image();
    icon.src = iconURL;

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

    icon.onload = (() => this.previewPaint());

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

        if (!icon.complete)
            return;

        toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);

        toolCtx.save();

        toolCtx.translate(startPoint.x, startPoint.y);
        toolCtx.rotate(degreesToRadians(rotation));

        toolCtx.drawImage(icon, -(icon.width / 2), -icon.height);
        toolCtx.restore();

        eraseCtx.clearRect(0, 0, eraseCanvas.width, eraseCanvas.height);
    }

    this.previewPaint = function () {
        if (!icon.complete) {
            return;
        }

        var canvas = drawingArea.previewCanvas;
        var ctx = drawingArea.previewCtx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = toolCtx.lineWidth;
        ctx.lineJoin = toolCtx.lineJoin;
        ctx.lineCap = toolCtx.lineCap;
        ctx.strokeStyle = toolCtx.strokeStyle;
        ctx.fillStyle = toolCtx.fillStyle;

        ctx.save();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(degreesToRadians(rotation));
        ctx.drawImage(icon, -(icon.width / 2), -icon.height / 2);
        ctx.restore();
    }


    this.mouseDown = function (x, y) {
        isDrawing = true;
        startPoint.x = x;
        startPoint.y = y;
        toolPaint();
        drawingArea.onPaint();
        this.previewPaint();
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