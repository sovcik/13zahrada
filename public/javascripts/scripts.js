/**
 * Created by Jozef on 13.04.2017.
 */

function initAdmin(){
    console.log("/admin - Initializing");
    $("#createReport").on(
        "click",
        function () {
            var rptDate = $("#reportDate");
            var rptPIN = $("#reportPin");
            if (rptDate.val().trim() != '' && rptPIN.val().trim() != '') {
                console.log("Requesting PIN report");
                $.post("/admin", {cmd: 'createReport', pin:rptPIN.val(), pinDate:rptDate.val()}, function (res) {
                    console.log(JSON.stringify(res));
                    if (res.result == "ok"){
                        console.log("Report received");
                        $("#pinReport").empty();
                        //var rpt = JSON.stringify(res.report);
                        //console.log(rpt);
                        $("#pinReport").html(res.report);
                    }
                })
                .fail(function () {
                    console.log("Report failed");
                });

            }
        }
    );
    $("#saveHints").on(
        "click",
        function () {
            var selHintsText = $("#newHintsText");
            var selStatus = $("#saveHintsStatus");
            if (selHintsText.val().trim() != '') {
                console.log("Posting new hints to server ");
                $.post("/admin", {cmd: 'saveHints', hints: selHintsText.val()}, function (res) {
                    selStatus.text('Uložené.');
                    selStatus.css("display", "inline").fadeOut(2000);
                    console.log("Saved");
                })
                .fail(function () {
                    selStatus.text('Nepodarilo sa uložiť.');
                    console.log("Save failed");
                });
            } else {
                selStatus.text('Nie je čo uložiť.');
                selStatus.css("display", "inline").fadeOut(2000);
            }
        }
    );

    $("#saveNewPin").on(
        "click",
        function () {
            var selStatus = $("#addPinStatus");
            var selText = $("#newPin");
            if (selText.val().trim() != '') {
                console.log("Posting new PIN to server ");
                $.post("/admin", {cmd: 'addPin', pin: selText.val()}, function (res) {
                    if (res.result == 'ok') {
                        selStatus.text('Uložené.');
                        selStatus.css("display", "inline").fadeOut(2000);
                        console.log("Saved");
                        selText.val('');
                        loadPINs();
                    } else {
                        selStatus.text('Chyba. Skontrolujte, či rovnaký PIN ešte nie je aktívny');
                    }
                })
            } else {
                selStatus.text('Nie je čo uložiť.');
                selStatus.css("display", "inline").fadeOut(2000);
            }
        }
    );

    loadPINs();

    console.log("/admin - Initializing completed");
}

function loadPINs(){
    // --- LOAD ACTIVE PINs
    console.log("Loading active PINs");
    var selPINs = $("#active-pins");
    selPINs.empty();
    $.post( "/admin", {cmd: 'getActivePins'}, function(res) {
        if (res.result === 'ok'){
            selPINs.empty();
            if (res.pins.length > 0) {
                res.pins.forEach(function(pin) {
                    var tr = $('<div class="row pinRow">');
                    //var td = $('<td class="pinRow">');

                    // --- pin
                    var c = $('<div class="pinItem col-sm-3" >').text(pin.pin);
                    tr.append(c);

                    // --- created on
                    var d = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
                    if (pin.createdOn)
                        d = "C="+new Date(pin.createdOn).toLocaleDateString()+" "+new Date(pin.createdOn).toLocaleTimeString();
                    c = $('<div class="pinItem col-sm-4" >').html(d);
                    tr.append(c);

                    // --- expires
                    d = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
                    if (pin.expired)
                        d = "X="+new Date(pin.expired).toLocaleDateString()+" "+new Date(pin.expired).toLocaleTimeString();
                    c = $('<div class="pinItem col-sm-4" >').html(d);
                    tr.append(c);


                    // --- icon delete
                    c = $('<div class="pinItem col-sm-1" >');
                    c.append($('<a href="">').append($('<img src="https://sites.google.com/site/recgtasks/images/icon-delete-20px-grey.png" alt="del" class="inline-icon icon-delete" id="pinDel-'+pin._id+'" >')));

                    tr.append(c);

                    //tr.append(td);
                    selPINs.append(tr);

                    $("#pinDel-"+pin._id).on("click",{pinid:pin._id},deletePin);
                });
            } else {
                selPINs.text('Žiadne PINy nie sú aktívne');
            }
        }

    });

}

function deletePin(event){
    console.log("Removing PIN from server. id="+event.data.pinid);
    $.post("/admin", {cmd: 'removePin', pinid: event.data.pinid}, function (res) {
        if (res.result === 'ok') {
            console.log("Removed");
        } else {
            console.log("Failed to remove");
        }
    })

}


function loadTitles(){
    console.log("Loading hint-titles");
    var titles;
    $.post("/hints", {cmd:'loadTitles'},
        function (res) {
            console.log(JSON.stringify(res));
            if (res.result == null || res.result == "error")
                console.log("No hint titles loaded");
            else {
                console.log("Hint titles loaded "+res.titles.count);
                //$("#hints-page").empty();
                for (var i=0;i<res.titles.length;i++){
                    var id=res.titles[i]._id;
                    var onClick="loadHint('1','"+id+"','L"+id+"0');";
                    console.log(onClick);
                    $("#hints-page").append('<div id="L'+id+'0" class="hint hintL0 row col-sm-12" onclick="'+onClick+'"> <h3>'+res.titles[i].title+'</h3></div>');
                }
            }
            console.log("Loaded");
        })
        .fail(function () {
            console.log("Loading failed");
        });

}

function loadHint(level,id,sender){
    "use strict";
    console.log("Loading L"+level+" for id="+id+" sender="+sender);
    $.post("/hints", {cmd:'loadHint', level:level, id:id},
        function (res) {
            //var text="L"+level+" "+id;
            if (res.result == null || res.result == "error")
                console.log("No hint found");
            else {
                if (res.hint.trim() == "."){
                    console.log("Empty hint found - ignoring");
                    return;
                }
                var text = res.hint;
                var levNo = parseInt(level);
                var onClick = '';
                if (levNo < 2) {
                    onClick = "loadHint('" + (levNo + 1) + "','" + id + "','L" +id + level + "');";
                }

                var urlExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
                var url=urlExp.exec(text);
                if (url) {
                    console.log("Hint contains URL - assuming image");
                    text=text.replace(urlExp,'<img src="'+url[0]+'" class="img-responsive" alt="Image hint '+id+level+'">');
                }

                var elm = '<div id="L' + id + level + '" class="row col-sm-12 hint hintL' + level + '" onclick="' + onClick + '"><h5>' + text + '</h5></div>';

                console.log(elm);
                //$("#L"+(level-1)+id).append('<div id=L'+level+id+' class="hint hintL'+level+'" onclick="'+onClick+'">'+text+'</div>');

                $("#" + sender).append(elm);
                // show next hint
                //$("#" + sender).append(elm);
                // disable click for already clicked hints
                $("#" + sender).prop('onclick', '');
            }
        })
        .fail(function () {
            console.log("Loading hint failed");
        });

}

function initLogin() {
    console.log("/login - Initializing");
    $("#doLogin").on(
        "click",
        function () {
            var selStatus = $("#loginStatus");
            if ($("#pin").val().trim() != '') {
                console.log("Trying to log in");
                $.post("/login", {pin: $("#pin").val()}, function (res) {
                    if (res.result != null && res.result == "error") {
                        selStatus.text('Nesprávny PIN.');
                        selStatus.css("display", "inline").fadeOut(2000);
                        console.log("Login failed");
                    } else {
                        if (res.result == "ok") {
                            console.log("Login OK, opening hints");
                            window.location.href = '/hints';
                        }
                    }
                })
            } else {
                selStatus.text('Zadajte PIN.');
                selStatus.css("display", "inline").fadeOut(2000);
            }
        }
    );
}