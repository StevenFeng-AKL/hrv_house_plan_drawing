"use strict";


function isIndoor(model) {
    var suffix = " - CS";
    return model.indexOf(suffix, model.length - suffix.length) !== -1;
}

function getDirectionToPoint(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function getDistanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2));
}

function radiansToDegrees(radians) {
    return radians * (180.0 / Math.PI);
}

function degreesToRadians(degrees) {
    return degrees / (180.0 / Math.PI);
}



function DrawingArea(width, height) {
    var self = this;

    this.gridSize = 27;

    this.width = Math.min(1017, width);
    this.height = Math.min(1017, height);

    this.pages = [];
    this.currentPageIndex = 0;
    this.currentPage = null;

    var canvas = $('#drawing_area canvas.drawing').get(0);
    canvas.width = self.width;
    canvas.height = self.height;
    var ctx = canvas.getContext('2d');
    this.canvas = canvas;

    var gridCanvas = document.createElement('canvas');
    this.gridCanvas = gridCanvas;
    var gridCtx = this.gridCanvas.getContext('2d');
    this.gridCanvas.width = self.width;
    this.gridCanvas.height = self.height;

    var keyCanvas = $('#drawing_area canvas.key').get(0);
    var keyCtx = keyCanvas.getContext('2d');

    this.previewCanvas = $('#drawing_area canvas.preview').get(0);
    this.previewCtx = this.previewCanvas.getContext('2d');

    var scaleCanvas = document.createElement('canvas');
    var scaleCtx = scaleCanvas.getContext('2d');


    var gridImage = new Image();
    this.gridImage = gridImage;
    this.gridImage.onload = function () {

        gridCtx.save();

        gridCtx.globalAlpha = 0.15;
        gridCtx.translate(self.gridSize * -3, self.gridSize * -3);

        var pattern = gridCtx.createPattern(self.gridImage, 'repeat');
        gridCtx.fillStyle = pattern;
        gridCtx.fillRect(self.gridSize * 3, self.gridSize * 3, self.gridCanvas.width, self.gridCanvas.height);

        gridCtx.restore();

        self.onPaint();
    };

    var scaleImage = new Image();
    scaleImage.onload = function () {
        scaleCanvas.width = scaleImage.width;
        scaleCanvas.height = scaleImage.height;
        scaleCtx.drawImage(scaleImage, 0, 0);
        self.onPaint();
    };

    var keyImage = new Image();
    keyImage.onload = function () {
        keyCtx.imageSmoothingEnabled = false;
        keyCanvas.width = self.width;
        var scale = self.width / keyImage.width;
        keyCanvas.height = keyImage.height * scale;
        keyCtx.scale(scale, scale);
        keyCtx.drawImage(keyImage, 0, 0);
    };

    var previewImage = new Image();
    previewImage.onload = function () {
        self.previewCanvas.width = previewImage.width;
        self.previewCanvas.height = previewImage.height * 0.5;
    };

    this.goToPage = function (pageNumber) {
        self.currentPageIndex = pageNumber - 1;
        self.currentPage = self.pages[self.currentPageIndex];

        $("#drawing_area .pagination .page").removeClass("current");

        $("#drawing_area .pagination .page").each(function () {
            if ($(this).text() == pageNumber) {
                $(this).addClass("current");
            }
        });

        self.onPaint();
    }

    this.clearPages = function () {
        self.pages = [];
        $("#drawing_area .pagination .page").parent().remove();
    }

    function addPage(data) {
        self.pages.push(new DrawingAreaPage(self, data));
        insertPageButton(self.pages.length);
    }

    function insertPageButton(pageNumber) {
        $("<li><a class=\"page\">" + pageNumber + "</a></li>").insertBefore($("#drawing_area .pagination .add_page").parent());
    }

    function removeAllPageButtons() {
        $("#drawing_area .pagination .page").remove();
    }

    function removePage(pageNumber) {
        self.pages.splice(pageNumber - 1, 1);
        removeAllPageButtons();

        for (var i = 0; i < self.pages.length; i++) {
            insertPageButton(i + 1);
        }

        if (pageNumber > self.pages.length) {
            self.goToPage(self.pages.length);
        }
        else {
            self.goToPage(pageNumber);
        }
    }


    this.getData = function () {
        var data = {};
        data.pages = [];

        for (var i = 0; i < self.pages.length; i++) {
            var pageData = self.pages[i].getData();
            pageData.printImageData = self.getPrintData(self.pages[i]);
            data.pages.push(pageData);
        }

        return JSON.stringify(data);
    }
    this.getPrintData = function (page) {
        var printCanvas = document.createElement('canvas');
        var printCtx = printCanvas.getContext('2d');
        printCanvas.width = self.width;
        printCanvas.height = self.height + keyCanvas.height;

        printCtx.fillStyle = "#ffffff";
        printCtx.fillRect(0, 0, printCanvas.width, printCanvas.height);

        printCtx.drawImage(page.backgroundCanvas, 0, 0);
        printCtx.drawImage(page.drawingCanvas, 0, 0);
        printCtx.drawImage(keyCanvas, 0, self.height);

        if (typeof currentAddress !== 'undefined' && currentAddress !== '') {
            printCtx.font = "16px Arial";
            printCtx.fillStyle = "black";
            printCtx.fillText(currentAddress, 10, 24);
        }

        return printCanvas.toDataURL();
    }

    this.loadDrawing = function (data) {
        self.clearPages();

        if (!data.pages) {
            data.pages = [];
        }

        for (var i = 0; i < data.pages.length; i++) {
            addPage(data.pages[i]);
        }

        if (self.pages.length == 0) {
            addPage();
        }

        self.goToPage(1);
    }

    this.onPaint = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(self.currentPage.backgroundCanvas, 0, 0);
        ctx.drawImage(gridCanvas, 0, 0);

        self.previewCtx.drawImage(self.previewCanvas, 0, 0);

        self.currentPage.onPaint(tool);
        if (tool != undefined && typeof tool.previewPaint == 'function') {
            tool.previewPaint();
        }

        ctx.drawImage(self.currentPage.tempDrawingCanvas, 0, 0);

        ctx.drawImage(scaleCanvas, 50, 950);

        if (typeof currentAddress !== 'undefined' && currentAddress !== '') {
            ctx.font = "16px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(currentAddress, 10, 24);
        }
    };

    this.drawToCanvas = function (toolCanvas) {
        self.currentPage.drawingCtx.drawImage(toolCanvas, 0, 0);
    }

    this.eraseFromCanvas = function (toolCanvas) {
        self.currentPage.drawingCtx.save();
        self.currentPage.drawingCtx.globalCompositeOperation = "destination-out";
        self.currentPage.drawingCtx.drawImage(toolCanvas, 0, 0);
        self.currentPage.drawingCtx.restore();
    }


    this.areAllHeatpumpsPlaced = function () {

        var allPlaced = true;

        $("#drawing_area .heatpump_tool").each(function () {
            if ($(this).hasClass("placed") == false) {
                allPlaced = false;
            }
        });

        return allPlaced;
    }

    this.setHeatpumpTools = function (heatpumps) {

        var oldPlacedHeatpumps = [];
        $("#drawing_area .heatpump_tool.placed").each(function () {
            oldPlacedHeatpumps.push($(this).text());
        });

        $("#drawing_area .heatpump_tool").remove();

        for (var i = 0; i < heatpumps.length; i++) {

            var text = heatpumps[i].model + " - CS";
            var $button = $("<a href=\"#\" data-index=\"" + (i * 2) + "\" data-model=\"" + heatpumps[i].model + "\" data-isDucted=\"" + heatpumps[i].isDucted + "\" class=\"heatpump_tool\">" + text + "</a>");
            $button.click(function () {
                tool = new HeatpumpTool(self, $(this).attr("data-index"), $(this).attr("data-model"), true, $(this).attr("data-isDucted") == 'true');
                updateUseSnap();
                self.onPaint();
                return false;
            });

            var oldHeapumpIndex = $.inArray(text, oldPlacedHeatpumps);
            if (oldHeapumpIndex >= 0) {
                oldPlacedHeatpumps.splice(oldHeapumpIndex, 1);
                $button.addClass("placed");
            }

            $("#drawing_area .heatpump_icons").append($button);

            text = heatpumps[i].model + " - CU";
            $button = $("<a href=\"#\" data-index=\"" + (i * 2 + 1) + "\" data-model=\"" + heatpumps[i].model + "\" data-isDucted=\"" + heatpumps[i].isDucted + "\" class=\"heatpump_tool\">" + text + "</a>");
            $button.click(function () {
                tool = new HeatpumpTool(self, $(this).attr("data-index"), $(this).attr("data-model"), false, $(this).attr("data-isDucted") == 'true');
                updateUseSnap();
                self.onPaint();
                return false;
            });

            oldHeapumpIndex = $.inArray(text, oldPlacedHeatpumps);
            if (oldHeapumpIndex >= 0) {
                oldPlacedHeatpumps.splice(oldHeapumpIndex, 1);
                $button.addClass("placed");
            }

            $("#drawing_area .heatpump_icons").append($button);
        }
    }

    this.allHeatpumpsPlaced = function (placed) {
        if (placed) {
            $("#drawing_area .heatpump_tool").addClass("placed");
        }
        else {
            $("#drawing_area .heatpump_tool").removeClass("placed");
        }
    }

    this.heatpumpPlaced = function (index) {
        $("#drawing_area .heatpump_tool[data-index='" + index + "']").addClass("placed");

        var index = null;

        $("#drawing_area .heatpump_tool").each(function () {
            if (!$(this).hasClass("placed") && (index == null || $(this).attr("data-index") < index)) {
                index = $(this).attr("data-index");
            }
        });

        if (index != null) {
            $("#drawing_area .heatpump_tool[data-index='" + index + "']").click();
        }
        else {
            $("#drawing_area .pen_tool").click();
        }
    }



    addPage();
    self.goToPage(self.pages.length);

    this.gridImage.src = "Images/background_grid.png" + "?v=" + new Date().getTime();
    keyImage.src = "Images/new_symbols_key.png" + "?v=" + new Date().getTime();
    scaleImage.src = "Images/grid_scale.png" + "?v=" + new Date().getTime();
    previewImage.src = this.gridImage.src;

    var tool = new PenTool(this);
    updateUseSnap();
    resetCursor();

    self.canvas.addEventListener('mousemove', function (e) {
        var x = typeof e.offsetX != 'undefined' ? e.offsetX : e.layerX;
        var y = typeof e.offsetY != 'undefined' ? e.offsetY : e.layerY;
        tool.handleMouseMove(x, y);
    }, false);

    self.canvas.addEventListener('touchmove', function (e) {
        if (e.targetTouches.length == 0) {
            return false;
        }

        var rect = e.target.getBoundingClientRect();
        var x = e.targetTouches[0].clientX - rect.left;
        var y = e.targetTouches[0].clientY - rect.top;

        tool.handleMouseMove(x, y);

        e.preventDefault();

    }, false);

    self.canvas.addEventListener('mousedown', function (e) {
        var x = typeof e.offsetX != 'undefined' ? e.offsetX : e.layerX;
        var y = typeof e.offsetY != 'undefined' ? e.offsetY : e.layerY;
        tool.mouseDown(x, y);
    }, false);

    self.canvas.addEventListener('touchstart', function (e) {
        if (e.targetTouches.length == 0) {
            return false;
        }

        var rect = e.target.getBoundingClientRect();
        var x = e.targetTouches[0].clientX - rect.left;
        var y = e.targetTouches[0].clientY - rect.top;

        tool.mouseDown(x, y);
    }, false);

    self.canvas.addEventListener('mouseup', function (e) {
        var x = typeof e.offsetX != 'undefined' ? e.offsetX : e.layerX;
        var y = typeof e.offsetY != 'undefined' ? e.offsetY : e.layerY;
        tool.mouseUp(x, y);
    }, false);

    self.canvas.addEventListener('touchend', function (e) {
        if (e.changedTouches.length == 0) {
            return false;
        }

        var rect = e.target.getBoundingClientRect();
        var x = e.changedTouches[0].clientX - rect.left;
        var y = e.changedTouches[0].clientY - rect.top;

        tool.mouseUp(x, y);
    }, false);

    self.canvas.addEventListener('mouseover', function (e) {
        var scroll = $(document).scrollTop();
        canvas.focus();
        $(document).scrollTop(scroll);
    }, false);

    self.canvas.addEventListener('mouseleave', function (e) {
        var x = typeof e.offsetX != 'undefined' ? e.offsetX : e.layerX;
        var y = typeof e.offsetY != 'undefined' ? e.offsetY : e.layerY;
        tool.mouseUp(x, y);
        canvas.blur();
    }, false);

    self.canvas.addEventListener("keydown", function (e) {
        var code = e.which || e.keyCode;
        if (code == 16) {
            if (typeof tool.flip == 'function') {
                tool.flip();
            }
            if (typeof tool.setSpanAxis == 'function') {
                tool.setSpanAxis(true);
            }
        }
    }, false);

    self.canvas.addEventListener("keyup", function (e) {
        var code = e.which || e.keyCode;
        if (code == 16) {
            if (typeof tool.setSpanAxis == 'function') {
                tool.setSpanAxis(false);
            }
        }
    }, false);

    self.canvas.addEventListener("keypress", function (e) {
        if (typeof tool.rotate == 'function') {
            var character = String.fromCharCode(e.which || e.keyCode);
            if (character == 'q') {
                tool.rotate(-90);
            }
            if (character == 'w') {
                tool.rotate(90);
            }
        }
    }, false);



    $("#drawing_area .pagination ul .add_page").click(function () {
        console.log("Yay?");
        if (self.pages.length >= 5) {
            alert("Cannot create more than 5 pages.");
            return false;
        }

        addPage();
        self.goToPage(self.pages.length);
    });

    $("#drawing_area .pagination ul .remove_page").click(function () {
        if (self.pages.length == 1) {
            alert("Cannot delete the last remaining page.");
            return false;
        }

        if (confirm("Are you sure that you want to delete page " + (self.currentPageIndex + 1) + "?")) {
            removePage(self.currentPageIndex + 1);
        }
    });

    $("#drawing_area").on("click", ".pagination .page", function () {
        var pageNumber = $(this).text();
        self.goToPage(pageNumber);
    });

    $("#drawing_area .clear_tool").click(function () {
        resetCursor();

        if (confirm("Are you sure that you want to clear the drawing?")) {

            $("#drawing_area .heatpump_tool").each(function () {
                $(this).removeClass("placed");
            });
            self.currentPage.clear();
        }

        self.onPaint();
        return false;
    });

    $("#drawing_area .snap").click(function () {
        if (typeof tool.setSpanAxis == 'function') {
            tool.setSpanAxis(!tool.getUseSnap());
            if (!tool.getUseSnap()) {
                $(this).css("background", "#eeeeee");
            } else {
                $(this).css("background", "#aaaaaa");
            }
        }
        return false;
    });

    $("#drawing_area .flip").click(function () {
        if (typeof tool.flip == 'function') {
            tool.flip();
        }
        return false;
    });

    $("#drawing_area .clockwise").click(function () {
        if (typeof tool.rotate == 'function') {
            tool.rotate(90);
        }
        return false;
    });

    $("#drawing_area .anticlockwise").click(function () {
        if (typeof tool.rotate == 'function') {
            tool.rotate(-90);
        }
        return false;
    });

    $("#drawing_area .pen_tool").click(function () {
        tool = new PenTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .eraser_tool").click(function () {
        tool = new EraserTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .line_tool").click(function () {
        tool = new LineTool(self);
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .arrow_tool").click(function () {
        tool = new ArrowTool(self);
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .rectangle_tool").click(function () {
        tool = new RectangleTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .circle_tool").click(function () {
        tool = new CircleTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#custom_label").keyup(function () {
        if ($("#custom_label").val() != "") {
            $("#custom_label").removeClass("error");
        }
    });

    $("#custom_label").keydown(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            $("#drawing_area .custom_label_tool").click();
        }
    });

    $("#drawing_area .custom_label_tool").click(function () {
        var text = $("#custom_label").val();

        if (text == '') {
            $("#custom_label").addClass("error");
            return false;
        }

        tool = new CustomLabelTool(self, text);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .door_tool").click(function () {
        tool = new DoorTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .window_tool").click(function () {
        tool = new WindowTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .stair_tool").click(function () {
        tool = new StairTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .gas_meter_tool").click(function () {
        tool = new IconTool(self, "Images/icon_gas_meter.png" + "?v=" + new Date().getTime());
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .switchboard_location_tool").click(function () {
        tool = new SwitchboardLocationTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .return_grill_tool").click(function () {
        tool = new IconTool(self, "Images/icon_return_grill.png" + "?v=" + new Date().getTime());
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .hazard_tool").click(function () {
        tool = new IconTool(self, "Images/icon_hazard.png" + "?v=" + new Date().getTime());
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .other_service_tool").click(function () {
        tool = new IconTool(self, "Images/icon_other_service.png" + "?v=" + new Date().getTime());
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .hrv_outlet_tool").click(function () {
        tool = new HRVOutletTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .control_panel_tool").click(function () {
        tool = new ControlPanelTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .manhole_tool").click(function () {
        tool = new ManholeTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .summer_kit_intake_tool").click(function () {
        tool = new SummerKitIntakeTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .egg_crate_grill_tool").click(function () {
        tool = new EggCrateGrillTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .louvered_grill_tool").click(function () {
        tool = new LouveredGrillTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .vortex_kit_tool").click(function () {
        tool = new VortexKitTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .venting_tool").click(function () {
        tool = new VentingTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .ht_stand_alone_tool").click(function () {
        tool = new HTStandAloneTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .ht_intake_diff_tool").click(function () {
        tool = new HTIntakeDiffTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .ht_outlet_tool").click(function () {
        tool = new HTOutletTool(self);
        tool.previewPaint();
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });



    $("#drawing_area .background_move_tool").click(function () {
        tool = new BackgroundMoveTool(self);
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .background_rotate_tool").click(function () {
        tool = new BackgroundRotateTool(self);
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .background_scale_tool").click(function () {
        tool = new BackgroundScaleTool(self);
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .background_eraser_tool").click(function () {
        tool = new BackgroundEraserTool(self);
        updateUseSnap();
        self.onPaint();
        resetCursor();
        return false;
    });

    $("#drawing_area .background_clear_tool").click(function () {
        resetCursor();

        if (confirm("Are you sure that you want to clear the background?")) {
            self.currentPage.clearBackground();
        }

        self.onPaint();
        return false;
    });

    $("#drawing_area .background_reset_tool").click(function () {
        resetCursor();
        if (confirm("Are you sure that you want to reset the background?")) {
            self.currentPage.resetBackground();
        }

        self.onPaint();
        return false;
    });

    $('#drawing_area .use_snap').change(function () {
        updateUseSnap();
    });

    function updateUseSnap() {
        if (typeof tool.setSnap == 'function') {
            if ($("#drawing_area .use_snap").is(":checked")) {
                tool.setSnap(true);
            }
            else {
                tool.setSnap(false);
            }
        }
    }

    function resetCursor() {
        $('#drawing_area canvas.drawing').css('cursor', 'crosshair');
        $('#drawing_area .snap').css("background", "#eeeeee");

        if (tool != undefined && typeof tool.flip == 'function') {
            $("#flip").css("opacity", "1");
        } else {
            $("#flip").css("opacity", "0.4");
        }
        if (tool != undefined && typeof tool.setSpanAxis == 'function') {
            $("#snap").css("opacity", "1");
            tool.setSpanAxis(false);
        } else {
            $("#snap").css("opacity", "0.4");
        }
        if (tool != undefined && typeof tool.rotate == 'function') {
            $("#rotateL").css("opacity", "1");
            $("#rotateR").css("opacity", "1");
        } else {
            $("#rotateR").css("opacity", "0.4");
            $("#rotateL").css("opacity", "0.4");
        }
    }


    $("#drawing_area .colour").click(function () {

        if (typeof tool.setColour == 'function') {
            var colour = $(this).css("background-color");
            tool.setColour(colour);
        }

        return false;
    });

    $("#drawing_area .background_image_file").change(function () {

        if (typeof window.FileReader !== 'function') {
            var error = "The file API isn't supported on this browser yet.";
            alert(error);
            addErrorLog(error, window.location.href, 'DrawingArea - File upload');
            return;
        }

        var fileInput = $(this).get(0);

        if (!fileInput.files) {
            var error = "This browser doesn't seem to support the `files` property of file inputs.";
            alert(error);
            addErrorLog(error, window.location.href, 'DrawingArea - File upload');
            return;
        }

        if (fileInput.files.length > 0) {
            self.currentPage.loadBackground(fileInput.files[0]);
        }

        $(this).val("");

    });


}
