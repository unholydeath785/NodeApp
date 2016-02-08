var listArray = [];
//templates
var insertListTemplate = function (list) {
  var listTemplate = '<div class="list-template-container" data-showing="false" id="'+list.name+'">'+
    '<div class="template-info" onclick="toggleAddedList(this);">' +
      '<span class="template-name">'+list.name+' <span class="template-desc">'+list.desc+'</span><span class="show-template">></span></span><span class="complete-list" onclick="removeList(this);">Remove</span>' +
    '</div>'+
    '<div class="list-template">' +
      '<table class="list">' +
        '<tr class="key">'+
          '<th class="keys">' +
            '<img class="checkmark" src="Assets/Images/CheckMark.png" alt="Checkmark" />' +
          '</th>' +
        '</tr>'+
        '<tr class="item">'+
        '</tr>'+
      '</table>' +
    '</div>' +
  '</div>';
  $('.list-templates').append(listTemplate);
  return listTemplate;
}

var insertItemTemplate = function (list) {
  var itemTemplate = '';
  var id = "#"+list.name;
  var tempItemList = [];
  for (var i = 0; i < list.items.length; i++) {
    var tempId = i+1;
    itemTemplate += '<tr class="item" id="'+tempId+'">'+
      '<td class="completed">'+
        '<span class="remove-item">Remove</span>'+
        '<img onclick="toggleCheckMark(this);" class="custom-checkbox" src="Assets/Images/Xmark.png" alt="Not Completed" />'+
      '</td>'
      for (var j = 0; j < list.keys.length; j++ ) {
        itemTemplate += '<td class="'+list.items[i].names[j]+'">'+
          list.items[i].names[j]+
        '</td>'
      }
    itemTemplate += '</tr>';
  }
  $(id + ' tbody').append(itemTemplate);

  return itemTemplate;
}

var insertKeyTemplate = function (list) {
  var keyTemplate = '';
  for (var i = 0; i < list.keys.length; i++) {
    keyTemplate += ''+
    '<th class="keys">' +
      list.keys[i].name+
    '</th>'
  }
  var id = "#"+list.name;
  $(id + ' .key').append(keyTemplate)
  return keyTemplate;
}

//objects
var List = function(name,desc) {
  this.name = name;
  this.id = listArray.length + 1;
  this.desc = desc;
  this.items = [];
  this.keys = [];
  this.listTemplate = insertListTemplate(this);
  listArray.push(this);
}

var Item = function (name,list,final) {
  this.list = list;
  this.isChecked = false;
  if (Array.isArray(name)) {
    this.names = name;
  }
  this.id = list.items.length + 1;
  list.items.push(this);
  if (final) {
    this.itemTemplate = insertItemTemplate(list);
  }

}

var Key = function (name,list,final) {
  this.list = list;
  this.name = name;
  list.keys.push(this);
  if (final) {
    this.listKey = insertKeyTemplate(list)
  }
}

List.prototype.allChecked = function () {
  for (var i = 0; i < this.items.length; i++) {
    if (this.items[i].isChecked == false) {
      return false;
    }
  }
  return true;
};

var getList = function (name) {
  for (var i = 0; i < listArray.length; i++) {
    if (name == listArray[i].name) {
      return listArray[i];
    }
  }
}

var groceries = new List("Chores","A simple example list ");
groceries.keys[0] = new Key(["Name"],groceries,false);
groceries.keys[1] = new Key(["Price"],groceries,true);
groceries.items[0] = new Item(["Eggs","1$"],groceries,false);
groceries.items[1] = new Item(["Milk","2$"],groceries,false);
groceries.items[2] = new Item(["Meat (Sirlion Cut)","15$"],groceries,false);
groceries.items[3] = new Item(["Apples","17$"],groceries,true);

//injections

function injectNavBar() {
  $("header").append('<nav class="navbar">' +
  '<a class="navbar-link active" href="index.html"><h1>MyHub</h1></a>' +
  '<a class="navbar-link" href="calander.html"><li class="navbar-item">Calander</li></a>'+
  '<a class="navbar-link" href="todo.html"><li class="navbar-item">To-Do</li></a></nav>');
}

// function injectLists() {
//   $('.todo').append(listTemplate);
// }

//events


function toggleAddedList(ele) {
  var id = "#" + $(ele).parent().prop("id");

  var isShowing = "" + $(ele).parent().prop("data-showing");
  if (isShowing == "true") {
    $(ele).parent().prop("data-showing","false");
    $(ele).parent().find('.template-name').css("color","rgb(116,116,116)");
    $(ele).parent().find('.show-template').css("transform","initial");
    $(ele).parent().find('.show-template').css("transition","transform 0.5s");
  } else {
    $(ele).parent().prop("data-showing","true");
    $(ele).parent().find('.template-name').css("color","#04D765");
    $(ele).parent().find('.show-template').css("transform","rotate(90deg)");
    $(ele).parent().find('.show-template').css("transition","transform 0.5s");
  }
  $(ele).parent().find('.list-template').slideToggle(100);
}

function toggleCheckMark(ele) {
  var source = $(ele).prop("src");
  var index = parseInt($(ele).parent().parent().prop("id")) - 1;
  var parentTemplate = "#"+$(ele).parent().parent().parent().parent().parent().parent().prop("id");
  var listName = $(ele).parent().parent().parent().parent().parent().parent().prop("id");
  var list = getList(listName);
  var id = "#" + $(ele).parent().parent().prop("id");
  if (source == "file:///Users/EvanCoulson/github/NodeApp/Assets/Images/CheckMark.png") {
    $(ele).prop("src","Assets/Images/Xmark.png");
    list.items[index].isChecked = false;
    $(parentTemplate + ' ' + id + ' .completed .remove-item').hide(100);
  } else {
    $(ele).prop("src","Assets/Images/CheckMark.png");
    list.items[index].isChecked = true;
    $(parentTemplate + ' ' + id + ' .completed .remove-item').show(100);
  }
  if (list.allChecked() == true) {
    $(ele).parent().parent().parent().parent().parent().slideToggle(500,function() {
      var parentId = "#"+$(this).parent().prop("id");
      $(this).parent().prop("data-showing","false");
      $(parentId + ' .template-info .template-name').css("color","rgb(116,116,116)");
      $(parentId + ' .template-info .template-name .show-template').css("transform","initial");
      $(parentId + ' .template-info .template-name .show-template').css("transition","transform 0.5s");
      $(parentId + ' .template-info .complete-list').fadeIn(100);
    });
  } else {
    var parentId = "#" + $(this).parent().parent().parent().parent().parent().parent().prop("id");
    $(parentId + ' .template-info .complete-list').fadeOut(100);
  }
}

function removeList(ele) {
  $(ele).parent().parent().slideToggle(100);
  $(ele).remove();
}

$('.create-list-btn').click(function () {
  $('.create-lists-wrapper').slideDown(200);
  nextCreatePannel(0);
})

$('.create-lists-close').click(function () {
  $('.create-lists-overlay').slideUp(200);
  $('.create-lists-wrapper').slideUp(200);
})

var id2 = 0;
var id3 = 0;
$('.next-btn').click(function () {
  $(this).parent().hide();
  var id = $(this).parent().prop("id");
  nextCreatePannel(id)
  if (id == "3") {
    getData(id2,id3);
  }
})

$('.add-btn-key').click(function () {
  id2++;
  var keyTemplate = '<label class="input-label">Key Name: </label><input id="'+id2+'" class="create-list-input-1" name="name" type="text" placeholder="Key Name..."/><br>'
  $('.add-key').append(keyTemplate);
})

$('.add-btn-item').click(function () {
  id3++;
  var itemTemplate = '<label class="input-label">Item Name: </label>'
  for (var i = 0; i < id2; i++) {
    var specialId = "#"+(i+1);
    var value = $('.add-key').find(specialId).val();
    itemTemplate += '<input id="'+id3+'" class="create-list-input '+(i+1)+'" name="name" type="text" placeholder="Insert '+value+'..."/>'
  }
  itemTemplate += '<br>'
  $('.add-item').append(itemTemplate);
})

//functions
function getData(keyLength,itemLength) {
  $('.create-lists-wrapper').hide();
  var name = $('.create-list-input-1').val()
  var desc = $('.create-list-input-2').val();
  var newList = new List(name,desc);
  var listKeys = [];
  var itemList = [];
  for (var i = 0; i < keyLength; i++) {
    var specialId = "#"+(i+1);
    var value = $('.add-key').find(specialId).val()
    listKeys.push(value);
  }

  for (var i = 0; i < itemLength; i++) {
    var foo = [];
    var specialId = "#"+(i+1);
    var valueObj = $('.add-item').find(specialId)
    for (var j = 0; j < keyLength; j++) {
      if (valueObj.next().val != "") {
        value = valueObj.val();
        valueObj = valueObj.next();
        foo.push(value);
      }
    }
    itemList.push(foo);
  }

  for (var i = 0; i < listKeys.length; i++) {
    if (i == listKeys.length - 1) {
      new Key(listKeys[i],newList, true);
    } else {
      new Key(listKeys[i],newList, false);
    }
  }

  for (var i = 0; i < itemList.length; i++) {
     if (i == itemList.length -1) {
       new Item(itemList[i],newList, true);
     } else {
       new Item(itemList[i],newList, false);
     }
  }
}

function nextCreatePannel(id) {
  var id = parseInt(id);
  id++;
  id = "#"+id;
  $('.create-lists-overlay').hide();
  $('.create-lists-wrapper, ' +id).show();
}

//onready
$(document).ready(function () {
  injectNavBar();
  // injectLists();
});
