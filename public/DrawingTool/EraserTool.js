function EraserTool(drawingArea) {
    var that = this;
    var isDrawing = false;
    var points = [];
    var currentPoint = null;

    var eraseCanvas = document.createElement('canvas');
    var eraseCtx = eraseCanvas.getContext('2d');
    eraseCanvas.width = drawingArea.canvas.width;
    eraseCanvas.height = drawingArea.canvas.height;
    eraseCtx.lineWidth = 30;
    eraseCtx.lineJoin = 'round';
    eraseCtx.lineCap = 'round';

    var toolCanvas = document.createElement('canvas');
    var toolCtx = toolCanvas.getContext('2d');
    toolCanvas.width = drawingArea.canvas.width;
    toolCanvas.height = drawingArea.canvas.height;
    toolCtx.lineWidth = 1;
    toolCtx.strokeStyle = "#aaaaaa";
    toolCtx.lineJoin = 'round';
    toolCtx.lineCap = 'round';

    this.handleMouseMove = function (x, y) {
        currentPoint = { x: x, y: y };
        if (isDrawing) {
            points.push({ x: x, y: y });
            toolPaint();
        }
        helperPaint();
        drawingArea.onPaint();
    }

    this.onPaint = function (context) {
        context.save();
        context.globalCompositeOperation = "destination-out";
        context.drawImage(eraseCanvas, 0, 0);
        context.restore();

        context.drawImage(toolCanvas, 0, 0);
    }

    function helperPaint() {
        if (currentPoint != null) {
            toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
            toolCtx.beginPath();
            toolCtx.arc(currentPoint.x, currentPoint.y, eraseCtx.lineWidth / 2, 0, Math.PI * 2);
            toolCtx.stroke();
        }
    }

    function toolPaint() {

        eraseCtx.clearRect(0, 0, eraseCanvas.width, eraseCanvas.height);

        if (points.length < 3) {
            var b = points[0];
            eraseCtx.beginPath();
            eraseCtx.arc(b.x, b.y, eraseCtx.lineWidth / 2, 0, Math.PI * 2, !0);
            eraseCtx.fill();
        }
        else {
            eraseCtx.beginPath();
            eraseCtx.moveTo(points[0].x, points[0].y);

            for (var i = 1; i < points.length - 2; i++) {
                var c = (points[i].x + points[i + 1].x) / 2;
                var d = (points[i].y + points[i + 1].y) / 2;

                eraseCtx.quadraticCurveTo(points[i].x, points[i].y, c, d);
            }

            eraseCtx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            eraseCtx.stroke();
        }
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

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2 * 0.7, 0, 2 * Math.PI);
        ctx.stroke();
    }

    this.mouseDown = function (x, y) {
        currentPoint = { x: x, y: y };
        if (!isDrawing) {
            isDrawing = true;
            points.push({ x: x, y: y });
            toolPaint();
            helperPaint();
            drawingArea.onPaint();
        }
    }

    this.mouseUp = function (x, y) {
        currentPoint = { x: x, y: y };
        if (isDrawing) {
            isDrawing = false;
            points.push({ x: x, y: y });
            toolPaint();
            helperPaint();
            drawingArea.eraseFromCanvas(eraseCanvas);
            eraseCtx.clearRect(0, 0, eraseCanvas.width, eraseCanvas.height);
            drawingArea.onPaint();
            points = [];
        }
    }

}