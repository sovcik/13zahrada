/**
 * Created by Jozef on 13.04.2017.
 */

function initAdmin(){
    console.log("/admin - Initializing");
    console.log($("#saveHints"));
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


    console.log("/admin - Initializing completed");
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
