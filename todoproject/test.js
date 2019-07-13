var myDb = new Database();

$(document).ready(function() {
    myDb.init();
    myDb.initiateTables();

    $("form[name=login_form]").slideDown(750);
    $("form[name=login_form]").submit(function(e) {
        e.preventDefault()
        var form = this;
        var formData = $(form).serializeArray();
        var formDataFormatted = {};
        for(var i = 0; i < formData.length; i++) {
            formDataFormatted[formData[i].name] = formData[i].value;
        }
        myDb.verify(formDataFormatted.username, formDataFormatted.password).then(
                function(data) {
                    if(formDataFormatted.username == '' || formDataFormatted.password == '') {
                        $(".form-group").addClass("has-error");
                    }
                    else if(data.length == 0) {
                        $(".invalid-credintials").show("fold", 750);
                    }
                    else {
                        fetchTodos(data);

                    }
                }, function(err) {
                    console.log(err);
                }

                );
    });

    $(".hide-invalid").click(function(e) {
       $(".invalid-credintials").slideUp(750);
    });

    function fetchTodos(data) {
        $(".main-window").fadeOut(800, function() {
            $(this).empty();
            sessionStorage.userId = data[0].recordId;
            myDb.fetchTodos(sessionStorage.userId).then(function(data) {
                todoBody = "<div class='container'><div class='row'>";
                todoBody += "<div class='col-md-12'><div class='col-md-6 incomplete'><div class='panel panel-warning'><div class='panel-heading'><strong>Hurry up!</strong> You have to complete all these todos</div></div></div>";
                todoBody += "<div class='col-md-6 complete'><div class='panel panel-success'><div class='panel-heading'><strong>Well done!</strong> You successfully completed all these todo items</div></div></div></div></div></div>";
                $(".main-window").html(todoBody);
                for(var i = 0; i < data.length; i++) {
                    var panel = "warning";
                    if(data[i]['status'] == "complete")
                        panel = "success";
                    console.log(data[i]);
                    $("." + data[i]['status']).append("<div draggable='true' style='display: none;' id = 'row-" + data[i]['recordId'] + "' class='row element-" + data[i]['status'] + "'><div class='col-md-12'><div class='panel panel-" + panel + "'><div class='panel-heading'><h4><strong>Title</strong>: " + data[i]['title'] + "</h4><h5><strong>Description</strong>: " + data[i]['description'] + "</h5><a data-record_id='" + data[i]['recordId'] + "' class='btn btn-default details'><strong>details</strong></a></div></div></div></div>")
                }
                $(".main-window").show("bounce", 400, function() {
                    $(".element-complete").show("drop", 600, function() {
                        $(".element-incomplete").show("drop", 600);
                    });
                });
            }, function(err) {
                console.log(err);
            });
        });
    }
    $("form[name=login_form] .form-group").keypress(function() {
        $("form[name=login_form] .form-group").removeClass("has-error")
    });

    $(document).on("click", ".details", function(e) {
        $(".main-window").hide("bounce", 750, function() {
            var element = $(this).find($(e.target).attr("data-record_id")).clone();
            console.log("element", element);
            var details = $(this).find("row-" + $(e.target).attr("data-record_id"));
            console.log(details);
            $(this).empty();
            //$(this).append("<div class='container'><div class='row'><div class='col-md-12'></div></div></div>");
        })
    });
});
