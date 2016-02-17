var jsonfile = require('jsonfile')
var request = require('request')

var listArray = [];
var file = '/Users/EvanCoulson/data.json'

//templates
var insertListTemplate = function (list) {
  var listTemplate = ''+
  '<div class="list-template-container" data-showing="false" id="'+list.name+'">'+
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
      '<span onclick="addItem(this)" id="add-item-to-list" class="btn-edit">Add Item</span>'+
      '<br><br>'+
      '<span onclick="setAllChecked(this);" class="set-all-checked">Set All Checked</span><span onclick="setAllUnchecked(this);" class="set-all-unchecked">Set All Unchecked</span><span onclick="showEditMenu(this)" class="btn-edit">edit</span>'+
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
        '<div class="edit-item"><span class="remove-list-item"><img onclick="removeListItem(this);" src="Assets/Images/Xmark.png"</span><span class="edit-item" onclick="editItemMenu(this);">Edit</span></div>'+
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

var insertItemTemplateSingle = function (list) {
  var itemTemplate = '';
  var id = "#"+list.name;
  var listObj = $(id).parent().find('.btn-edit')
  showEditMenu(listObj)
  var tempItemList = [];
  var i = list.items.length - 1;
  var tempId = i+1;
  itemTemplate += '<tr class="item" id="'+tempId+'">'+
    '<td class="completed">'+
      '<span class="remove-item">Remove</span>'+
      '<div class="edit-item"><span class="remove-list-item"><img onclick="removeListItem(this);" src="Assets/Images/Xmark.png"</span><span class="edit-item" onclick="editItemMenu(this);">Edit</span></div>'+
      '<img onclick="toggleCheckMark(this);" class="custom-checkbox" src="Assets/Images/Xmark.png" alt="Not Completed" />'+
    '</td>'
    for (var j = 0; j < list.keys.length; j++ ) {
      itemTemplate += '<td class="'+list.items[i].names[j]+'">'+
        list.items[i].names[j]+
      '</td>'
    }
  itemTemplate += '</tr>'
  console.log(itemTemplate)
  $(id + ' tbody').append(itemTemplate);
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
  this.id = listArray.length;
  this.desc = desc;
  this.items = [];
  this.keys = [];
  this.listTemplate = insertListTemplate(this);
  listArray.push(this);
}

var Item = function (name,list,final) {
  this.isChecked = false;
  if (Array.isArray(name)) {
    this.names = name;
  }
  this.id = list.items.length - 1;
  list.items.push(this);
  if (final) {
    this.itemTemplate = insertItemTemplate(list);
  }
}

var Key = function (name,list,final) {
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
  var removeListName = $(ele).parent().parent().prop("id");
  var removeList = getList(removeListName);
  listArray.splice(removeList.id,1)
  writeJSONData()
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
  var keyTemplate = '<div class="key-placeholder"><label class="input-label">Key Name: </label><span class="remove-key-input" onclick="removeKey(this);"><img src="Assets/Images/Xmark.png"></span><input id="'+id2+'" class="create-list-input-1" name="name" type="text" placeholder="Key Name..."/><br></div>'
  $('.add-key').append(keyTemplate);
})

$('.add-btn-item').click(function () {
  id3++;
  var itemTemplate = '<div class="item-placeholder"><label class="input-label">Item Name: </label><span class="remove-item-input" onclick="removeItem(this);"><img src="Assets/Images/Xmark.png"></span>'
  for (var i = 0; i < id2; i++) {
    var specialId = "#"+(i+1);
    var value = $('.add-key').find(specialId).val();
    itemTemplate += '<input id="'+id3+'" class="create-list-input '+(i+1)+'" name="name" type="text" placeholder="Insert '+value+'..."/>'
  }
  itemTemplate += '</div><br class="break">'
  $('.add-item').append(itemTemplate);
})

$('.edit-lists-close').click(function () {
  $('.edit-item-wrapper').slideUp(500);
  clearEditMenu()
})

$('.add-lists-close').click(function () {
  $('.add-item-wrapper').slideUp(500);
  clearAddMenu()
})

function removeItem(ele) {
  id3 -= 1;
  $(ele).parent().parent().find(".break").remove()
  $(ele).parent().slideUp(200,function () {
    $(ele).parent().remove()
  })

}

function removeKey(ele) {
  id2 -= 1;
  $(ele).parent().slideUp(200,function () {
    $(ele).parent().remove()
  })
}

var editList;
function showEditMenu(ele) {
  $(ele).parent().find(".list").find(".custom-checkbox").toggle();
  $(ele).parent().find(".list").find(".edit-item").toggle();
  var listName =  $(ele).parent().parent().prop("id");
  editList = getList(listName);
  $("#add-item-to-list").slideToggle(100);
}

function removeListItem(ele) {
  $(ele).parent().parent().parent().parent().fadeOut(200,function () {
    $(ele).parent().parent().parent().parent().remove()
  })
  var indexString = $(ele).parent().parent().parent().parent().prop("id");
  var index = parseInt(indexString)
  index -= 1;
  var listName = $(ele).parent().parent().parent().parent().parent().parent().parent().parent().prop("id")
  var list = getList(listName)
  list.items.splice(index,1)
  writeJSONData()
}

function setAllChecked(ele) {
  var thisListName = $(ele).parent().parent().prop("id");
  var list = getList(thisListName);
  for (var i = 0; i < list.items.length; i++) {
    var uniqueID = "#" +(i+1)
    $(ele).parent().find(".list").find(uniqueID).find(".completed").find(".custom-checkbox").prop("src","Assets/Images/Xmark.png")
    var checkMarkEle = $(ele).parent().find(".list").find(uniqueID).find(".completed").find(".custom-checkbox")
    toggleCheckMark(checkMarkEle)
  }
}

function setAllUnchecked(ele) {
  var thisListName = $(ele).parent().parent().prop("id");
  var list = getList(thisListName);
  for (var i = 0; i < list.items.length; i++) {
    var uniqueID = "#" +(i+1)
    $(ele).parent().find(".list").find(uniqueID).find(".completed").find(".custom-checkbox").prop("src","Assets/Images/CheckMark.png")
    var checkMarkEle = $(ele).parent().find(".list").find(uniqueID).find(".completed").find(".custom-checkbox")
    toggleCheckMark(checkMarkEle)
  }
}

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
  writeJSONData()
  clearDataInput(itemLength,keyLength)
}

function clearDataInput(itemLength,keyLength) {
  $('.create-list-input-1').val("")
  $('.create-list-input-2').val("")
  for (var i = 0; i < itemLength; i++) {
    var specialId = "#"+(i+1);
    var valueObj = $('.add-item').find(specialId);
    var valueLabel = $('.add-item').find('.input-label').parent()
    for (var j = 0; j < keyLength; j++) {
      if (valueObj.next().val != "") {
        valueObj.remove();
        valueLabel.remove();
        valueObj = valueObj.next();
      }
    }
  }

  for (var i = 0; i < keyLength; i++) {
    var specialId = "#"+(i+1);
    $('.add-key').find(specialId).remove()
    $('.add-key').find('.input-label').parent().remove()
  }

  id2 = 0;
  id3 = 0;
}

function addItem(ele) {
  $('.add-item-wrapper').slideDown();
  var listName = $(ele).parent().parent().prop("id")
  var list = getList(listName);
  addInputs(list,ele);
}

function addInputs(list) {
  var itemTemplate = '<div class="add-placeholder"><span class="remove-item-input" onclick="removeItem(this);"><img class="add-remove-item" src="Assets/Images/Xmark.png"></span>'
  for (var i = 0; i < list.keys.length; i++) {
    var value = list.keys[i].name;
    itemTemplate += '<input id="'+(i+1)+'" class="add-list-input '+(i+1)+'" name="name" type="text" placeholder="Insert '+value+'..."/>'
  }
  itemTemplate += '</div><br class="break"><span onclick="addItemSave(this)" class="btn-save">Save</span>'
  $('.add-item-menu').append(itemTemplate);
}

function nextCreatePannel(id) {
  var id = parseInt(id);
  id++;
  id = "#"+id;
  $('.create-lists-overlay').hide();
  $('.create-lists-wrapper, ' +id).show();
}

var item
function editItemMenu(ele) {
  $(".edit-item-wrapper").slideDown(500);

  item = $(ele).parent().parent().parent().parent();
  var itemID = $(item).prop("id")
  var id = parseInt(itemID);
  id -= 1;
  listName = $(ele).parent().parent().parent().parent().parent().parent().parent().parent().prop("id")
  var inputHTML = '<br>'
  for (var i = 0; i < editList.keys.length; i++) {
    inputHTML += '<span class="edit-key">'+editList.keys[i].name+'</span>'
  }
  inputHTML += '<br>'
  for (var i = 0; i < editList.keys.length; i++) {
    inputHTML += '<input id="'+(i+1)+'" class="edit-list-input '+(i+1)+'" value="'+editList.items[id].names[i]+'" name="name" type="text" placeholder="Edit Item"/>'
  }
  inputHTML += '<br><br><span onclick="editItemSave(this)" class="btn-save">Save</span>'
  $('.edit-item-menu').append(inputHTML)
}

function editItemSave(ele) {
  $(".edit-item-wrapper").slideUp(500);
  var itemID = $(item).prop("id")
  var id = parseInt(itemID);
  id -= 1
  var newValues = [];
  for (var i = 0; i < editList.keys.length; i++) {
    newValues.push($('.edit-item-menu').find("#"+(i+1)).val());
  }
  for (var i = 0; i < editList.keys.length; i++) {
    $(item).find("."+editList.items[id].names[i]).text(newValues[i])
  }
  editList.items[id].names = newValues
  writeJSONData()
  clearEditMenu()
}

function addItemSave(ele) {
  $(".add-item-wrapper").slideUp(500);
  var newValues = []
  for (var i = 0; i < editList.keys.length; i++) {
    var inputClass = "#"+(i+1)
    var val = $('.add-list-input').parent().find(inputClass).val();
    newValues.push(val)
  }
  new Item(newValues,editList, false);
  insertItemTemplateSingle(editList)
  writeJSONData()
  clearEditMenu()
}

function clearEditMenu() {
  for (var i = 0; i < editList.keys.length; i++) {
    $('.edit-item-menu').find(".edit-key").remove();
    $('.edit-item-menu').find(".btn-save").remove();
    $('.edit-item-menu').find("input").remove();
    $('.edit-item-menu').find("br").remove();
  }
}

function clearAddMenu() {
  $('.add-item-menu').find('.add-placeholder').remove();
  $('.add-item-menu').find('br').remove();
}

function writeJSONData() {
  jsonfile.writeFile(file, listArray, function (err) {
    alert("save:" + err)
    uploadFileToServer()
  })
}

function uploadFileToServer() {

}

function loadJSONData() {
  var object;
  jsonfile.readFile(file, function(err, obj) {
    object = obj;
    for (var i = 0; i < object.length; i++) {
      var list = new List(object[i].name, object[i].desc);
      for (var j = 0; j < object[i].keys.length; j++) {
        var keyName = object[i].keys[j].name
        if (j == object[i].keys.length - 1) {
          new Key(keyName,list, true);
        } else {
          new Key(keyName,list, false);
        }
      }
      for (var j = 0; j < object[i].items.length; j++) {
        var itemNames = []
        for (var k = 0; k < object[i].items.length; k++) {
          var itemName = object[i].items[j].names[k];
          itemNames.push(itemName)
        }
        if (j == object[i].items.length - 1) {
          new Item(itemNames,list, true);
        } else {
          new Item(itemNames,list, false);
        }
      }
    }
  })
}

//onready
$(document).ready(function () {
  loadJSONData();
  function injectNavBar() {
    $("header").append('<nav class="navbar">' +
    '<a class="navbar-link active" href="index.html"><h1>MyHub</h1></a>' +
    '<a class="navbar-link" href="calander.html"><li class="navbar-item">Calander</li></a>'+
    '<a class="navbar-link" href="todo.html"><li class="navbar-item">To-Do</li></a></nav>');
  }
});
