function PenTool(drawingArea) {
    var that = this;
    var isDrawing = false;
    var points = [];
    var useSnap = false;
    var colour = "#000000";

    var toolCanvas = document.createElement('canvas');
    var toolCtx = toolCanvas.getContext('2d');
    toolCanvas.width = drawingArea.canvas.width;
    toolCanvas.height = drawingArea.canvas.height;
    toolCtx.lineWidth = 4;
    toolCtx.lineJoin = 'round';
    toolCtx.lineCap = 'round';

    function addPoint(x, y) {
        if (useSnap) {
            var rounding = drawingArea.gridSize;
            points.push({ x: Math.round(x / rounding) * rounding, y: Math.round(y / rounding) * rounding });
        }
        else {
            points.push({ x: x, y: y });
        }
        
    }

    this.setSnap = function (set) {
        useSnap = set;
    }

    this.setColour = function (newColour) {
        colour = newColour;
        toolCtx.strokeStyle = colour;
        toolCtx.fillStyle = colour;
        this.previewPaint();
    }

    this.handleMouseMove = function (x, y) {
        if (isDrawing) {
            addPoint(x, y);
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

        if (points.length < 3) {
            var b = points[0];
            context.beginPath();
            context.arc(b.x, b.y, context.lineWidth / 2, 0, Math.PI * 2, !0);
            context.fill();
        }
        else {
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);

            for (var i = 1; i < points.length - 2; i++) {
                var c = (points[i].x + points[i + 1].x) / 2;
                var d = (points[i].y + points[i + 1].y) / 2;

                context.quadraticCurveTo(points[i].x, points[i].y, c, d);
            }

            context.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            context.stroke();
        }
    }

    this.previewPaint = function () {
        var canvas = drawingArea.previewCanvas;
        var ctx = drawingArea.previewCtx;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = toolCtx.lineWidth;
        ctx.lineJoin = toolCtx.lineJoin;
        ctx.lineCap = toolCtx.lineCap;
        ctx.strokeStyle = toolCtx.strokeStyle;
        ctx.fillStyle = toolCtx.fillStyle;

        var points = [{ x: canvas.width * 0.1, y: canvas.height / 2 }, { x: canvas.width * 0.9, y: canvas.height / 2 }];
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.quadraticCurveTo(points[0].x, points[0].y, points[1].x, points[1].y);
        ctx.stroke();
    }

    this.mouseDown = function (x, y) {
        if (!isDrawing) {
            isDrawing = true;
            addPoint(x, y);
            toolPaint();
            drawingArea.onPaint();
        }
    }

    this.mouseUp = function (x, y) {
        if (isDrawing) {
            isDrawing = false;
            addPoint(x, y);
            toolPaint();
            drawingArea.drawToCanvas(toolCanvas);
            toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
            drawingArea.onPaint();
            points = [];
        }
    }

}