function StairTool(drawingArea) {
    var that = this;

    var width = drawingArea.gridSize * 2;

    var isDrawing = false;
    var originalStartPoint = { x: 0, y: 0 };
    var startPoint = { x: 0, y: 0 };
    var endPoint = { x: 0, y: 0 };
    var snapAxis = false;
    var colour = "#000000";
    var useSnap = false;


    var toolCanvas = document.createElement('canvas');
    var toolCtx = toolCanvas.getContext('2d');
    toolCanvas.width = drawingArea.canvas.width;
    toolCanvas.height = drawingArea.canvas.height;
    toolCtx.lineWidth = 1;
    toolCtx.lineJoin = 'round';
    toolCtx.lineCap = 'butt';

    var eraseCanvas = document.createElement('canvas');
    var eraseCtx = eraseCanvas.getContext('2d');
    eraseCanvas.width = drawingArea.canvas.width;
    eraseCanvas.height = drawingArea.canvas.height;
    eraseCtx.lineWidth = 1;
    eraseCtx.lineJoin = 'round';
    eraseCtx.lineCap = 'butt';

    function setStartPoint(x, y) {
        originalStartPoint.x = x;
        originalStartPoint.y = y;

        if (useSnap) {
            var rounding = drawingArea.gridSize;

            if (Math.abs(originalStartPoint.x - endPoint.x) > Math.abs(originalStartPoint.y - endPoint.y)) {
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

    function setEndPoint(x, y) {
        if (useSnap) {
            var rounding = drawingArea.gridSize;

            if (Math.abs(originalStartPoint.x - x) > Math.abs(originalStartPoint.y - y)) {
                endPoint.x = x;
                endPoint.y = Math.round(y / rounding) * rounding;
            }
            else {
                endPoint.x = Math.round(x / rounding) * rounding;
                endPoint.y = y;
            }
        }
        else {
            endPoint.x = x;
            endPoint.y = y;
        }

        setStartPoint(originalStartPoint.x, originalStartPoint.y);
    }

    this.setSpanAxis = function (use) {
        snapAxis = use;
        useSnap = use;
    }

    this.getUseSnap = function() {
        return useSnap;
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
        context.save();
        context.globalCompositeOperation = "destination-out";
        context.drawImage(eraseCanvas, 0, 0);
        context.restore();

        context.drawImage(toolCanvas, 0, 0);
    }

    function toolPaint() {

        var canvas = toolCanvas;
        var context = toolCtx;

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

        var angle = getDirectionToPoint(startPoint.x, startPoint.y, end.x, end.y);

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();

        context.translate(startPoint.x, startPoint.y);
        context.rotate(angle);

        var length = Math.sqrt(Math.pow(end.x - startPoint.x, 2) + Math.pow(end.y - startPoint.y, 2));

        context.save();
        context.translate(0, - width / 2);

        context.beginPath();
        context.moveTo(length * 0.1, 0);
        context.lineTo(length * 0.9, 0);
        context.stroke();

        context.beginPath();
        context.moveTo(length * 0.9 - 6, -4);
        context.lineTo(length * 0.9, 0);
        context.lineTo(length * 0.9 - 6, 4);
        context.stroke();

        context.restore();

        context.beginPath();
        context.rect(0, -width, length, width);
        context.stroke();

        var steps = Math.round(length * 1.5 / drawingArea.gridSize);

        for (var i = 0; i < steps; i++) {
            var position = i * drawingArea.gridSize / 1.5;
            context.beginPath();
            context.moveTo(position, -width);
            context.lineTo(position, 0);
            context.stroke();
        }

        context.restore();


        eraseCtx.clearRect(0, 0, eraseCanvas.width, eraseCanvas.height);

        eraseCtx.save();

        eraseCtx.translate(startPoint.x, startPoint.y);
        eraseCtx.rotate(angle);

        eraseCtx.fillStyle = "#ffffff";
        eraseCtx.beginPath();
        eraseCtx.rect(0, -width, length, width);
        eraseCtx.fill();

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

        var start = { x: canvas.width * 0.1, y: canvas.height / 1.1 };
        var end = { x: canvas.width * 0.9, y: canvas.height / 1.1 };
        var angle = getDirectionToPoint(start.x, start.y, end.x, end.y);

        ctx.save();

        ctx.translate(start.x, start.y);
        ctx.rotate(angle);

        var length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

        ctx.save();
        ctx.translate(0, - width / 2);

        ctx.beginPath();
        ctx.moveTo(length * 0.1, 0);
        ctx.lineTo(length * 0.9, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(length * 0.9 - 6, -4);
        ctx.lineTo(length * 0.9, 0);
        ctx.lineTo(length * 0.9 - 6, 4);
        ctx.stroke();

        ctx.restore();

        ctx.beginPath();
        ctx.rect(0, -width, length, width);
        ctx.stroke();

        var steps = Math.round(length * 1.5 / drawingArea.gridSize);

        for (var i = 0; i < steps; i++) {
            var position = i * drawingArea.gridSize / 1.5;
            ctx.beginPath();
            ctx.moveTo(position, -width);
            ctx.lineTo(position, 0);
            ctx.stroke();
        }

        ctx.restore();
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
            drawingArea.eraseFromCanvas(eraseCanvas);
            drawingArea.drawToCanvas(toolCanvas);
            toolCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
            eraseCtx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
            drawingArea.onPaint();
            originalStartPoint = { x: 0, y: 0 };
            startPoint = { x: 0, y: 0 };
            endPoint = { x: 0, y: 0 };
        }
    }

}