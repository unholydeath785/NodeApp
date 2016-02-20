var jsonfile = require('jsonfile');
var request = require('request');

var calendarApp = (function ($) {
  //Gloabl for fall back in case of nessacary excess functions
  var CalendarEventsArray = []
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
  var cal = new Calendar(2,2016);

  Calendar.prototype.generateHtmlSkeleton = function () {
    //variables
    var firstDay = new Date(this.year,this.month,1);
    var startingDay = firstDay.getDay();
    var monthLength = cal_days_in_months[this.month];
    var monthName = cal_months_labels[this.month];
    var day = 1;

    //compensate for leap year
    if (this.month == 1) {
      if ((this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0) {
        monthLength = 29;
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
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 7; j++) {
        html += '<td onclick="calendarApp.createListMenu(this,event)" id="'+(day+'-'+this.month+'-'+this.year)+'" ondrop="calendarApp.drop(event)" ondragover="calendarApp.allowDrop(event)" class="day-container">';
        if (day <= monthLength && (i > 0 || j >= startingDay)) {
          html += '<span class="date">'+day+'</span>';
          day ++;
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
    var html = this.getHtmlSkeleton()
    $('.calendar-container').remove();
    $('.calendar-section').append(cal.getHtmlSkeleton())
  };

  //========================================
  //||                                    ||
  //||            Cal Events              ||
  //||                                    ||
  //========================================

  function CalendarEvent(name,year,month,day,hour,minute) {
    this.name = name;
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.selectorID = '#'+this.day+'-'+this.month+'-'+this.year;
    this.html = '';
    CalendarEventsArray.push(this);
  }

  CalendarEvent.prototype.generateHtmlSkeleton = function () {
    var html = '<div draggable="true" ondragstart="calendarApp.drag(event)" class="calendar-event" id="'+this.id+'"><span class="calendar-event-name">'+this.name+'</span><span class="calendar-event-time">'+this.hour+':'+this.minute+'</span></div>'
    this.html = html;
  };

  CalendarEvent.prototype.getHtmlSkeleton = function () {
    return this.html
  }

  //functions
  var ignition = function () {
    cal.generateHtmlSkeleton();
    $('.calendar-section').append(cal.getHtmlSkeleton())
    var calEvent = new CalendarEvent("Test",2016,2,18,10,30)
    calEvent.generateHtmlSkeleton();
    $(calEvent.selectorID).append(calEvent.getHtmlSkeleton());
  }

  var updateMonth = function (changeMonthVal) {
    cal.changeMonth(changeMonthVal);
  }

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

  var createList = function (ele,event) {
    var section = $('.create-calendar-event');
    var triangle = $('.triangle-up');
    console.log(event.clientY)
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

    var delayTimer = setTimeout(function () {
      section.fadeIn("slow");
      triangle.fadeIn("slow");
    })
  }

  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      $('.create-calendar-event').fadeOut("slow");
    }
  })

  $('body').click(function () {
    $('table').click(function () {
      return false;
    })
    $('.create-calendar-event').click(function () {
      return false;
    })
    $('.create-calendar-event').fadeOut("slow");
    return true;
  })

  //return
  return {
    start: ignition,
    changeMonth: updateMonth,
    drag: dragEle,
    drop: dropEle,
    allowDrop: allowDropEle,
    createListMenu: createList
  };

})(jQuery);

$(document).ready(function () {
  calendarApp.start();
});
