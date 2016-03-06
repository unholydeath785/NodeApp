var jsonfile = require('jsonfile');
var request = require('request');

//Add function to Date class
Date.prototype.addHours = function (hours) {
  if (hours + this.getHours() > 24) {
    var tomorrow = new Date(new Date.getTime() + 24 * 60 * 60 * 1000);
    return tomorrow;
  } else {
    this.setTime(this.getTime()+(hours*60*60*1000))
    return this;
  }
};


var calendarApp = (function ($) {
  //Gloabl for fall back in case of nessacary excess functions
  var isScheduleShowing = false;
  var longEventIsChecked = false;
  var allDayIsChecked = false;
  var calendarEventsArray = [];
  var scheduleArray = [];
  var cal_days_labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var cal_months_labels = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var cal_days_in_months = [31,28,31,30,31,30,31,31,30,31,30,31];
  var cal_current_date = new Date();

  //Data structures

      //========================================
      //||                                    ||
      //||            Calendar                ||
      //||                                    ||
      //========================================

  function Calendar(month,year) {
    this.month = (isNaN(month) || month == null) ? cal_current_date.getMonth() : month;
    this.year = (isNaN(year) || year == null) ? cal_current_date.getFullYear() : year;
    this.html = '';
  }
  // ==================================
  // ||                              ||
  // ||      Calendar Declaration    ||
  // ||                              ||
  // ==================================
  var cal = new Calendar(cal_current_date.getMonth(),cal_current_date.getFullYear());

  Calendar.prototype.generateHtmlSkeleton = function () {
    //variables
    var previousYear = this.year;
    var nextYear = this.year;
    var previousMonth = this.month - 1;
    var nextMonth = this.month + 1;
    //check if previous and next month are out side of index bounds
    if (previousMonth < 0) {
      previousMonth = 11;
      previousYear--;
    }
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }

    var daysInMonthBefore = cal_days_in_months[previousMonth];
    var daysInMonthAfter = cal_days_in_months[nextMonth];
    var firstDay = new Date(this.year,this.month,1);
    var startingDay = firstDay.getDay();
    var monthLength = cal_days_in_months[this.month];
    var monthName = cal_months_labels[this.month];
    var day = 1;

    //compensate for leap year
    if ((this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0) {
      if (this.month == 1) {
        monthLength = 29;
      } else if (this.month == 2) {
        daysInMonthBefore = 29;
      }
    }

    //construct html skeltal structure of one calendar month
    var html = '<table class="calendar-container" cellspacing="0">';
    html += '<tr class="month-label"><th colspan="7">';
    html += monthName + "&nbsp;" + '<span class="year-label">'+this.year+'</span>';
    html += '</th></tr>';
    html += '<tr class="week-header">'
    for (var i = 0; i < 7; i++) {
      if (i == 0 || i == 6) {
        html += '<td class="weekend-header">'
        html += cal_days_labels[i];
        html += '</td>';
      } else {
        html += '<td class="day-header">';
        html += cal_days_labels[i];
        html += '</td>';
      }
    }
    html += '</tr><tr class="week-container">';
    for (var i = 0; i < Math.ceil((monthLength + startingDay) / 7); i++) {
      for (var j = 0; j < 7; j++) {
        if (day <= monthLength) {
          if ((i > 0 || j >= startingDay)) {
            // Days of this month
            if (j == 0 || j == 6) {
              html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(day+'-'+this.month+'-'+this.year)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container-weekend">';
            } else {
              html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(day+'-'+this.month+'-'+this.year)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container">';
            }
            if (cal_current_date.getDate() == day && this.year == cal_current_date.getFullYear() && cal_current_date.getMonth() == this.month) {
              html += '<span class="date-active">'+day+'</span>';
            } else {
              html += '<span class="date">'+day+'</span>';
            }
            day ++;
          }
          else {
            // Last days of previous month
            var prevDays = (daysInMonthBefore - (startingDay - 1) + j);
            if (j == 0 || j == 6) {
              html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(prevDays+'-'+previousMonth+'-'+previousYear)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container-weekend">';
            } else {
              html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(prevDays+'-'+(previousMonth)+'-'+previousYear)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container">';
            }
            html += '<span class="outside-of-day-range">'+prevDays+'</span>';
          }
        }
        else {
          var nextDays = day - monthLength;
          if (j == 0 || j == 6) {
            html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(nextDays+'-'+(nextMonth)+'-'+nextYear)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container-weekend">';
          } else {
            html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(nextDays+'-'+(nextMonth)+'-'+nextYear)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container">';
          }
          // First days of next month
          html += '<span class="outside-of-day-range">'+nextDays+'</span>';
          day++;
        }
        html += '</td>';
      }
      if (day > monthLength) {
        break;
      } else {
        html += '</tr><tr class="week-container">';
      }
    }
    html += '</tr></table>';
    this.html = html;
  }

  //get cal html
  Calendar.prototype.getHtmlSkeleton = function () {
    return this.html;
  };

  //change month display
  Calendar.prototype.changeMonth = function (changeMonthVal) {
    switch (changeMonthVal) {
      case 1:
        this.month += 1;
        if (this.month > 11) {
          this.year++;
          this.month = 0;
        }
        break;
      case -1:
        this.month -= 1;
        if (this.month < 0) {
          this.year --;
          this.month = 11;
        }
        break;
      default:
        break;
    }
    this.generateHtmlSkeleton();
    var html = this.getHtmlSkeleton();
    $('.calendar-container').remove();
    $('.calendar-section').append(cal.getHtmlSkeleton());
    for (var i = 0; i < calendarEventsArray.length; i ++) {
      var calEvent = calendarEventsArray[i];
      calEvent.generateHtmlSkeleton();
      $(calEvent.selectorID).append(calEvent.getHtmlSkeleton());
      calEvent.colorHtml();
    }
  };

  //========================================
  //||                                    ||
  //||            Cal Events              ||
  //||                                    ||
  //========================================

  function CalendarEvent(name,date,date1,schedule) {
    this.name = name;
    console.log(schedule);
    this.isShowing = true;
    this.schedule = schedule;
    this.year = date.getFullYear();
    this.month = date.getMonth();
    this.day = date.getDate();
    this.hour = date.getHours();
    this.minute = date.getMinutes();
    this.endYear = date1.getFullYear();
    this.endMonth = date1.getMonth();
    this.endDay = date1.getDate();
    this.endHour = date1.getHours();
    this.endMinute = date1.getMinutes();
    if (date == date1) {
      this.oneDay = true;
    } else {
      this.oneDay = false;
    }
    this.repeat = null;
    this.alert = null;
    this.travelTime = null;
    this.invitees = null;
    this.location = null;
    this.notes = null;
    this.url = null;
    this.attachmentFile = null;
    this.lists = null;
    var timeStamp = new Date(this.year,this.month,this.day,this.hour,this.minute,0,1000);
    this.timeString = getTime(timeStamp);
    this.selectorID = '#'+this.day+'-'+this.month+'-'+this.year;
    this.selectorID2 = '#'+this.endDay+'-'+this.endMonth+'-'+this.endYear;
    this.html = '';
    calendarEventsArray.push(this);
    var calSchedule = getSchedule(this.schedule);
    calSchedule.calEvents.push(this);
  }

  CalendarEvent.prototype.generateHtmlSkeleton = function () {
    var scrollOffsetY = (window.pageYOffset || document.scrollTop) - (document.clientTop || 0);
    var html = '<div onclick="calendarApp.showCalEvent(this,event)" draggable="true" ondragstart="calendarApp.drag(event)" onmouseenter="calendarApp.scrollEvent(this);" class="calendar-event '+this.schedule+'" id="'+this.selectorID+'"><span class="calendar-event-name">'  +this.name+'</span><span class="calendar-event-time">'+this.timeString+'</span><div class="popup-menu"><div class="triangle-up"></div><div class="popup-menu-wrapper"><div class="popup-menu-container"><h1 class="popup-title">'+this.name+'</h1>';
    if (this.oneDay) {
      var date = getDate(this.selectorID);
      html += '<p class="menu-date">Date: '+date+'</p>';
    } else {
      var date1 = getDate(this.selectorID);
      var date2 = getDate(this.selectorID2);
      html += '<p class="menu-date">Date: '+date1+'</p>';
      html += '<p class="menu-date">Date: '+date2+'</p>';
    }
    if (this.timeString.length > 0) {
      html += '<p class="menu-time">Time: '+this.timeString+'</p>';
    }
    if (this.alert != null) {
      html += '<p class="menu-alert-time">Alert: '+this.alert+'</p>';
    }
    if (this.repeat != null) {
      html += '<p class="menu-repeat">Repeat: '+this.repeat+'</p>';
    }
    if (this.travelTime != null) {
      html += '<p class="menu-travel-time">Travel Time: '+this.travelTime+'</p>';
    }
    if (this.invitees != null) {
      for (var i = 0; i <this.invitees.length; i++) {
        html += '<p class="menu-invitees">Invitees: '+this.invitees[i]+'</p>';
      }
    }
    if (this.location != null) {
      html += '<p class="menu-location">Location: '+this.location+'</p>';
    }
    if (this.notes != null) {
      html += '<p class="menu-notes">Notes: '+this.notes+'</p>';
    }
    if (this.url != null) {
      for (var i = 0; i < this.url.length; i++) {
        html += '<p onclick="calendarApp.loadHiddenIFrame(this)" class="menu-urls">Urls: '+this.url[i]+'</p>';
      }
    }
    if (this.attachmentFile != null) {
      html += '<p class="menu-file">File: '+this.attachmentFile+'</p>';
    }
    if (this.lists != null) {
      html += '<p class="menu-lists">Lists:'+this.lists+'</p>';
    }
    html += '</div></div></div></div>';
    this.html = html;
  };

  CalendarEvent.prototype.getHtmlSkeleton = function () {
    return this.html
  }

  CalendarEvent.prototype.colorHtml = function () {
    var schedule = getSchedule(this.schedule);
    console.log(schedule.color);
    $('.'+this.schedule).css("background-color",schedule.color);
    $('.'+this.schedule).find('.calendar-event-time').css("background-color",schedule.color);
  };

  //getters

  var getCalEventByID = function(id) {
    for (var i = 0; i < calendarEventsArray.length; i++) {
      if (calendarEventsArray[i].selectorID == id) {
        return calendarEventsArray[i];
      }
    }
  }

  //========================================
  //||                                    ||
  //||            Schedule                ||
  //||                                    ||
  //========================================


  function Schedule (name,color) {
    this.name = name;
    this.color = color;
    this.calEvents = [];
    this.isShowing = true;
    this.html = '';
    scheduleArray.push(this);
  }

  Schedule.prototype.generateHtmlSkeleton = function () {
    var html = '<li onclick="calendarApp.toggleSchedule(this)" class="schedule-info" id="'+this.name+'"><span class="schedule-color"></span><span class="schedule-name">'+this.name+'</span></li><br>';
    this.html = html;
  };

  Schedule.prototype.getHtmlSkeleton = function () {
    return this.html;
  };

  Schedule.prototype.colorHtml = function () {
    var id = '#'+this.name;
    if (this.isShowing) {
        $('.schedule-list').find(id).find('.schedule-color').css('background-color',this.color);
    } else {
      $('.schedule-list').find(id).find('.schedule-color').css('background-color','rgb(187,187,187)');
    }

  };

  //functions
  var ignition = function () {
    cal.generateHtmlSkeleton();
    $('.calendar-section').append(cal.getHtmlSkeleton())
    var schedule = new Schedule('Default','yellow');
    schedule.generateHtmlSkeleton();
    $('.schedule-list').append(schedule.getHtmlSkeleton());
    schedule.colorHtml();
    var schedule1 = new Schedule('Soccer','orange');
    schedule1.generateHtmlSkeleton();
    $('.schedule-list').append(schedule1.getHtmlSkeleton());
    schedule1.colorHtml();
    var date = new Date(2016,2,1,10,30,0,1000);
    var calEvent = new CalendarEvent("Test",date,date,'Default');
    calEvent.url = ["http://cnn.com","http://niceme.me","http://eelslap.com"];
    calEvent.generateHtmlSkeleton();
    $(calEvent.selectorID).append(calEvent.getHtmlSkeleton());
    calEvent.colorHtml();
  }

  var updateMonth = function (changeMonthVal) {
    cal.changeMonth(changeMonthVal);
  }

  // Drag n' drop

  var dragEle = function (ev) {
    ev.dataTransfer.setData("text",ev.target.id)
  }

  var dropEle = function (ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
  }

  var allowDropEle = function (ev) {
    ev.preventDefault();
  }

  // open calevent creation pannel

  var createList = function (ele,event) {
    $('.popup-menu').hide(0);
    var section = $('.create-calendar-event');
    var triangle = $('.triangle-up');
    var id = $(ele).prop("id");
    var id2 = $(ele).next().prop("id");
    if (id2 == undefined) {
      id2 = $(ele).parent().next().find(".day-container-weekend").prop("id");
      console.log(id2);
    }
    var scrollOffsetY = (window.pageYOffset || document.scrollTop) - (document.clientTop || 0);
    if (!isNaN(scrollOffsetY)) {
      section.css({
        position:"absolute",
        top: event.clientY + 25 + scrollOffsetY,
        left: event.clientX - 225
      });

      triangle.css({
        position:"absolute",
        top:-25,
        left:200
      })
    } else {
      section.css({
        position:"absolute",
        top: event.clientY + 25,
        left: event.clientX - 225
      });

      triangle.css({
        position:"absolute",
        top:-25,
        left:200
      })
    }

    section.show();
    triangle.show();
    populateCalEventMenu(id,id2);
  }

  // Create Cal events

  var populateCalEventMenu = function(id,id2) {
    //variables
    var cssID = id;
    var nextCssID = id2;
    console.log(cssID);
    var today = new Date();
    //get default values
    var defaultTitle = "Untitled"
    var date1 = getDate(cssID);
    var date2 = getDate(nextCssID);
    var time1 = getTime(today);
    var time2 = getTime(today.addHours(1));

    //insert to menu
    $('[name="name"]').val(defaultTitle);
    $('[name="date1"]').val(date1);
    $('[name="date2"]').val(date2);
    $('[name="time1"]').val(time1);
    $('[name="time2"]').val(time2);

    //populate menus
    populateScheduleMenu();
  }

  var populateScheduleMenu = function () {
    var html = '';
    for (var i = 0; i < scheduleArray.length; i++) {
      html += '<option>'+scheduleArray[i].name+'</option>';
    }
    $('.scheduele-selector').append(html);
  }

  var getCalEventMenuData = function () {
    //get values from input
    var title = $('[name="name"]').val();
    var date1 = $('[name="date1"]').val();
    var date2 = '';
    date1 = parseDate(date1);
    if ($('[name="longevent"]').prop("checked")) {
      date2 = $('[name="date2"]').val();
      date2 = parseDate(date2);
      var year1 = getYear(date1);
      var month1 = getMonth(date1);
      var day1 = getDay(date1);
      var hour1 = getHour(time1);
      var minute1 = getMinute(time1);
      var date1 = createDate(year,month,day,hour,minute);
    }
    var time1 = $('[name="time1"]').val();
    var time2 = $('[name="time2"]').val();

    //convert values
    var year = getYear(date1);
    var month = getMonth(date1);
    var day = getDay(date1);
    var hour = getHour(time1);
    var minute = getMinute(time1);
    var date = createDate(year,month,day,hour,minute);
    var schedule = $('.scheduele-selector').val();

    var calEvent;
    if (date2 != '') {
      calEvent = new CalendarEvent(title,date1,date2,schedule);
    } else {
      calEvent = new CalendarEvent(title,date,date,schedule);
    }

    //get extra info
    var repeat = $('[name=repeatSelector]').val();
    var alert = $('[name=alertSelector]').val();
    var travelTime = $('[name=traveltime]').val();
    var totalPeople = $('.invitee').length;
    var totalURLS = $('.url').length;
    var invitees = getPeople(totalPeople);
    var location = $('[name=location]').val();
    var notes = $('[name=notes]').val();
    var urls = getURLS(totalURLS);
    var lists = $('[name=listSelector]').val();

    //validate info
    repeat = testIfEmpty(repeat);
    alert = testIfEmpty(alert);
    travelTime = testIfEmpty(travelTime);
    invitees = testIfEmptyArray(invitees);
    location = testIfEmpty(location);
    notes = testIfEmpty(notes);
    urls = testIfEmptyArray(urls);
    lists = testIfEmpty(lists);

    //insert into calendar
    calEvent.repeat = repeat;
    calEvent.alert = alert;
    calEvent.travelTime = travelTime;
    calEvent.invitees = invitees;
    calEvent.location = location;
    calEvent.notes = notes;
    calEvent.url = urls;
    calEvent.attachmentFile = null;
    calEvent.lists = lists;
    calEvent.generateHtmlSkeleton()
    $(calEvent.selectorID).append(calEvent.getHtmlSkeleton());
    calEvent.colorHtml();
  }

  var testIfEmpty = function (variable) {
    if (variable == '') {
      variable = null;
      return variable;
    }
    return variable;
  }

  var testIfEmptyArray = function (variable) {
    if (variable.length == 0) {
      variable = null;
      return variable;
    }
    return variable;
  }


  var getURLS = function (totalLength) {
    var valueArray = [];
    for (var i = 0; i < totalLength; i++) {
      var specialID = '#'+(i);
      var value = $('.urls-container').find(specialID).text()
      valueArray.push(value);
    }
    return valueArray;
  }

  var getPeople = function (totalLength) {
    var valueArray = [];
    for (var i = 0; i < totalLength; i++) {
      var specialID = '#'+(i);
      var value = $('.invite-container').find(specialID).text()
      valueArray.push(value);
    }
    return valueArray;
  }

  var createDate = function (year,month,day,hour,minute) {
    var date = new Date(year,month,day,hour,minute,0,1000);
    return date;
  }

  var getYear = function (id) {
    var valueArray = id.split(" ");
    for (var i = 0; i < valueArray.length; i++) {
      var value = valueArray[i];
      valueArray[i] = value.replace(",","newchar");
    }
    var year = parseInt(valueArray[2])
    return year;
  }

  var getMonth = function (id) {
    var valueArray = id.split(" ");
    for (var i = 0; i < valueArray.length; i++) {
      var value = valueArray[i];
      valueArray[i] = value.replace(",","newchar");
    }
    for (var i = 0; i < cal_months_labels.length; i++) {
      var monthName = cal_months_labels[i];
      var monthAbbreviation = monthName.substring(0,3);
      if (valueArray[0] == monthAbbreviation) {
        valueArray[0] = i;
      }
    }
    var month = parseInt(valueArray[0])
    return month;
  }

  var getDay = function (id) {
    var valueArray = id.split(" ");
    for (var i = 0; i < valueArray.length; i++) {
      var value = valueArray[i];
      valueArray[i] = value.replace(",","");
    }
    var day = parseInt(valueArray[1]);
    return day;
  }

  var getHour = function (id) {
    var valueArray = id.split(":")
    var array = valueArray[1].split(" ");
    var timeOfDay = array[1];
    if (timeOfDay == "PM") {
      var base12Hours = valueArray[0];
      var hours = parseInt(base12Hours);
      hours = hours + 12;
      return hours
    } else {
      var base12Hours = valueArray[0];
      var hours = parseInt(base12Hours);
      return hours;
    }
  }

  var getMinute = function (id) {
    var valueArray = id.split(":")
    var array = valueArray[1].split(" ");
    var minute = parseInt(array[0]);
    if (!(isNaN(minute))) {
      return minute;
    }
  }

  var getDate = function (id) {
    var date = parseDate(id);
    return date;
  }

  var getTime = function (today) {
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var timeOfDay;
    if (hours > 12) {
      hours = hours - 12;
      timeOfDay = "PM";
    } else {
      timeOfDay = "AM";
    }
    if (minutes < 10) {
      minutes = "0"+minutes;
    }
    if (hours == 0) {
      hours = 12;
    }
    var time = "" + hours + ":" + minutes + " " + timeOfDay;
    return time
  }

  var parseDate = function (cssID) {
    if (cssID != undefined) {
      var id = cssID;
      id = cssID.replace("#","");
      var dateValueArray = id.split("-");
      if (dateValueArray.length > 1) {
        var day = dateValueArray[0];
        var month = dateValueArray[1];
        var year = dateValueArray[2];
        month = cal_months_labels[month];
        month = month.substring(0,3);
        id = month + " " + day + ", " + year;
        return id;
      }
      return cssID
    } else {
      return null;
    }

  }

  var invitePeopleInputEvent = function (event,ele) {
    if (event.keyCode == 13) {
      var totalPeople = $('.invitee').length;
      var value = '<span class="invitee"><span id="'+totalPeople+'">'+$(ele).val()+'</span><span onclick="calendarApp.removeInvitedPerson(this)" class="remove-invitee">X</span></span>';
      $('.invite-container').append(value);
      $(ele).val("");
    }
  }

  var removeInvitee = function (ele) {
    $(ele).parent().hide(200,function () {
      $(ele).parent().remove();
    })
  }

  var addUrlToContainerOnEnter = function (event,ele) {
    if (event.keyCode == 13) {
      var totalURLS = $('.url').length;
      var value = '<span class="url"><span id="'+totalURLS+'">'+$(ele).val()+'</span><span onclick="calendarApp.removeInvitedPerson(this)" class="remove-invitee">X</span></a>';
      $('.urls-container').append(value);
      $(ele).val("");
    }
  }

  var showHiddenIFrame = function (ele) {
    var value = $(ele).text();
    var link = value.split(" ")
    value = link[1];
    var websiteName = getWebsiteName(link[1]);
    $('.hidden-iframe-container').slideDown(200);
    $('.website-name').text(websiteName);
    $('.hidden-iframe').prop("src",value);
    $('.loader').show(0);
    setTimeout(function () {
      hideCalMenuCreate();
      $('.popup-menu').hide();
    }, 1);

  }

  var getWebsiteName = function (url) {
    var valueArray = url.split(":");
    valueArray = valueArray[1].split(".");
    valueArray = valueArray[0].split("/");
    var name = valueArray[2];
    return name;
  }

  //jQuery checkmark events to toggle creation objects

  $('[name="longevent"]').click(function () {
    if ($(this).prop("checked")) {
      $("[name=date2]").fadeIn(200);
    } else {
      $("[name=date2]").fadeOut(200);
    }
  })

  $('[name="allday"]').click(function() {
    if ($(this).prop("checked")) {
      $('[name="time1"]').val("12:00 AM");
      $('[name="time2"]').val("11:59 PM");
    }
  })

  //check if button clicked

  $('[name="createEvent"]').click(function () {
    if (!($(this).prop("disabled"))) {
      var length = calendarEventsArray.length;
      getCalEventMenuData();
      calendarEventsArray[length].generateHtmlSkeleton();
      hideCalMenuCreate();
    }
  })

  //close calevent creation on esc key

  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      $('.create-calendar-event').hide();
      $('.popup-menu').hide();
    }
  })

  //back to calendar
  $('.back').click(function () {
    $('.hidden-iframe-container').slideUp(200);
    $('.hidden-iframe').prop("src","");
  })

  //scroll long names
  var scrollName = function (ele) {
    console.log('needs work');
  }

  //showCalendarEvent
  var showCalendarEvent = function (ele,event) {
    setTimeout(hideCalMenuCreate,1);
    var selectorID = $(ele).prop("id");
    var calEvent = getCalEventByID(selectorID);
    var menu = $(ele).find('.popup-menu');
    var triangle = $(ele).find('.triangle-up');
    var scrollOffsetY = (window.pageYOffset || document.scrollTop) - (document.clientTop || 0);
    setTimeout(function () {
      menu.show();
      triangle.show();
    }, 3);
    if (! isNaN(scrollOffsetY)) {
      menu.css({
        position:"absolute",
        top: event.clientY + 25 + scrollOffsetY,
        left: event.clientX - 220
      });
      triangle.css({
        position:"absolute",
        top:-25,
        left:200
      })
    } else {
      menu.css({
        position:"absolute",
        top: event.clientY + 25,
        left: event.clientX - 220
      });
      triangle.css({
        position:"absolute",
        top:-25,
        left:200
      })
    }

  }

  var hideCalMenuCreate = function () {
    var section = $('.create-calendar-event');
    var triangle = $('.create-calendar-event').find('.triangle-up');
    section.stop();
    triangle.stop();
    section.hide();
    triangle.hide();
  }

  $("#iframe").on("load", function () {
    $('.loader').hide(0);
  });

  //refresh iframe
  $('.btn-refresh').click(function () {
    document.getElementById('hidden').contentWindow.location.reload(true);
  })

  var isShowing = true;
  $('.schedule-tab').click(function () {
    var container = $('.schedule-container');
    var tab = $('.schedule-tab');
    var wrapper = $('.schedule-wrapper');
    if (isShowing) {
      $('.schedule-menu').toggle();
      isShowing = false;
      tab.css({
        'padding-top':'100px',
        left:0
      })
      container.css({
        width:0
      })
      wrapper.css({
        width:50
      })
      setTimeout(function () {
        $('.schedule-container').toggle();
      }, 500);
    } else {
      isShowing = true;
      $('.schedule-container').toggle();
      $('.schedule-menu').toggle();
      tab.css({
        'padding-top':5,
        left:307
      })
      container.css({
        width:350
      })
      wrapper.css({
        width:400
      })
    }
  })

  var displaySchedule = function (ele) {
    var scheduleName = $(ele).prop("id");
    var schedule = getSchedule(scheduleName);
    if (schedule != null) {
      if (schedule.isShowing) {
        schedule.isShowing = false;
        for (var i = 0; i < schedule.calEvents.length; i++) {
          var calEvent = schedule.calEvents[i]
          calEvent.isShowing = false;
          var selectorClass = '.'+calEvent.schedule;
          $(selectorClass).hide();
        }
        schedule.colorHtml();
      } else {
        schedule.isShowing = true;
        for (var i = 0; i < schedule.calEvents.length; i++) {
          var calEvent = schedule.calEvents[i]
          calEvent.isShowing = true;
          var selectorClass = '.'+calEvent.schedule;
          $(selectorClass).show();
        }
        schedule.colorHtml();
      }
    }
  }

  var getSchedule = function (name) {
    for (var i = 0; i < scheduleArray.length; i ++) {
      if (scheduleArray[i].name == name) {
        return scheduleArray[i];
      }
    }
    return null;
  }

  //return
  return {
    start: ignition,
    changeMonth: updateMonth,
    drag: dragEle,
    drop: dropEle,
    allowDrop: allowDropEle,
    createListMenu: createList,
    invitePeopleEvent: invitePeopleInputEvent,
    removeInvitedPerson: removeInvitee,
    checkURLInputOnEnter: addUrlToContainerOnEnter,
    loadHiddenIFrame: showHiddenIFrame,
    showCalEvent: showCalendarEvent,
    hideCalEventMenu: hideCalMenuCreate,
    scrollEvent: scrollName,
    toggleSchedule: displaySchedule
  };

})(jQuery);

$(document).ready(function () {
  calendarApp.start();
});
