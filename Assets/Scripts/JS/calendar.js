var jsonfile = require('jsonfile');
var request = require('request');

var file = '/Users/EvanCoulson/calendardata.json';

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
  var isShowing = true;
  var createMenuIsShowing = false;
  var isScheduleShowing = false;
  var longEventIsChecked = false;
  var allDayIsChecked = false;
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
    html += '<tr class="month-label"><th colspan="7"><span class="prev-month" onclick="calendarApp.changeMonth(-1)"><</span><span onclick="calendarApp.showCurrentMonth()" class="today">Today</span><span class="next-month" onclick="calendarApp.changeMonth(1)">></span>';
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
              html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(day+'-'+this.month+'-'+this.year)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container-weekend '+cal_days_labels[j].toLowerCase()+'">';
            } else {
              html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(day+'-'+this.month+'-'+this.year)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container '+cal_days_labels[j].toLowerCase()+'">';
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
              html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(prevDays+'-'+previousMonth+'-'+previousYear)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container-weekend '+cal_days_labels[j].toLowerCase()+'">';
            } else {
              html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(prevDays+'-'+(previousMonth)+'-'+previousYear)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container '+cal_days_labels[j].toLowerCase()+'">';
            }
            html += '<span class="outside-of-day-range">'+prevDays+'</span>';
          }
        }
        else {
          var nextDays = day - monthLength;
          if (j == 0 || j == 6) {
            html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(nextDays+'-'+(nextMonth)+'-'+nextYear)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container-weekend '+cal_days_labels[j].toLowerCase()+'">';
          } else {
            html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(nextDays+'-'+(nextMonth)+'-'+nextYear)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container '+cal_days_labels[j].toLowerCase()+'">';
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
    $('.calendar-section').append(html);
    for (var i = 0; i < scheduleArray.length; i ++) {
      for (var j = 0; i < scheduleArray[i].calEvents.length; j++) {
        var calEvent = scheduleArray[i].calEvents[j];
        calEvent.appendCalendarEvent();
        calEvent.colorHtml();
      }
    }
  };

  Calendar.prototype.changeToToday = function () {
    this.month = cal_current_date.getMonth();
    this.year = cal_current_date.getFullYear();
    this.generateHtmlSkeleton();
    var html = this.getHtmlSkeleton();
    $('.calendar-container').remove();
    $('.calendar-section').append(html);
    for (var i = 0; i < scheduleArray.length; i ++) {
      for (var j = 0; i < scheduleArray[i].calEvents.length; j++) {
        var calEvent = scheduleArray[i].calEvents[j];
        calEvent.generateHtmlSkeleton();
        calEvent.appendCalendarEvent();
        calEvent.colorHtml();
      }
    }
  };

  //========================================
  //||                                    ||
  //||            Cal Events              ||
  //||                                    ||
  //========================================

  function CalendarEvent(name,date,date1,schedule) {
    this.name = name;
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
    this.weekDay = cal_days_labels[date.getDay()].toLowerCase();
    var timeStamp = new Date(this.year,this.month,this.day,this.hour,this.minute,0,1000);
    this.timeString = getTime(timeStamp);
    this.selectorID = '#'+this.day+'-'+this.month+'-'+this.year;
    this.selectorID2 = '#'+this.endDay+'-'+this.endMonth+'-'+this.endYear;
    this.repeatSelectorID = [];
    this.customRepeat = null;
    this.html = '';
    var calSchedule = getSchedule(this.schedule);
    calSchedule.calEvents.push(this);
    writeJSONData();
  }

  CalendarEvent.prototype.generateHtmlSkeleton = function () {
    var scrollOffsetY = (window.pageYOffset || document.scrollTop) - (document.clientTop || 0);
    var schedule = getSchedule(this.schedule);
    var html = '<div onclick="calendarApp.showCalEvent(this,event)" draggable="true" ondragstart="calendarApp.drag(event)" onmouseenter="calendarApp.scrollEvent(this);" class="calendar-event '+schedule.selectorID+'" id="'+this.selectorID+'"><span class="calendar-event-name">'  +this.name+'</span><span class="calendar-event-time">'+this.timeString+'</span><div class="popup-menu"><div class="triangle-up"></div><div class="popup-menu-wrapper"><div class="popup-menu-container"><h1 class="popup-title">'+this.name+'</h1>';
    if (this.oneDay) {
      var id = generateSelectorID(this.year,this.month,this.day)
      var date = getDate(id);
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
    $('.'+schedule.selectorID).css("background-color",schedule.color);
    $('.'+schedule.selectorID).find('.calendar-event-time').css("background-color",schedule.color);
  };

  CalendarEvent.prototype.getRepeatSelectorsForMonth = function () {
    this.repeatSelectorID = [];
    var repeatType = this.repeat;
    if (this.repeat != 'None') {
      var parsedDate = parseDate(this.selectorID);
      var month = cal.month;
      var day = getDay(parsedDate);
      var year = cal.year;
      var numOfDaysInMonth = cal_days_in_months[month];
      switch (this.repeat) {
        case 'Every Day':
        if ((month >= this.month && year == this.year) || year > this.year) {
          if (month == this.month && this.year == year) {
            for (var i = day; i < numOfDaysInMonth; i++) {
              var repeatSelectorID = '#'+(i+1)+'-'+month+'-'+year;
              this.repeatSelectorID.push(repeatSelectorID);
            }
          } else {
            for (var i = 0; i < numOfDaysInMonth; i++) {
              var repeatSelectorID = '#'+(i+1)+'-'+month+'-'+year;
              this.repeatSelectorID.push(repeatSelectorID);
            }
          }
        }
        break;
        case 'Every Week':
        if ((month >= this.month && year == this.year) || year > this.year) {
          if (month == this.month && this.year == year) {
            for (var i = day; i <= numOfDaysInMonth; i++) {
              if ((i - day) % 7 == 0 && i != day) {
                var repeatSelectorID = '#'+(i)+'-'+month+'-'+year;
                this.repeatSelectorID.push(repeatSelectorID);
              }
            }
          }
          else {
            var repeatSelectorID = '.'+(this.weekDay);
            var ids = [];
            $(repeatSelectorID).each(function (index, value) {
              id = '#'+$(this).prop("id");
              ids.push(id);
            })
            for (var i = 0; i < ids.length; i++) {
              console.log(ids[i]);
              this.repeatSelectorID.push(ids[i]);
            }
          }
        }
        break;
        case 'Every Month':
        if ((month > this.month && year == this.year) || year > this.year) {
          var repeatSelectorID = '#'+day+'-'+month+'-'+year;
          this.repeatSelectorID.push(repeatSelectorID);
        }
        break;
        case 'Every Year':
        if ((month > this.month && year == this.year) || year > this.year) {
          var repeatSelectorID = '#'+day+'-'+this.month+'-'+year;
          this.repeatSelectorID.push(repeatSelectorID);
        }
        break;
        case 'Custom':

        break;
        default:
          break;
      }
    }
  }

  CalendarEvent.prototype.appendCalendarEvent = function () {
    this.getRepeatSelectorsForMonth();
    this.generateHtmlSkeleton();
    if (this.repeatSelectorID.length > 0) {
      var originalYear = this.year;
      var originalDay = this.day;
      var originalMonth = this.month;
      $(this.selectorID).append(this.getHtmlSkeleton());
      for (var i = 0; i < this.repeatSelectorID.length; i++) {
        var selectorDate = getDateHtmlID(this.repeatSelectorID[i]);
        console.log(selectorDate);
        this.month = selectorDate.getMonth();
        this.year = selectorDate.getFullYear();
        this.day = selectorDate.getDate();
        this.generateHtmlSkeleton();
        $(this.repeatSelectorID[i]).append(this.getHtmlSkeleton());
        this.year = originalYear;
        this.month = originalMonth;
        this.day = originalDay;
      }
    } else {
      $(this.selectorID).append(this.getHtmlSkeleton());
    }
  };

  //getters

  var getCalEventByID = function(id) {
    for (var i = 0; i < scheduleArray.length; i ++) {
      for (var j = 0; i < scheduleArray[i].calEvents.length; j++) {
        if (scheduleArray[i].calEvents[j].selectorID == id) {
          return scheduleArray[i].calEvents[j];
        }
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
    this.selectorID = parseName(this.name)
    this.html = '';
    scheduleArray.push(this);
  }

  Schedule.prototype.generateHtmlSkeleton = function () {
    var html = '<li onclick="calendarApp.toggleSchedule(this)" class="schedule-info" id="'+this.selectorID+'"><span class="schedule-color"></span><span class="schedule-name">'+this.name+'</span></li><br>';
    this.html = html;
  };

  Schedule.prototype.getHtmlSkeleton = function () {
    return this.html;
  };

  Schedule.prototype.colorHtml = function () {
    var id = '#'+this.selectorID;
    if (this.isShowing) {
       $('.schedule-list').find(id).find('.schedule-color').css('background-color',this.color);
    } else {
      $('.schedule-list').find(id).find('.schedule-color').css('background-color','rgb(187,187,187)');
    }

  };

  //========================================
  //||                                    ||
  //||          Custom Repeat             ||
  //||                                    ||
  //========================================

  function CustomRepeat(type,interval) {
    this.type = type;
    this.interval = interval;
    this.dayOfWeek = null;
    this.dayOfMonth = null;
    this.monthString = null;
    this.monthOfYear = null;
    this.yearString = null;
  }

  //functions
  var ignition = function () {
    showSchedules();
    cal.generateHtmlSkeleton();
    $('.calendar-section').append(cal.getHtmlSkeleton())
    var schedule = new Schedule('Default','yellow');
    schedule.generateHtmlSkeleton();
    $('.schedule-list').append(schedule.getHtmlSkeleton());
    schedule.colorHtml();
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
      $('.scheduele-selector').find('#scheduleOpt').remove();
    }
    for (var i = 0; i < scheduleArray.length; i++) {
      html += '<option id="scheduleOpt">'+scheduleArray[i].name+'</option>';
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

    //Test for custom inputs
    if (repeat == 'Custom') {
      var type = $('.custom-repeat-selector').val();
      var interval = $('.repeat-delay-data').val();
      if (type == 'daily') {
        var customRepeat = new CustomRepeat(type,interval);
        calEvent.customRepeat = customRepeat;
      } else if (type == 'weekly') {
        var daysOfWeek = [];
        var selectableDays = document.querySelectorAll("#active");
        for (var i = 0; i < selectableDays.length; i++) {
          var day = selectableDays[i];
          day = $(day).find('span').prop("id");
          daysOfWeek.push(day);
        }
        var customRepeat = new CustomRepeat(type,interval)
        customRepeat.dayOfWeek = daysOfWeek;
      } else if (type == 'monthly') {
        var daysOfMonth = [];
        var selectableDays = document.querySelectorAll("#active");
        for (var i = 0; i < selectableDays.length; i++) {
          var day = selectableDays[i];
          day = $(day).find('span').prop("class");
          daysOfMonth.push(day);
        }
        var customRepeat = new CustomRepeat(type,interval);
        customRepeat.dayOfMonth = daysOfMonth;
      } else if (type == 'yearly') {
        var months = [];
        var selectableMonths = document.querySelectorAll("#active");
        for (var i = 0; i < selectableMonths.length; i++) {
          var month = selectableMonths[i];
          month = $(month).find('span').prop("class");
          months.push(month);
        }
        console.log(months);
        var customRepeat = new CustomRepeat(type,interval);
        customRepeat.monthOfYear = months;
      }
    }

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
    calEvent.generateHtmlSkeleton();
    calEvent.appendCalendarEvent();
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

  var getDateHtmlID = function (cssID) {
    if (cssID != undefined) {
      var id = cssID;
      id = cssID.replace("#","");
      var dateValueArray = id.split("-");
      if (dateValueArray.length > 1) {
        var day = dateValueArray[0];
        var month = dateValueArray[1];
        var year = dateValueArray[2];
        var date = new Date(year,month,day,0,0,0,0);
        return date;
      } else {
        return null;
      }
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
      getCalEventMenuData();
      hideCalMenuCreate();
      clearCreateEvent();
    }
  })

  //close calevent creation on esc key

  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      $('.create-calendar-event').hide();
      $('.popup-menu').hide();
      clearCreateEvent();
    }
  })

  //back to calendar
  $('.back').click(function () {
    $('.hidden-iframe-container').slideUp(200);
    $('.hidden-iframe').prop("src","");
  })

  //scroll long names
  var scrollName = function (ele) {
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

  var showSchedules = function () {
    var container = $('.schedule-container');
    var tab = $('.schedule-tab');
    var wrapper = $('.schedule-wrapper');
    if (isShowing) {
      if (createMenuIsShowing) {
        $('.create-schedule-menu').hide();
        $('.create-schedule-btn').show();
        createMenuIsShowing = false;
      }
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
      // $('.create-schedule-menu').toggle();
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
  }

  var displaySchedule = function (ele) {
    var scheduleID = $(ele).prop("id");
    var schedule = getSchedule(scheduleID);
    if (schedule != null) {
      if (schedule.isShowing) {
        schedule.isShowing = false;
        for (var i = 0; i < schedule.calEvents.length; i++) {
          var calEvent = schedule.calEvents[i]
          calEvent.isShowing = false;
          var schedule = getSchedule(calEvent.schedule)
          var selectorClass = '.'+schedule.selectorID;
          $(selectorClass).hide();
        }
        schedule.colorHtml();
      } else {
        schedule.isShowing = true;
        for (var i = 0; i < schedule.calEvents.length; i++) {
          var calEvent = schedule.calEvents[i]
          calEvent.isShowing = false;
          var schedule = getSchedule(calEvent.schedule)
          var selectorClass = '.'+schedule.selectorID;
          $(selectorClass).show();
        }
        schedule.colorHtml();
      }
    }
  }

  var getSchedule = function (id) {
    for (var i = 0; i < scheduleArray.length; i ++) {
      if (scheduleArray[i].selectorID == id) {
        return scheduleArray[i];
      }
    }
    for (var i = 0; i < scheduleArray.length; i++) {
      if (scheduleArray[i].name == id) {
        return scheduleArray[i];
      }
    }
    return null;
  }

  $('.create-schedule-btn').click(function () {
    $(this).slideUp(200,function () {
      $('.create-schedule-menu').slideDown(500);
    });
    createMenuIsShowing = true;
  })

  $('.create-schedule-close').click(function () {
    $('.create-schedule-menu').slideUp(500,function () {
      $('.create-schedule-btn').slideDown(200);
    });
    createMenuIsShowing = false;
  })

  $('.color-table').click(function () {
    $(this).fadeToggle();
  })

  $('#color').click(function () {
    $('.color-table').fadeToggle();
  })

  $('.color-1-1').click(function () {
    $('#color').css("background-color","rgb(249, 68, 68)")
  })
  $('.color-1-2').click(function () {
    $('#color').css("background-color","rgb(252, 157, 14)")
  })
  $('.color-1-3').click(function () {
    $('#color').css("background-color","yellow")
  })
  $('.color-2-1').click(function () {
    $('#color').css("background-color","rgb(153, 235, 19)")
  })
  $('.color-2-2').click(function () {
    $('#color').css("background-color","rgb(81, 227, 12)")
  })
  $('.color-2-3').click(function () {
    $('#color').css("background-color","rgb(24, 215, 181)")
  })
  $('.color-3-1').click(function () {
    $('#color').css("background-color","rgb(18, 64, 227)")
  })
  $('.color-3-2').click(function () {
    $('#color').css("background-color","rgb(169, 23, 231)")
  })
  $('.color-3-3').click(function () {
    $('#color').css("background-color","rgb(231, 22, 204)")
  })

  $('.finalize-schedule').click(function () {
    var name = getScheduleName();
    var color = getColor();
    var schedule = new Schedule(name,color);
    schedule.generateHtmlSkeleton();
    $('.schedule-list').append(schedule.getHtmlSkeleton());
    schedule.colorHtml();
    clearCreateSchedule();
    writeJSONData();
  })

  function getScheduleName() {
    var name = $('[name="schedulename"]').val();
    return name;
  }

  function getColor() {
    var color = $('#color').css("background-color");
    return color;
  }

  function clearCreateSchedule() {
    $('[name="schedulename"]').val('');
    $('#color').css("background-color","rgb(249, 68, 68)");
    $('.create-schedule-menu').slideUp(500,function () {
      $('.create-schedule-btn').slideDown(200);
    });
  }

  function clearCreateEvent() {
    $('[name=traveltime]').val('');
    var invitesLength = $('.invitee').length;
    var urlLength = $('.url').length;
    for (var i = 0; i < invitesLength; i++) {
      $('.invitee').remove();
    }
    for (var i = 0; i < urlLength; i++) {
      $('.url').remove();
    }
    $('[name=location]').val('');
    $('[name=notes]').val('');
    // var urls = getURLS(totalURLS);
    $('[name=listSelector]').val('');
    $('[name=schedueleSelector]').val('');
  }

  function parseName(name) {
    var id = name;
    id = id.replace(/\W/g,'');
    return id;
  }

  var showToday = function () {
    cal.changeToToday();
  }

  var generateSelectorID = function (year,month,day) {
    var id = '#'+day+'-'+month+'-'+year;
    return id;
  }

  var writeJSONData = function () {
    jsonfile.writeFile(file, scheduleArray, function (err) {
      console.log(err);
    })
  }

  $('.repeat-selector').on("change",function () {
    isCustom(this);
  })

  var onCustomSelectChange = function (ele) {
    var value = $(ele).val();
    console.log(value);
    if (value == 'daily') {
      generateCustomRepeatDailyHtml();
    }
    if (value == 'weekly') {
      generateCustomRepeatWeeklyHtml();
    }
    if (value == 'monthly') {
      generateCustomRepeatMonthlyHtml();
    }
    if (value == 'yearly') {
      generateCustomRepeatYearlyHtml();
    }
  }

  var isCustom = function (ele) {
    var value = $(ele).val();
    var id = $(ele).prop("class");
    if (value == "Custom") {
      if (id == 'repeat-selector') {
        $('.custom-wrapper').show();
        $('.custom-repeat-container').show();
        generateCustomRepeatDailyHtml();
      } else {
        $('.custom-wrapper').show();
        $('.custom-alert-container').show();
      }
    }
  }

  var generateCustomRepeatDailyHtml = function () {
    var html = '<div class="custom-repeat"><div class="repeat-delay"><br><span class="repeat-delay-text">Every </span><input type="text" class="repeat-delay-data"><span class="repeat-delay-text"> day(s)</span></div><br><button type="button" name="cancel">Cancel</button><button type="button" name="ok">Ok</button></div>';
    $('.custom-repeat').remove();
    $('.custom-repeat-container').append(html);
  }
  var generateCustomRepeatWeeklyHtml = function () {
    var html = '<div class="custom-repeat"><div class="repeat-delay"><br><span class="repeat-delay-text">Every </span><input type="text" class="repeat-delay-data"><span class="repeat-delay-text"> week(s) on:</span></div><br><div class="month-selector"><div class="selectable-day" onclick="calendarApp.toggleDay(this)"><span id="sun">S</span></div><div class="selectable-day" onclick="calendarApp.toggleDay(this)"><span id="mon">M</span></div><div class="selectable-day" onclick="calendarApp.toggleDay(this)"><span id="tue">T</span></div><div class="selectable-day" onclick="calendarApp.toggleDay(this)"><span id="wed">W</span></div><div class="selectable-day" onclick="calendarApp.toggleDay(this)"><span id="thu">T</span></div><div class="selectable-day" onclick="calendarApp.toggleDay(this)"><span id="fri">F</span></div><div class="selectable-day" onclick="calendarApp.toggleDay(this)"><span id="sat">S</span></div></div><br><button type="button" name="cancel">Cancel</button><button onclick="calendarApp.finalizeCustomRepeat()" type="button" name="ok">Ok</button></div>';
    $('.custom-repeat').remove();
    $('.custom-repeat-container').append(html);
  }

  var generateCustomRepeatMonthlyHtml = function () {
    var html = '<div class="custom-repeat"><div class="repeat-delay"><br><span class="repeat-delay-text">Every </span><input type="text" class="repeat-delay-data"><span class="repeat-delay-text"> month(s)</span></div><br><div class="day-selector">';
    for (var i = 0; i < 31; i++) {
      html += '<div class="selectable-day" onclick="calendarApp.toggleDay(this)"><span class="'+(i+1)+'" id="mon">'+(i+1)+'</span></div>';
    }
    html += '</div><br><button type="button" name="cancel">Cancel</button><button onclick="calendarApp.finalizeCustomRepeat()" type="button" name="ok">Ok</button></div>';
    $('.custom-repeat').remove();
    $('.custom-repeat-container').append(html);
  }

  var generateCustomRepeatYearlyHtml = function () {
    var html = '<div class="custom-repeat"><div class="repeat-delay"><br><span class="repeat-delay-text">Every </span><input type="text" class="repeat-delay-data"><span class="repeat-delay-text"> year(s) in:</span></div><br><div class="full-month-selector">';
    for (var i = 0; i < 12; i++) {
      html += '<div class="selectable-day" onclick="calendarApp.toggleDay(this)"><span class="'+cal_months_labels[i]+'" id="mon">'+(cal_months_labels[i].substring(0,3))+'</span></div>';
    }
    html += '</div><br><button type="button" name="cancel">Cancel</button><button onclick="calendarApp.finalizeCustomRepeat()" type="button" name="ok">Ok</button></div>';
    $('.custom-repeat').remove();
    $('.custom-repeat-container').append(html);
  }

  var selectDay = function (ele) {
    var id = $(ele).prop("id");
    if (id == "active") {
      $(ele).prop("id","");
    } else {
      $(ele).prop("id","active");
    }
  }

  var finalizeRepeatMenu = function () {
    $('.custom-wrapper').hide();
    $('.custom-repeat-container').hide();
  };

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
    toggleSchedule: displaySchedule,
    showScheduleMenu: showSchedules,
    showCurrentMonth: showToday,
    testIfCustom: isCustom,
    toggleDay: selectDay,
    onCustomChange: onCustomSelectChange,
    finalizeCustomRepeat: finalizeRepeatMenu
  };

})(jQuery);

$(document).ready(function () {
  calendarApp.start();
});
