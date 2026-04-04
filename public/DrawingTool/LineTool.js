function LineTool(drawingArea) {
    var that = this;
    var isDrawing = false;
    var startPoint = { x: 0, y: 0 };
    var endPoint = { x: 0, y: 0 };
    var snapAxis = false;
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

    this.setSpanAxis = function (use) {
        snapAxis = use;
        useSnap = use;
    }

    this.getUseSnap = function() {
        return useSnap;
    }

    this.setSnap = function (set) {
        useSnap = set;
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

    function toolPaint() {

        var canvas = toolCanvas;
        var context = toolCtx;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);

        var end = [];
        if (snapAxis) {

            if (Math.abs(startPoint.x - endPoint.x) > Math.abs(startPoint.y - endPoint.y)) {
                end.x = endPoint.x;
                end.y = startPoint.y;
            }
            else {
                end.x = startPoint.x;
                end.y = endPoint.y;
            }
        }
        else {
            end.x = endPoint.x;
            end.y = endPoint.y;
        }

        context.lineTo(end.x, end.y);
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
        ctx.moveTo(canvas.width*0.1, canvas.height/2);
        ctx.lineTo(canvas.width*0.9, canvas.height/2);
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