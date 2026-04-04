// Legacy mapping array globally defined so legacy functions can use them natively
window.drawingArea = null;
window.currentQuoteId = "";
window.currentAddress = "";
window.currentGuid = "";
window.sampleHeatpumps = [];

window.initDrawingArea = function (quoteId, address, guid, s1, s2, d1, d2) {
    console.log("Initializing React Legacy Drawing Mode");
    
    window.currentQuoteId = quoteId || '';
    window.currentAddress = address || '';
    window.currentGuid = guid || '';

    var isD1Ducted = (d1 && d1.toLowerCase() === 'true');
    var isD2Ducted = (d2 && d2.toLowerCase() === 'true');

    if (s1) {
        window.sampleHeatpumps.push({ model: s1, isDucted: isD1Ducted });
    }
    if (s2) {
        window.sampleHeatpumps.push({ model: s2, isDucted: isD2Ducted });
    }

    if (window.currentQuoteId) {
        $('#displayQuoteId').text("Quote: " + window.currentQuoteId);
        document.title = window.currentQuoteId + " - Drawing Tool";
    }
    if (window.currentAddress) {
        $('#displayAddress').text(window.currentAddress);
    }

    // Give it a short delay to ensure DOM layout has painted properly
    setTimeout(function() {
        var size = getDrawingAreaSize();
        window.drawingArea = new DrawingArea(size, size);
        window.drawingArea.setHeatpumpTools(window.sampleHeatpumps);
    }, 100);
};

function getDrawingAreaSize() {
    var drawing_area = $('#drawing_area');
    var tool_panel = $('#drawing_area .tool_panel');
    return drawing_area.width() - (tool_panel.width() + parseInt(tool_panel.css("margin-right") || "0")) - 2;
}

window.saveLocalSession = function() {
    if (!window.drawingArea) return;

    var jsonData = window.drawingArea.getData();
    var blob = new Blob([jsonData], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    var filename = "DrawingSession_" + new Date().toISOString().replace(/[:.]/g, '-') + ".json";
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
};

window.loadLocalSession = function(event) {
    if (!window.drawingArea) return;

    var file = event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var data = JSON.parse(e.target.result);
            window.drawingArea.loadDrawing(data);
            window.drawingArea.allHeatpumpsPlaced(false);
        } catch (err) {
            console.error(err);
            alert("Error parsing the session file. Make sure it is a valid session JSON file.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
};

window.submitWebhook = function() {
    if (!window.drawingArea) return;

    if (window.location.protocol === 'file:') {
        alert("Warning: The Submit function and Session JSON generation works best when hosted on a web server to avoid tainted canvas errors. Proceeding with dummy webhook...");
    }

    var submitButton = document.querySelector('a[onclick="submitWebhook()"]');
    var originalText = submitButton.innerText;
    submitButton.innerText = "Submitting...";
    submitButton.style.opacity = "0.7";
    submitButton.style.pointerEvents = "none";

    var jsonData = window.drawingArea.getData();
    var sessionDataObj = JSON.parse(jsonData);
    var pageImages = (sessionDataObj.pages || []).map(function (page) {
        return page.printImageData;
    });

    var payload = {
        guid: window.currentGuid,
        quoteId: window.currentQuoteId,
        address: window.currentAddress,
        sessionData: jsonData,
        images: pageImages
    };

    console.log("Submitting payload to webhook:", payload);

    fetch('https://294fdf4ded0de6fab36907ba15cb8c.c6.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/72016d4ef24b429a87d82794bc14696c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xbTYv30phxU_cmA6bCVhIew6gk2XC8OT7H5C9az-Y_Y', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text().then(text => text ? JSON.parse(text) : {});
    })
    .then(data => {
        console.log('Success:', data);
        alert('Successfully submitted drawing for quote: ' + (window.currentQuoteId || 'Unknown'));
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred during submission. Check the console for details.');
    })
    .finally(() => {
        submitButton.innerText = originalText;
        submitButton.style.opacity = "1";
        submitButton.style.pointerEvents = "auto";
    });
};

window.exportToImage = function() {
    if (!window.drawingArea) return;

    if (window.location.protocol === 'file:') {
        alert("Warning: The Export Image function works best when hosted on a web server to avoid tainted canvas errors.");
    }

    try {
        var sessionData = JSON.parse(window.drawingArea.getData());
        var currentPageIndex = window.drawingArea.currentPageIndex || 0;
        var imageData = sessionData.pages[currentPageIndex].printImageData;

        if (!imageData) {
            alert("Could not generate image data. The canvas might be tainted.");
            return;
        }

        var a = document.createElement('a');
        a.href = imageData;
        var dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        var fileNamePrefix = window.currentQuoteId ? window.currentQuoteId : "Drawing";
        a.download = fileNamePrefix + "_" + dateStr + ".png";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { document.body.removeChild(a); }, 0);
    } catch (err) {
        console.error("Export Image error:", err);
        alert("Failed to export image. Check console for details.");
    }
};

window.saveToTablet = function() {
    if (!window.drawingArea) return;

    try {
        var sessionData = JSON.parse(window.drawingArea.getData());
        var currentPageIndex = window.drawingArea.currentPageIndex || 0;
        var pngDataUrl = sessionData.pages[currentPageIndex].printImageData;

        if (!pngDataUrl) {
            alert("Could not generate image data. The canvas might be tainted.");
            return;
        }

        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            var overlay = document.createElement("div");
            overlay.style.position = "fixed";
            overlay.style.top = "0"; overlay.style.left = "0"; 
            overlay.style.width = "100%"; overlay.style.height = "100%";
            overlay.style.backgroundColor = "rgba(0,0,0,0.9)"; 
            overlay.style.zIndex = "9999"; 
            overlay.style.display = "flex"; 
            overlay.style.flexDirection = "column"; 
            overlay.style.alignItems = "center"; 
            overlay.style.justifyContent = "center";
            overlay.style.padding = "20px"; 
            overlay.style.boxSizing = "border-box";
            
            var msg = document.createElement("h3");
            msg.innerText = "Long-press the image below and select 'Save to Photos'";
            msg.style.color = "white"; 
            msg.style.marginBottom = "20px"; 
            msg.style.fontFamily = "sans-serif"; 
            msg.style.textAlign = "center";
            
            var imgDisp = document.createElement("img");
            imgDisp.src = canvas.toDataURL('image/jpeg', 0.9);
            imgDisp.style.maxWidth = "100%"; 
            imgDisp.style.maxHeight = "70vh"; 
            imgDisp.style.border = "2px solid white"; 
            imgDisp.style.objectFit = "contain";
            
            var closeBtn = document.createElement("button");
            closeBtn.innerText = "Close";
            closeBtn.style.padding = "10px 20px"; 
            closeBtn.style.marginTop = "20px"; 
            closeBtn.style.fontSize = "16px"; 
            closeBtn.style.cursor = "pointer";
            closeBtn.onclick = function() { document.body.removeChild(overlay); };
            
            overlay.appendChild(msg); 
            overlay.appendChild(imgDisp); 
            overlay.appendChild(closeBtn);
            document.body.appendChild(overlay);
        };
        img.src = pngDataUrl;
    } catch (err) {
        console.error("Save to tablet error:", err);
        alert("Failed to create tablet image. Check console for details.");
    }
};
