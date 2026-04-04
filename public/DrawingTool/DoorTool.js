function DoorTool(drawingArea) {
    var that = this;
    var isDrawing = false;
    var startPoint = { x: 0, y: 0 };
    var rotation = 0;
    var flipped = false;
    var colour = "#000000";
    var useSnap = false;

    var toolCanvas = document.createElement('canvas');
    var toolCtx = toolCanvas.getContext('2d');
    toolCanvas.width = drawingArea.canvas.width;
    toolCanvas.height = drawingArea.canvas.height;
    toolCtx.lineWidth = 4;
    toolCtx.lineJoin = 'round';
    toolCtx.lineCap = 'butt';

    var eraseCanvas = document.createElement('canvas');
    var eraseCtx = eraseCanvas.getContext('2d');
    var width = 27;
    eraseCanvas.width = drawingArea.canvas.width;
    eraseCanvas.height = drawingArea.canvas.height;
    eraseCtx.lineWidth = 15;
    eraseCtx.lineJoin = 'round';
    eraseCtx.lineCap = 'butt';

    function setStartPoint(x, y) {
        if (useSnap) {
            var rounding = drawingArea.gridSize;

            if (rotation % 180 == 0) {
                startPoint.x = x;
                startPoint.y = Math.round(y / rounding) * rounding;
            }
            else {
                startPoint.x = Math.round(x / rounding) * rounding;
                startPoint.y = y;
            }
        }
        else {
            startPoint.x = x;
            startPoint.y = y;
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
        setStartPoint(x, y);
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
        this.previewPaint();
    }

    this.flip = function () {
        flipped = !flipped;
        toolPaint();
        drawingArea.onPaint();
        this.previewPaint();
    }

    function toolPaint() {
        toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);

        toolCtx.save();
        
        toolCtx.translate(startPoint.x, startPoint.y);
        toolCtx.rotate(degreesToRadians(rotation));

        if (flipped)
            toolCtx.scale(-1, 1);

        toolCtx.beginPath();
        toolCtx.moveTo(0, 0);
        toolCtx.lineTo(0, -width);
        toolCtx.stroke();

        toolCtx.save();
        toolCtx.lineWidth = 2;
        toolCtx.beginPath();
        toolCtx.arc(0, 0, width, degreesToRadians(-90), 0);
        toolCtx.stroke();
        toolCtx.restore();

        toolCtx.restore();

        eraseCtx.clearRect(0, 0, eraseCanvas.width, eraseCanvas.height);

        eraseCtx.save();

        eraseCtx.translate(startPoint.x, startPoint.y);
        eraseCtx.rotate(degreesToRadians(rotation));

        if (flipped)
            eraseCtx.scale(-1, 1);

        eraseCtx.beginPath();
        eraseCtx.moveTo(0, 0);
        eraseCtx.lineTo(width, 0);
        eraseCtx.stroke();
        eraseCtx.restore();
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

        ctx.translate((canvas.width / 2), (canvas.height / 2));
        ctx.rotate(degreesToRadians(rotation));

        if (flipped) {
            ctx.scale(-1, 1);
        }

        ctx.translate(- (width / 2), width / 2);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -width);
        ctx.stroke();

        ctx.save();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, width, degreesToRadians(-90), 0);
        ctx.stroke();
        ctx.restore();
        ctx.restore();
    }

    this.mouseDown = function (x, y) {
        isDrawing = true;
        setStartPoint(x, y);
        toolPaint();
        drawingArea.onPaint();
    }

    this.mouseUp = function (x, y) {
        if (isDrawing) {
            isDrawing = false;
            setStartPoint(x, y);
            toolPaint();
            drawingArea.eraseFromCanvas(eraseCanvas);
            drawingArea.drawToCanvas(toolCanvas);
            toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
            eraseCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
            drawingArea.onPaint();
        }
    }

}