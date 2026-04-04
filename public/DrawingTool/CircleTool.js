function CircleTool(drawingArea) {
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

    function setStartPoint(x, y) {
        startPoint.x = x;
        startPoint.y = y;
    }

    function setEndPoint(x, y) {
        endPoint.x = x;
        endPoint.y = y;
    }

    this.setColour = function (newColour) {
        colour = newColour;
        toolCtx.strokeStyle = colour;
        this.previewPaint();
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
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height/2*0.7, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function toolPaint() {

        var canvas = toolCanvas;
        var context = toolCtx;

        context.clearRect(0, 0, canvas.width, canvas.height);

        var radius = getDistanceBetweenPoints(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        context.beginPath();
        context.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        context.stroke();
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