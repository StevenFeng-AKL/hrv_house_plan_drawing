"use strict";


function DrawingAreaPage(drawingArea, data) {

    var self = this;

    var maxBackgroundImageSize = 2000;

    this.backgroundImage = null;
    this.backgroundPosition = {
        x: 0,
        y: 0
    };
    this.backgroundScale = 1;
    this.backgroundRotation = 0;

    this.backgroundEraseImage = null;

    this.drawingCanvas = document.createElement('canvas');
    this.drawingCtx = self.drawingCanvas.getContext('2d');
    self.drawingCanvas.width = drawingArea.width;
    self.drawingCanvas.height = drawingArea.height;

    this.tempDrawingCanvas = document.createElement('canvas');
    this.tempDrawingCtx = self.tempDrawingCanvas.getContext('2d');
    self.tempDrawingCanvas.width = drawingArea.width;
    self.tempDrawingCanvas.height = drawingArea.height;

    this.backgroundCanvas = document.createElement('canvas');
    this.backgroundCtx = self.backgroundCanvas.getContext('2d');
    self.backgroundCanvas.width = drawingArea.width;
    self.backgroundCanvas.height = drawingArea.height;

    this.backgroundEraseCanvas = document.createElement('canvas');
    this.backgroundEraseCtx = self.backgroundEraseCanvas.getContext('2d');
    self.backgroundEraseCanvas.width = drawingArea.width;
    self.backgroundEraseCanvas.height = drawingArea.height;

    if (data) {
        self.backgroundPosition.x = data.backgroundPositionX;
        self.backgroundPosition.y = data.backgroundPositionY;
        self.backgroundScale = data.backgroundScale;
        self.backgroundRotation = data.backgroundRotation;

        if (data.backgroundImageData) {
            self.backgroundImage = new Image();
            self.backgroundImage.onload = function () {
                self.drawBackground();
                drawingArea.onPaint();
            };
            self.backgroundImage.src = data.backgroundImageData;// + "?v=" + new Date().getTime();
        }

        if (data.backgroundEraseImageData) {
            self.backgroundEraseImage = new Image();
            self.backgroundEraseImage.onload = function () {
                self.backgroundEraseCanvas = document.createElement('canvas');
                self.backgroundEraseCtx = self.backgroundEraseCanvas.getContext('2d');
                self.backgroundEraseCanvas.width = self.backgroundEraseImage.width;
                self.backgroundEraseCanvas.height = self.backgroundEraseImage.height;

                self.backgroundEraseCtx.drawImage(self.backgroundEraseImage, 0, 0);

                self.drawBackground();
                drawingArea.onPaint();
            };
            self.backgroundEraseImage.src = data.backgroundEraseImageData;// + "?v=" + new Date().getTime();
        }

        if (data.drawingData) {
            var savedImage = new Image();
            savedImage.onload = function () {
                self.drawingCtx.drawImage(savedImage, 0, 0);
                drawingArea.onPaint();
            };
            savedImage.src = data.drawingData;// + "?v=" + new Date().getTime();
        }
    }


    this.onPaint = function (tool) {
        self.tempDrawingCtx.clearRect(0, 0, self.tempDrawingCanvas.width, self.tempDrawingCanvas.height);

        self.tempDrawingCtx.drawImage(self.drawingCanvas, 0, 0);

        if (tool != null && typeof tool.onPaint == 'function')
            tool.onPaint(self.tempDrawingCtx);
    }

    this.clear = function () {
        self.drawingCtx.clearRect(0, 0, self.drawingCanvas.width, self.drawingCanvas.height);
    }

    this.loadBackground = function (file) {

        var fileReader = new FileReader();

        fileReader.onload = function () {
            self.backgroundImage = new Image();
            self.backgroundImage.onload = function () {

                limitBackgroundImageSize();

                fitBackgroundImageOnScreen();

                self.backgroundEraseCanvas = document.createElement('canvas');
                self.backgroundEraseCtx = self.backgroundEraseCanvas.getContext('2d');
                self.backgroundEraseCanvas.width = self.backgroundImage.width;
                self.backgroundEraseCanvas.height = self.backgroundImage.height;

                self.drawBackground();
                drawingArea.onPaint();

                /*
                var testCanvas = document.createElement('canvas');
                var testCtx = testCanvas.getContext('2d');
                testCanvas.width = self.backgroundImage.width;
                testCanvas.height = self.backgroundImage.height;

                testCtx.drawImage(self.backgroundImage, 0, 0);

                var imgData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height);
                console.log(imgData);
                */

                /*
                var updated = "no update";
                var imgData = self.backgroundCtx.getImageData(0, 0, self.backgroundCanvas.width, self.backgroundCanvas.height);

                for (var i = 0; i < imgData.data.length; i += 4) {
                    if (imgData.data[i] == 255 && imgData.data[i + 1] == 254 && imgData.data[i + 2] == 255) {
                        imgData.data[i + 1] == 255;
                        updated = "updated";
                    }
                }
                self.backgroundCtx.putImageData(imgData, 0, 0);
                alert(updated);
                */
            };
            self.backgroundImage.src = fileReader.result;
        };

        fileReader.readAsDataURL(file);
    }

    function limitBackgroundImageSize() {
        var widthDifference = maxBackgroundImageSize - self.backgroundImage.width;
        var heightDifference = maxBackgroundImageSize - self.backgroundImage.height;

        if (widthDifference < 0 || heightDifference < 0) {
            var delta = 1;
            if (widthDifference < heightDifference) {
                delta = maxBackgroundImageSize / self.backgroundImage.width;
            }
            else {
                delta = maxBackgroundImageSize / self.backgroundImage.height;
            }

            self.backgroundImage.width *= delta;
            self.backgroundImage.height *= delta;
        }
    }

    function fitBackgroundImageOnScreen() {
        self.backgroundPosition = {
            x: drawingArea.width / 2,
            y: drawingArea.width / 2
        };

        self.backgroundScale = 1;
        self.backgroundRotation = 0;

        var widthDifference = drawingArea.width - self.backgroundImage.width;
        var heightDifference = drawingArea.height - self.backgroundImage.height;

        if (widthDifference < 0 || heightDifference < 0) {
            if (widthDifference < heightDifference) {
                self.backgroundScale = drawingArea.width / self.backgroundImage.width;
            }
            else {
                self.backgroundScale = drawingArea.height / self.backgroundImage.height;
            }
        }
    }

    this.drawBackground = function () {

        if (self.backgroundImage && self.backgroundImage.naturalWidth !== 0 && self.backgroundImage.naturalHeight !== 0) {
            self.backgroundCtx.save();

            self.backgroundCtx.clearRect(0, 0, self.backgroundCanvas.width, self.backgroundCanvas.height);

            var translateX = self.backgroundPosition.x - self.backgroundImage.width / 2;
            var translateY = self.backgroundPosition.y - self.backgroundImage.height / 2;

            var scaleTranlationX = self.backgroundImage.width / 2;
            var scaleTranlationY = self.backgroundImage.height / 2;

            self.backgroundCtx.translate(translateX, translateY);

            self.backgroundCtx.translate(scaleTranlationX, scaleTranlationY);
            self.backgroundCtx.rotate(degreesToRadians(self.backgroundRotation));
            self.backgroundCtx.translate(-scaleTranlationX, -scaleTranlationY);

            self.backgroundCtx.translate(scaleTranlationX, scaleTranlationY);
            self.backgroundCtx.scale(self.backgroundScale, self.backgroundScale);
            self.backgroundCtx.translate(-scaleTranlationX, -scaleTranlationY);


            self.backgroundCtx.drawImage(self.backgroundImage, 0, 0, self.backgroundImage.width, self.backgroundImage.height);
            //self.backgroundCtx.fillRect(0, 0, self.backgroundImage.width, self.backgroundImage.height);

            self.backgroundCtx.globalCompositeOperation = "destination-out";
            self.backgroundCtx.drawImage(self.backgroundEraseCanvas, 0, 0);

            self.backgroundCtx.restore();
        }
    }

    this.eraseFromBackground = function (toolCanvas) {

        if (self.backgroundImage) {
            self.backgroundEraseCtx.save();

            var translateX = self.backgroundPosition.x - self.backgroundImage.width / 2;
            var translateY = self.backgroundPosition.y - self.backgroundImage.height / 2;

            var scaleTranlationX = self.backgroundImage.width / 2;
            var scaleTranlationY = self.backgroundImage.height / 2;

            self.backgroundEraseCtx.translate(scaleTranlationX, scaleTranlationY);
            self.backgroundEraseCtx.scale(1 / self.backgroundScale, 1 / self.backgroundScale);
            self.backgroundEraseCtx.translate(-scaleTranlationX, -scaleTranlationY);

            self.backgroundEraseCtx.translate(scaleTranlationX, scaleTranlationY);
            self.backgroundEraseCtx.rotate(degreesToRadians(-self.backgroundRotation));
            self.backgroundEraseCtx.translate(-scaleTranlationX, -scaleTranlationY);

            self.backgroundEraseCtx.translate(-translateX, -translateY);

            self.backgroundEraseCtx.drawImage(toolCanvas, 0, 0);

            self.backgroundEraseCtx.restore();
        }
    }

    this.clearBackground = function () {
        self.backgroundImage = null;
        self.backgroundPosition = {
            x: 0,
            y: 0
        };
        self.backgroundScale = 1;
        self.backgroundRotation = 0;

        self.backgroundEraseImage = null;

        self.backgroundCanvas = document.createElement('canvas');
        self.backgroundCtx = self.backgroundCanvas.getContext('2d');
        self.backgroundCanvas.width = drawingArea.width;
        self.backgroundCanvas.height = drawingArea.height;
    }

    this.resetBackground = function () {
        if (self.backgroundImage) {
            limitBackgroundImageSize();
            fitBackgroundImageOnScreen();
            createBackgroundEraseCanvas();

            self.drawBackground();
        }
    }

    function createBackgroundEraseCanvas() {
        self.backgroundEraseCanvas = document.createElement('canvas');
        self.backgroundEraseCtx = self.backgroundEraseCanvas.getContext('2d');

        if (self.backgroundImage) {
            self.backgroundEraseCanvas.width = self.backgroundImage.width;
            self.backgroundEraseCanvas.height = self.backgroundImage.height;
        }
        else {
            self.backgroundEraseCanvas.width = drawingArea.width;
            self.backgroundEraseCanvas.height = drawingArea.height;
        }
    }

    this.getData = function () {

        var pageData = {};

        pageData.drawingData = self.drawingCanvas.toDataURL();

        if (self.backgroundImage && self.backgroundImage.naturalWidth !== 0 && self.backgroundImage.naturalHeight !== 0) {

            var backgroundImageCanvas = document.createElement('canvas');
            var backgroundImageCtx = backgroundImageCanvas.getContext('2d');
            backgroundImageCanvas.width = self.backgroundImage.width;
            backgroundImageCanvas.height = self.backgroundImage.height;

            backgroundImageCtx.drawImage(self.backgroundImage, 0, 0, self.backgroundImage.width, self.backgroundImage.height);

            pageData.backgroundImageData = backgroundImageCanvas.toDataURL();
            //pageData.backgroundImageData = backgroundImageCanvas.toDataURL('image/jpeg', 0.9);

            pageData.backgroundEraseImageData = self.backgroundEraseCanvas.toDataURL();
        }

        pageData.backgroundPositionX = self.backgroundPosition.x;
        pageData.backgroundPositionY = self.backgroundPosition.y;
        pageData.backgroundScale = self.backgroundScale;
        pageData.backgroundRotation = self.backgroundRotation;

        return pageData;
    }

}