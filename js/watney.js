var up = false;
var down = false;
var left = false;
var right = false;
var lookUp = false;
var lookDown = false;

var lastBearing = -1;
var lastLook = 0;

function sendKeys() {
    var bearing = "0";
    var look = 0

    if (up) {
        if (left) {
            bearing = "nw";
        }
        else if (right) {
            bearing = "ne";
        }
        else {
            bearing = "n";
        }
    }
    else if (down) {
        if (left) {
            bearing = "sw";
        }
        else if (right) {
            bearing = "se";
        }
        else {
            bearing = "s";
        }
    }
    else if (left) {
        bearing = "w";
    }
    else if (right) {
        bearing = "e";
    }

    if (lookUp) {
        look = 1;
    }
    else if (lookDown) {
        look = -1;
    }

    if (lastBearing != bearing || lastLook != look) {
        lastBearing = bearing;
        lastLook = look;
        var commandObj = {
            'bearing': bearing,
            'look': look
        };

        $.ajax({
            url: '/sendCommand',
            type: "POST",
            data: JSON.stringify(commandObj),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    }


}

$(document).ready(function () {
    $(document).keydown(function (event) {
        if (!$("#ttsSection").is(":visible")) {
            event.preventDefault();

            if (event.keyCode == 83) {
                $("#ttsSection").fadeIn(200);
                $("#ttsInput").focus();
                up = false;
                down = false;
                left = false;
                right = false;
                lookUp = false;
                lookDown = false;
                sendKeys();
                return;
            }

            if (event.keyCode == 38) {
                up = true;
            }
            else if (event.keyCode == 40) {
                down = true;
            }
            else if (event.keyCode == 37) {
                left = true;
            }
            else if (event.keyCode == 39) {
                right = true;
            }
            else if (event.keyCode == 65) {
                lookDown = true;
            }
            else if (event.keyCode == 90) {
                lookUp = true;
            }

            sendKeys();
        }
    });

    $(document).keyup(function (event) {
        if (!$("#ttsSection").is(":visible")) {
            event.preventDefault();

            if (event.keyCode == 38) {
                up = false;
            }
            else if (event.keyCode == 40) {
                down = false;
            }
            else if (event.keyCode == 37) {
                left = false;
            }
            else if (event.keyCode == 39) {
                right = false;
            }
            else if (event.keyCode == 65) {
                lookDown = false;
            }
            else if (event.keyCode == 90) {
                lookUp = false;
            }

            sendKeys();
        }
    });

    $("#powerButton").click(function (event) {
        $("#shutdown-confirm").dialog({
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
                "Shut Down": function () {
                    $(this).dialog("close");
                    $.ajax({
                        url: '/shutDown',
                        type: "POST"
                    });
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
    });

    $("#infoButton").click(function (event) {
        if ($("#info").is(":visible")) {
            $("#info").fadeOut(200);
        }
        else {
            $("#info").fadeIn(200);
        }
    });

    $("#infoButton").mouseleave(function (event) {
        $("#info").fadeOut(200);
    });

    $("#ttsButton").click(function (event) {
        if ($("#ttsSection").is(":visible")) {
            $("#ttsSection").fadeOut(200);
        }
        else {
            $("#ttsSection").fadeIn(200);
            $("#ttsInput").focus();
        }
    });
 
    $("#ttsInput").keydown(function (event) {
        if (event.keyCode == 27) {
            //escape
            event.preventDefault();
            $("#ttsInput").val("");
            $("#ttsSection").fadeOut(200);
        }
        else if (event.keyCode == 13) {
            //enter
            event.preventDefault();
            $("#ttsSection").animate({
                bottom: '80vh',
                opacity: '0'
            }, 200, function() {
                $("#ttsSection").hide();
                $("#ttsSection").css("bottom", "200px");
                $("#ttsSection").css("opacity", "1");
            });
            sendTTS($("#ttsInput").val());
        }
    });

    $("#ttsInput").blur(function (event) {
        $("#ttsInput").val("");
        $("#ttsSection").fadeOut(200);
    });

    doHeartbeat();

    doConnect();
});

function doHeartbeat() {
    $.ajax({
        url: '/heartbeat',
        type: "POST",
        dataType: "json"
    }).done(function (data) {
        $("#wifi_ssid").text(data.SSID);
        $("#wifi_quality").text(data.Quality);
        $("#wifi_signal").text(data.Signal);
    }).always(function () {
        setTimeout(doHeartbeat, 1000);
    });
}

function sendTTS(str) {
    $.ajax({
        url: '/sendTTS',
        type: "POST",
        data: JSON.stringify({str}),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });
}