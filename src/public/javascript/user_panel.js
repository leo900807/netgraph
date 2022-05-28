$(document).ready(() => {
    $.ajaxSetup({
        headers: {
            "csrf-token": $('meta[name="csrf-token"]').attr("content")
        }
    });
});

function send_message() {
    $.ajax({
        url: "/user/change",
        type: "post",
        success: () => {
            $("#send_mail_button").prop("disabled", true);
            $("#send_message").html("Email sent successfully!");
        }
    });
}
