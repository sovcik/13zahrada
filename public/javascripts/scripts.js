/**
 * Created by Jozef on 13.04.2017.
 */

function initAdmin(){
    console.log("/admin - Initializing");
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
                    if (res.result === 'ok') {
                        selStatus.text('Uložené.');
                        selStatus.css("display", "inline").fadeOut(2000);
                        console.log("Saved");
                    } else {
                        selStatus.text('Chyba. Skontrolujte, či rovnaký PIN ešte nie je aktívny');
                    }
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

    // --- LOAD ACTIVE PINs
    console.log("Loading active PINs");
    var selPINs = $("#active-pins");
    selPINs.empty();
    $.post( "/admin", {cmd: 'getActivePins'}, function(res) {
        if (res.result === 'ok'){
            selPINs.empty();
            if (res.pins.length > 0) {
                res.pins.forEach(function(pin) {
                    var tr = $('<tr>');
                    var td = $('<td class="pinRow">');

                    // --- pin
                    var c = $('<div class="pinItem" style="width:50%">').text(pin.pin);
                    td.append(c);

                    // --- created on
                    var d = '';
                    if (pin.createdOn)
                        d = new Date(pin.createdOn).toLocaleDateString();
                    c = $('<div class="pinItem" style="width:45%">').text(d);
                    td.append(c);

                    // --- icon delete
                    c = $('<div class="pinItem" style="width:5%">');
                    c.append($('<a href="">').append($('<img src="https://sites.google.com/site/recgtasks/images/icon-delete-20px-grey.png" alt="del" class="inline-icon icon-delete" id="pinDel-'+pin._id+'" >')));

                    td.append(c);

                    tr.append(td);
                    selPINs.append(tr);

                    $("#pinDel-"+pin._id).on("click",{pinid:pin._id},deletePin);
                });
            } else {
                selPINs.text('Žiadne PINy nie sú aktívne');
            }
        }

    });

    console.log("/admin - Initializing completed");
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
                    var onClick="loadHint('1','"+id+"','L0"+id+"');";
                    console.log(onClick);
                    $("#hints-page").append('<div id="L0'+id+'" class="hint hintL0" onclick="'+onClick+'">'+res.titles[i].title+'</div>');
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
                if (res.hint.trim() == ""){
                    console.log("Empty hint found - ignoring");
                    return;
                }
                var text = res.hint;
                var levNo = parseInt(level);
                var onClick = '';
                if (levNo < 2) {
                    onClick = "loadHint('" + (levNo + 1) + "','" + id + "','L" + level + id + "');";
                }
                var elm = '<div id="L' + level + id + '" class="hint hintL' + level + '" onclick="' + onClick + '">' + text + '</div>';
                console.log(elm);
                //$("#L"+(level-1)+id).append('<div id=L'+level+id+' class="hint hintL'+level+'" onclick="'+onClick+'">'+text+'</div>');

                // show next hint
                $("#" + sender).append(elm);
                // disable click for already clicked hints
                $("#" + sender).prop('onclick', '');
            }
        })
        .fail(function () {
            console.log("Loading hint failed");
        });

}
