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
            $.post("/settings", {hints:$("#newHintsText").val()}, function () {
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

