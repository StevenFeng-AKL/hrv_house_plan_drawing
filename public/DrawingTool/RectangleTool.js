function RectangleTool(drawingArea) {
    var that = this;
    var isDrawing = false;
    var startPoint = { x: 0, y: 0 };
    var endPoint = { x: 0, y: 0 };
    var colour = "#000000";
    var useSnap = false;

    var toolCanvas = document.createElement('canvas');
    var toolCtx = toolCanvas.getContext('2d');
    toolCanvas.width = drawingArea.canvas.width;
    toolCanvas.height = drawingArea.canvas.height;
    toolCtx.lineWidth = 4;
    toolCtx.lineJoin = 'round';
    toolCtx.lineCap = 'round';

    function setStartPoint(x, y) {
        if (useSnap) {
            var rounding = drawingArea.gridSize;
            startPoint.x = Math.round(x / rounding) * rounding;
            startPoint.y = Math.round(y / rounding) * rounding;
        }
        else {
            startPoint.x = x;
            startPoint.y = y;
        }

    }

    function setEndPoint(x, y) {
        if (useSnap) {
            var rounding = drawingArea.gridSize;
            endPoint.x = Math.round(x / rounding) * rounding;
            endPoint.y = Math.round(y / rounding) * rounding;
        }
        else {
            endPoint.x = x;
            endPoint.y = y;
        }
    }

    this.setColour = function (newColour) {
        colour = newColour;
        toolCtx.strokeStyle = colour;
        this.previewPaint();
    }

    this.setSnap = function (set) {
        useSnap = set;
    }

    this.handleMouseMove = function (x, y) {
        if (isDrawing) {
            setEndPoint(x, y);
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

        context.beginPath();
        context.rect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
        context.stroke();
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

        ctx.beginPath();
        ctx.rect(canvas.width * 0.15, canvas.height * 0.15, canvas.width * 0.85 - canvas.width * 0.15,
            canvas.height * 0.85 -
            canvas.height * 0.15);
        ctx.stroke();
    }

    this.mouseDown = function (x, y) {
        if (!isDrawing) {
            isDrawing = true;
            setStartPoint(x, y);
            setEndPoint(x, y);
            toolPaint();
            drawingArea.onPaint();
        }
    }

    this.mouseUp = function (x, y) {
        if (isDrawing) {
            isDrawing = false;
            setEndPoint(x, y);
            toolPaint();
            drawingArea.drawToCanvas(toolCanvas);
            toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
            drawingArea.onPaint();
            startPoint = { x: 0, y: 0 };
            endPoint = { x: 0, y: 0 };
        }
    }

}