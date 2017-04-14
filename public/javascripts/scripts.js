/**
 * Created by Jozef on 13.04.2017.
 */

function initEditHints(){
    console.log("Initializing EditHints");
    console.log($("#saveHints"));
    $("#saveHints").on(
        "click",
        function () {
            console.log("Posting new hints to server ");
            $.post("/settings", {cmd:'saveHints', hints:$("#newHintsText").val()}, function (res) {
                $("#saveHintsStatus").text('Uložené.');
                console.log("Saved");
                })
                .fail(function () {
                    $("#saveHintsStatus").text('Nepodarilo sa uložiť.');
                    console.log("Save failed");
                });
        }
    );
    console.log("Initializing EditHints - completed");
}

function loadTitles(){
    console.log("Loading hint-titles");
    var titles;
    $.post("/", {cmd:'loadTitles'},
        function (res) {
            console.log(JSON.stringify(res));
            if (res.result == null || res.result == "error")
                console.log("No hint titles loaded");
            else {
                console.log("Hint titles loaded "+res.titles.count);
                $("#hints").empty();
                for (var i=0;i<res.titles.length;i++){
                    $("#hints").append('<option value="'+res.titles[i]._id+'">'+res.titles[i].title+'</option>');
                }
            }
            console.log("Loaded");
        })
        .fail(function () {
            console.log("Loading failed");
        });

}
