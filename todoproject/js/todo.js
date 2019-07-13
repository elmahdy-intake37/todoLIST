var db = openDatabase("Todos", '1.0', 'Todos database', 0.1 * 1024 * 1024);
var counter=0;
// code of drag and drop
var obj={
  username:"ahmed",
  password:"1234",

}
function crawlDom(elem) {
    if($(elem).hasClass("complete")) {
        return $(".complete");
    }
    else if($(elem).hasClass("incomplete")) {
        return $(".incomplete");
    }
    else {
        return crawlDom($(elem).parent());
    }
}

function drag(e) {
    e.dataTransfer.setData("row_id", e.target.id);
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    var opposite = {
        "complete": "incomplete",
        "incomplete": "complete"
    };

    var panelOpposite = {
        "success": "warning",
        "warning": "success"
    };
    var id = e.dataTransfer.getData("row_id");
    var recordid = $("#" + id).attr("recordid");
    var status = $("#" + id).attr("data-status");
    var parent = crawlDom(e.target);
    console.log(id, status);
    console.log("parent", parent);
    if(! $(parent).hasClass(status)) {
        console.log('testing', "." + opposite[status], "." + opposite[status] + " .add-todo");
        $("#" + id).insertBefore("." + opposite[status] + " .add-todo");
        $("#" + id).attr("data-status", opposite[status]);
        toodo.switchTodo(opposite[status], recordid);
        var panel = 'success'
        var panel= 'warning'
        if(status == "incomplete"){
            panel = "warning";
        $("#" + id + " .panel").removeClass("panel-" + panel);
        $("#" + id + " .panel").addClass("panel-" + panelOpposite[panel]);
      }else  if(status == 'complete'){
        panel="success";
        $("#" + id + " .panel").removeClass("panel-" + panel);
        $("#" + id + " .panel").addClass("panel-" + panelOpposite[panel]);
        console.log(e.dataTransfer.getData("row_id"));
      }
    }
}


var toodo = {
  CreateTable:function()
  {
    db.transaction(function(tx){
      tx.executeSql("CREATE TABLE IF NOT EXISTS users (recordid INTEGER PRIMARY KEY, username, password)");

      tx.executeSql("CREATE TABLE IF NOT EXISTS TodoList (recordid INTEGER PRIMARY KEY , title , description , status, userId)");

    })
  },
  InsertTodoList:function(obj){
    console.log(obj);
    obj.id=null;
    obj.userId=1;
    db.transaction(function(tx){
      tx.executeSql("INSERT INTO users VALUES(?,?,?)",[obj.id,obj.username,obj.password]);
      tx.executeSql("INSERT INTO TodoList VALUES(?,?,?,?,?)",[obj.id,obj.title,obj.description,obj.status,obj.userId]);
        counter++;

  })
},
SelectFromUsers:function(username, password){
  console.log(username, password);
  return new Promise(function(resolve,reject){
      db.transaction(function(tx){
      tx.executeSql("SELECT * FROM users where  username = ? and password = ?",[username, password], function(tx,res){
          console.log("SELECT * FROM users where  username = ? and password = ?",[username, password]);
          if(res){
            if(!res.rows.length){
              resolve({status:"error",message:"there is no users!"})
            }else {
              resolve({status:"success",data:res.rows})
              // console.log(data);
            }
          }else{
            reject("an error has been occured")
          }

        });

      })

  });


},UpdateTodoList:function(title,description,id)
{
console.log(title);
console.log(description);
console.log(id);
      db.transaction(function(tx){
  tx.executeSql("update TodoList set title = ?, description=? where recordid = ?", [title, description, id]);
})
},
deleteTodoList:function(recordid)
{
  console.log(recordid);

      db.transaction(function(tx){
  tx.executeSql("DELETE FROM TodoList WHERE recordid=?",[recordid]);
})
},
switchTodo:function(status, id) {
        db.transaction(function(tx) {
            tx.executeSql("update TodoList set status= ? where recordid = ?", [status, parseInt(id)]);
        });
    },


getUser:function(){
if (this.currentUser) {
    return this.currentUser;
}
var storageUser = localStorage.getItem('sessionStorage.userId');
if (storageUser) {
  try {
    this.sessionStorage.userId = JSON.parse(storageUser);
  } catch (e) {userid
    localStorage.removeItem('sessionStorage.userId');
  }
}
return this.currentUser;
},

// you may also want to remove the user data from storage when he logs out
logout:function() {
localStorage.removeItem('sessionStorage.userId');
  this.currentUser = null;
},
getTodos:function(userId){
  return new Promise(function(resolve,reject){
      db.transaction(function(tx){
        tx.executeSql("SELECT * FROM TodoList where userId=  "+userId,[],function(tx,res){
          console.log("SELECT * FROM TodoList where userId= ? ",[userId]);
          if(res){
            if(!res.rows.length){
              resolve({status:"error",message:"there is no list!"})
            }else {
              resolve({status:"success",data:res.rows})
              // console.log(data);
            }
          }else{
            reject("an error has been occured")
          }

        });

      })

  });
}

}


// for jquery code
$(document).ready(function(){

  function logout()
  {
    localStorage.removeItem('user')
      // localStorage.setItem("userid",null);
      $("form[name=login_form]").slideDown(750);

  }

function check(data)
{
  if(localStorage.user){
    renderTodoList(data);
    console.log("herehossam");
    $('.logout').css("display", "inline-block");

  }
  else {
    console.log("sssssssssssszz");
    $("form[name=login_form]").slideDown(750);

  }

}
localStorage.getItem('user');
var user=JSON.parse(localStorage.getItem('user'));
// console.log(user);

if(user){
toodo.SelectFromUsers(user.username, user.password).then(
  function(data){
check(data);
})
}

$('body').on('click','.logout',function(){
//    console.log('logout')
logout();
window.location.reload();
})

$('body').on('click','.close' ,function() {
             toodo.deleteTodoList( $(this).parent().attr('recordid'));
             $(this).parent().remove()
   })




$('body').on('click','#close-button',function(){
  console.log("here");
   $(".invalid-credintials").hide();
})

$('body').on('click','#cancel-button',function(){
  console.log("here");
  $(".popup").css("display","none");

})


    $("form[name=login_form]").slideDown(750);

      $("form[name=login_form]").submit(function(e) {

e.preventDefault();

  var form = this;
  var formData= $("form").serializeArray();
  var formtodo={};
  for (var i = 0; i < formData.length; i++) {
    formtodo[formData[i].name] = formData[i].value

  }
  toodo.SelectFromUsers(formtodo.username, formtodo.password).then(
    function(data){
      console.log(data);
      if(formtodo.username == '' || formtodo.password == ''){
      $(".form-group").addClass("has-error");
      }else if (data.length == 0){
      $(".invalid-credintials").show("fold", 750);

}else if(data['status']=="error" || data['message']=="there is no list!"){
  $(".hide-invalid").hide();
  $(".invalid-credintials").show("fold", 750);
}
  else{

          console.log(data.data[0]);
  var user= data.data[0];
        user.userId=user.recordid;


        localStorage.setItem('user', JSON.stringify({user}));

        check(data);
          $('.logout').css("display", "inline-block");
        console.log(data);
    }
  },function(err) {
        console.log(err);
    }
  );
});




$(".hide-invalid").click(function(e) {
       $(".invalid-credintials").slideUp(750);
    });


function renderTodoList(data){
  // console.log(data);
  $(".main-window").fadeOut(800, function() {
  if(data['status']=="error" || data['message']=="there is no list!")
  {
      $(".hide-invalid").hide();
      $(".invalid-credintials").show("fold", 750);

  }

console.log(JSON.parse(localStorage.getItem('user')).user.userId);
  $(this).empty();
  var userid=JSON.parse(localStorage.getItem('user')).user.userId;

  toodo.getTodos(userid).then(function(data){
  todoBody = "<div class='container'><div class='row'>";
  todoBody += "<div class='col-md-12'><div ondrop='drop(event)' ondragover='allowDrop(event)'  class='col-md-6 incomplete'  ><div class='panel panel-warning'>\
              <div class='panel-heading'><h4><strong>Hurry up!</strong> You have to complete all these todos</h4></div>\
              </div><span  type='hidden' class=' add-todo data-toggle='modal' data-target='#add-new-incomplete-todo'></span>\
              <div class='modal fade' id='add-new-incomplete-todo' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>\
              <div class='modal-dialog' role='document'><div class='modal-content'><form name='new_todo' data-status='incomplete'>\
              <div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
              <span aria-hidden='true'>&times;</span></button><h4 class='modal-title' id='modalTitle'>Modal title</h4></div>\
              <div class='modal-body'><div class='form-group'><label>Title</label><input name='title' type='text' class='form-control' />\
              </div><div class='form-group'><label>Description</label><input name='description' type='text' class='form-control' />\
              </div></div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>\
              <input type='submit' class='btn btn-primary'value='Add New' /></div></div></form></div></div></div>";
  todoBody += "<div  ondrop='drop(event)' ondragover='allowDrop(event)' class='col-md-6 complete ' ><div class='panel panel-success'><div class='panel-heading'><h4>\
              <strong>Well done!</strong> You successfully completed all these todo items</h4></div></div>\
              <span style='display: none;' class='add-todo' data-toggle='modal' data-target='#add-new-complete-todo'></span>\
              <div class='modal fade' id='add-new-complete-todo' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>\
              <div class='modal-dialog' role='document'><div class='modal-content'><form name='new_todo' data-status='complete'>\
              <div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
              <span aria-hidden='true'>&times;</span></button><h4 class='modal-title' id='modalTitle'>Modal title</h4>\
              </div><div class='modal-body'><div class='form-group'><label>Title</label>\
              <input name='title' type='text' class='form-control' /></div><div class='form-group'>\
              <label>Description</label><input name='description' type='text' class='form-control' /></div>\
              </div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Close</button><input type='submit'  class='btn btn-primary'value='Add New' /></div></div></form></div></div></div></div></div>";
  todoBody+= "<div class='col-md-6'><button type='button' id='Add' class='btn btn-primary'>Add</button></div>"

             $(".main-window").html(todoBody);

                console.log(data);
  for(var i = 0; data.status!='error'&& i < data.data.length; i++){

      var panel= "warning";
    console.log(data.data[i]['status']);
    if(data.data[i]['status'] === "complete")
    {
      console.log(data.data[i]['status']);
      panel= "success";

      $("<div  draggable='true' recordid='" + data.data[i]['recordid'] + "'  data-status='"
      + data.data[i]['status'] + "' style='display: none;' id = 'row-" + data.data[i]['recordid'] +
       "' class='row element-" + data.data[i]['status'] + "'  ondragstart='drag(event)'>\
      <div class='col-md-12'><div class='panel panel-" + panel + "'><div class='panel-heading'>\
      <div id='public-todo-" + data.data[i]['recordid'] + "'>\
      <a class='delete' recordid='" + data.data[i]['recordid'] + "' id='delete"+ data.data[i]['recordid']+ "'>\
      <span class='glyphicon glyphicon-remove pull-right text-danger'></span></a><h4 class='title'>\
      <strong>Title</strong>: " + data.data[i]['title'] + "</h4><h5 class='description'>\
      <strong>Description</strong>: " + data.data[i]['description'] + "</h5>\
      <button recordid='" + data.data[i]['recordid'] + "' class='btn btn-default details' data-toggle='modal' data-target='#modal-" + data.data[i]['recordid'] + "'><strong>details</strong>\
      </button><div class='modal fade' id='modal-" + data.data[i]['recordid'] + "' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>\
      <div class='modal-dialog' role='document'><div class='modal-content'><div class='modal-header'>\
      <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button><h4 class='modal-title'>Todo Details</h4></div><div class='modal-body'>\
      <h1>Title</h1><p><pre>" + data.data[i]['title'] + "</pre></p><h1>Description</h1><p><pre>" + data.data[i]['description'] + "</pre></p><h1>Status</h1><p><pre>" + data.data[i]['status'] + "</pre></p></div></div></div></div></div><div id='private-todo-" + data.data[i]['recordid'] + "' style='display: none;'><form data-status='" + data.data[i]['status'] +
      "' recordid='" + data.data[i]['recordid'] + "' name='edit-form'><div class='form-group'><label>Title</label>\
      <input name='title' type='text' class='form-control' value='" + data.data[i]['title'] + "' /></div><div class='form-group'><label>Description</label>\
      <input name='description' type='text' class='form-control' value='" + data.data[i]['description'] + "' /></div><div class='btn-group-justified'><div class='btn-group'>\
      <input class='btn btn-default' type='submit' value='Save changes' /></div><div class='btn-group'><button recordid='" + data.data[i]['recordid'] + "' class='btn btn-danger cancel-edit'>Cancel</button></div></div></form></div></div></div></div></div>").insertBefore("." + data.data[i]['status'] + " .add-todo");

     }
     else if (data.data[i]['status'] === "incomplete") {
      panel= "warning";
      $("<div draggable='true' recordid='" + data.data[i]['recordid'] + "'  data-status='"
      + data.data[i]['status'] + "' style='display: none;' id = 'row-" + data.data[i]['recordid'] +
       "' class='row element-" + data.data[i]['status'] + "'  ondragstart='drag(event)'>\
      <div class='col-md-12'><div class='panel panel-" + panel + "'><div class='panel-heading'>\
      <div id='public-todo-" + data.data[i]['recordid'] + "'>\
      <a class='delete' recordid='" + data.data[i]['recordid'] + "' id='delete"+ data.data[i]['recordid']+ "'>\
      <span class='glyphicon glyphicon-remove pull-right text-danger'></span></a><h4 class='title'>\
      <strong>Title</strong>: " + data.data[i]['title'] + "</h4><h5 class='description'>\
      <strong>Description</strong>: " + data.data[i]['description'] + "</h5>\
      <button recordid='" + data.data[i]['recordid'] + "' class='btn btn-default details' data-toggle='modal' data-target='#modal-" + data.data[i]['recordid'] + "'><strong>details</strong>\
      </button><div class='modal fade' id='modal-" + data.data[i]['recordid'] + "' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>\
      <div class='modal-dialog' role='document'><div class='modal-content'><div class='modal-header'>\
      <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button><h4 class='modal-title'>Todo Details</h4></div><div class='modal-body'>\
      <h1>Title</h1><p><pre>" + data.data[i]['title'] + "</pre></p><h1>Description</h1><p><pre>" + data.data[i]['description'] + "</pre></p><h1>Status</h1><p><pre>" + data.data[i]['status'] + "</pre></p></div></div></div></div></div><div id='private-todo-" + data.data[i]['recordid'] + "' style='display: none;'><form data-status='" + data.data[i]['status'] +
      "' recordid='" + data.data[i]['recordid'] + "' name='edit-form'><div class='form-group'><label>Title</label>\
      <input name='title' type='text' class='form-control' value='" + data.data[i]['title'] + "' /></div><div class='form-group'><label>Description</label>\
      <input name='description' type='text' class='form-control' value='" + data.data[i]['description'] + "' /></div><div class='btn-group-justified'><div class='btn-group'>\
      <input class='btn btn-default' type='submit' value='Save changes' /></div><div class='btn-group'><button recordid='" + data.data[i]['recordid'] + "' class='btn btn-danger cancel-edit'>Cancel</button></div></div></form></div></div></div></div></div>").insertBefore("." + data.data[i]['status'] + " .add-todo");

}

}

                        $(".main-window").show("bounce", 400,function() {
                                           $(".element-complete").show("drop", 600);
                                           setTimeout(function() {
                                               $(".element-incomplete").show("drop", 600);
                                           }, 550);
                                           setTimeout(function() {
                                               $(".add-todo").show("bounce", 600);
                                           }, 1150);

                                       });

   }, function(err) {
                console.log(err);
});

});

}


$('body').on('click','.delete' ,function(e) {
  $('.message').css("display","inline-block");

          $(this).attr('data-toggle','modal')
          $(this).attr('data-target','#myModal')
          var id =( $(e.target).parent().attr('recordid'));
          console.log(id);
          $('.modalDelete').attr('recordid',id)

})
  $('body').on('click','.modalDelete',function(){
      console.log('delete')

      var id = $(this).attr('recordid');
      console.log(id)
      $('#delete'+id).parent().remove();
      toodo.deleteTodoList(id);

  })


$("form[name=login_form] .form-group").keypress(function() {
       $("form[name=login_form] .form-group").removeClass("has-error")
   });

   $(document).on('dblclick', '.element-complete, .element-incomplete', function(e) {
           var id = $(this).attr("recordid");
           console.log(id);
           $("#public-todo-" + id).slideToggle(600);
           $("#private-todo-" + id).slideToggle(600);
       });
       $(document).on('submit', 'form[name=edit-form]', function(e) {
             e.preventDefault();
             var formData = $(this).serializeArray();
             var update = {};
             for(var i = 0; i < formData.length; i++) {
                 update[formData[i].name] = formData[i].value;
             }


              var id = $(this).attr("recordid");
              var status = $(this).attr("data-status");
              toodo.UpdateTodoList(update.title, update.description, id);
              console.log(formData);
              $("#public-todo-" + id).empty();
              $("#public-todo-" + id).append("<a class='delete' recordid='" + id + "'>\
              <span class='glyphicon glyphicon-remove pull-right text-danger'>\
              </span></a><h4 class='title'><strong>Title</strong>: " + update.title + "</h4>\
              <h5 class='description'><strong>Description</strong>: " + update.description + "</h5>\
              <button data-record_id='" + id + "' class='btn btn-default details' data-toggle='modal' data-target='#modal-" + id + "'>\
              <strong>details</strong></button><div class='modal fade' id='modal-" + id + "' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>\
              <div class='modal-dialog' role='document'><div class='modal-content'><div class='modal-header'>\
              <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
              <span aria-hidden='true'>&times;</span></button><h4 class='modal-title'>Todo Details</h4>\
              </div><div class='modal-body'><h1>Title</h1><p><pre>" + update.title + "</pre></p><h1>Description</h1><p><pre>" + update.description + "</pre>\
              </p><h1>Status</h1><p><pre>" + status + "</pre></p></div></div></div></div></div>");
              $("#private-todo-" + id).slideToggle(750);
              $("#public-todo-" + id).slideToggle(750);
          });

          $(document).on('click', '.cancel-edit', function(e) {
                 var id = $(this).attr("recordid");
                 console.log(id);
                  $("#public-todo-" + id).slideToggle(600);
                  $("#private-todo-" + id).slideToggle(600)

             });


            $('body').on('click','#Add',function() {
            console.log("here");
            $(".popup").css("display","inline-block");
          });
            $('body').on('submit','#todo',function(e){
              e.preventDefault();

              var form= this;
              var formData= $("form").serializeArray();
              var obj={};
              for(var i = 0; i < formData.length; i++) {
              obj[formData[i].name] = formData[i].value

      }
            obj.userId=localStorage.getItem('userID');

            toodo.InsertTodoList(obj);
            renderTodoList(obj);
            console.log(obj);


    });




});
