
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/*
var Logger = {
    log: function(txt, obj) {
        if(Environment.debug())
            console.log(txt, obj);
    }
};
*/
/*
Date.prototype.addMonths = function(mon) {
   this.setMonth(this.getMonth()+mon);
   return this;
}
Date.prototype.addHours = function(hrs) {
   this.setHours(this.getHours()+hrs);
   return this;
}
Date.prototype.addMinutes = function(min) {
   this.setMinutes(this.getMinutes()+min);
   return this;
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
    // return this.getItem(key) && JSON.parse(this.getItem(key));
}

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for(i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
}
*/
var apiDomain = Environment.baseApiUrl();
// var Api, Util;
allEntities = ["todo", "note", "Event", "Birthday", "Anniversary"];
eventsEntities = allEntities.slice(2, 5);//[Event, Birthday, Anniversary];
allEntitiesMap = new Array();
entitiesItemSaverMap = new Array();
eventEntitiesFailMap = new Array();
retainableKeys = ['unsaved_todo_count', 'unsaved_note_count', 'unsaved_Event_count', 'unsaved_Birthday_count', 
    'unsaved_Anniversary_count', 'tasks_mover_delay', 'hide_tasks_timestamp', 'pin_code', 'tmp_pin_code', 
    'auto_sync', 'auto_login', 'daily_notif_time', 'feed'];

var Init = {
    resetAllEntitiesMapping: function() {
        allEntitiesMap = new Array();
        allEntitiesMap[allEntities[0]] = "todo";
        allEntitiesMap[allEntities[1]] = "note";
        allEntitiesMap[allEntities[2]] = "event";
        allEntitiesMap[allEntities[3]] = "birthday";
        allEntitiesMap[allEntities[4]] = "anniversary";
    },
    
    resetAllEntitiesSaverMapping: function() {
        entitiesItemSaverMap = new Array();
        entitiesItemSaverMap[allEntities[0]] = Util.itemLocalSaverCB;
        entitiesItemSaverMap[allEntities[1]] = Util.itemLocalSaverCB;
        entitiesItemSaverMap[allEntities[2]] = Util.eventLocalSaverCB;
        entitiesItemSaverMap[allEntities[3]] = Util.occasionLocalSaverCB;//Util.eventLocalSaverCB;
        entitiesItemSaverMap[allEntities[4]] = Util.occasionLocalSaverCB;//Util.eventLocalSaverCB;
    },
    
    resetEntitiesCounter: function() {
        var user_id = Api.getLocalStorageProp('user_id');
        if(!Ext.isEmpty(user_id)) {
            Ext.each(allEntities, function(entity, i, allItems) { 
                if(Ext.isEmpty(localStorage['unsaved_'+Api.pluralize(entity)+'_count_'+user_id]))
                    localStorage['unsaved_'+Api.pluralize(entity)+'_count_'+user_id] = 0; 
                });
        }
    },
    
    resetTasksMoverTimeStamps: function() {
        var user_id = Api.getLocalStorageProp('user_id');
        if(!Ext.isEmpty(user_id)) {
            if(Api.getLocalStorageProp('tasks_mover_delay_'+user_id) === undefined)
                Api.setLocalStorageProp('tasks_mover_delay_'+user_id, 24);
            
            if(Api.getLocalStorageProp('hide_tasks_timestamp_'+user_id) === undefined)
                Api.setLocalStorageProp('hide_tasks_timestamp_'+user_id, Api.formatToUTCDate(new Date()));
        }
    },
    
    resetEventsTimeWindow: function() {
        var startDate = new Date().getFirstDateOfMonth().add(Date.MONTH, -1);
        var endDate = new Date().getFirstDateOfMonth().add(Date.MONTH, 2);
        
        Api.setLocalStorageProp('events_start_time', Api.formatToUTCDate(startDate));
        Api.setLocalStorageProp('events_end_time', Api.formatToUTCDate(endDate));
    },
    
    resetPincode: function() {
        var user_id = Api.getLocalStorageProp('user_id');
        if(!Ext.isEmpty(user_id)) {
            if(Api.getLocalStorageProp('pin_code_'+user_id) === undefined)
                Api.setLocalStorageProp('pin_code_'+user_id, '');
            if(Api.getLocalStorageProp('tmp_pin_code_'+user_id) === undefined)
                Api.setLocalStorageProp('tmp_pin_code_'+user_id, '');
        }
        if(Api.getLocalStorageProp('tmp_pin_code2') === undefined)
            Api.setLocalStorageProp('tmp_pin_code2', '');
    },
    
    resetAutoDefaults: function() {
        var user_id = Api.getLocalStorageProp('user_id');
        if(!Ext.isEmpty(user_id)) {
            if(Api.getLocalStorageProp('auto_sync_'+user_id) === undefined)
                Api.setLocalStorageProp('auto_sync_'+user_id, 1);
            if(Api.getLocalStorageProp('auto_login_'+user_id) === undefined)
                Api.setLocalStorageProp('auto_login_'+user_id, 1);
            if(Api.getLocalStorageProp('daily_notif_time_'+user_id) === undefined)
                Api.setLocalStorageProp('daily_notif_time_'+user_id, '08:00');
        }
    },
    
    resetDayOptions: function() {
        day_options = new Array();
        var dayItem;
        for(var day = 1; day <= 31; day++) {
            dayItem = new Object();
            dayItem.text = day+'';
            dayItem.value = day+'';
            day_options.push(dayItem);
        }
    },
    
    resetHourOptions: function() {
        hour_options = new Array();
        var hourItem, paddedHour;
        for(var hour = 0; hour < 24; hour++) {
            hourItem = new Object();
            paddedHour = Ext.util.Format.leftPad(hour, 2, '0');
            
            hourItem.text = paddedHour;
            hourItem.value = paddedHour;
            hour_options.push(hourItem);
        }
    },

    resetMinuteOptions: function() {
        min_options = new Array();
        var minItem, paddedMin;
        for(var min = 0; min < 60; min++) {
            minItem = new Object();
            paddedMin = Ext.util.Format.leftPad(min, 2, '0');
            minItem.text = paddedMin;
            minItem.value = paddedMin;
            min_options.push(minItem);
        }
    },

	resetFeedsItems: function() {
		Util.logger('resetFeedsItems called');
		var user_id = Api.getLocalStorageProp('user_id');
		var todate = Api.formatToUTCDate(new Date());
		
        if(!Ext.isEmpty(user_id) && Ext.isEmpty(Api.getLocalStorageProp('feed_'+user_id+'[0]'))) {
			Api.clearLocalStorage('feed');
			
/*
			Api.setLocalStorageProp('feed_'+user_id+'[0]', Ext.encode({ id: 1, title: "BlackBerry Calendar", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 1, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[1]', Ext.encode({ id: 2, title: "GCal (Android)", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 2, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[2]', Ext.encode({ id: 3, title: "iCal (iPhone/Mac)", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 3, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[3]', Ext.encode({ id: 4, title: "Nokia Calendar", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 4, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[4]', Ext.encode({ id: 5, title: "Outlook", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 5, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[5]', Ext.encode({ id: 6, title: "Yahoo!", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 6, cl_state: 'select', client_uid: Api.randomString() }));
*/


			Api.setLocalStorageProp('feed_'+user_id+'[0]', Ext.encode({ id: 1, title: "Outlook (PC) to iCal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 1, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[1]', Ext.encode({ id: 2, title: "Outlook to GCal (Android)", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 2, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[2]', Ext.encode({ id: 3, title: "Outlook to Win7 (Nokia)", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 3, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[3]', Ext.encode({ id: 4, title: "Outlook to Yahoo Cal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 4, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[4]', Ext.encode({ id: 5, title: "Outlook to Blackberry Cal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 5, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[5]', Ext.encode({ id: 6, title: "Outlook to Windows Live!", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 6, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[6]', Ext.encode({ id: 7, title: "GCal (Android) to iCal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 7, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[7]', Ext.encode({ id: 8, title: "GCal to Outlook", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 8, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[8]', Ext.encode({ id: 9, title: "GCal to Win 7 (Nokia)", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 9, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[9]', Ext.encode({ id: 10, title: "GCal to  to Yahoo Cal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 10, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[10]', Ext.encode({ id: 11, title: "GCal to Blackberry Cal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 11, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[11]', Ext.encode({ id: 12, title: "Apple iCal to GCal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 12, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[12]', Ext.encode({ id: 13, title: "Apple iCal to win 7 (Nokia)", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 13, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[13]', Ext.encode({ id: 14, title: "Apple iCal to Yahoo Cal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 14, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[14]', Ext.encode({ id: 15, title: "Apple iCal to Blackberry Cal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 15, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[15]', Ext.encode({ id: 16, title: "Apple iCal to Windows Live!", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 16, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[16]', Ext.encode({ id: 17, title: "Win 7 (Nokia) Cal to iCal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 17, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[17]', Ext.encode({ id: 18, title: "Win 7 (Nokia) Cal to GCal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 18, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[18]', Ext.encode({ id: 19, title: "Win 7 (Nokia) Cal to Outlook", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 19, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[19]', Ext.encode({ id: 20, title: "Win 7 (Nokia) Cal to Yahoo!", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 20, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[20]', Ext.encode({ id: 21, title: "Win 7 (Nokia) Cal to Blackberry", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 21, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[21]', Ext.encode({ id: 22, title: "Windows Live! to Outlook", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 22, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[22]', Ext.encode({ id: 23, title: "Windows Live! to iCal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 23, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[23]', Ext.encode({ id: 24, title: "Windows Live! to GCal (Android)", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 24, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[24]', Ext.encode({ id: 25, title: "Windows Live! to Win 7 (Nokia)", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 25, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[25]', Ext.encode({ id: 26, title: "Windows Live! to Blackberry", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 26, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[26]', Ext.encode({ id: 27, title: "Windows Live! to Yahoo Cal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 27, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[27]', Ext.encode({ id: 28, title: "Yahoo Cal to iCal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 28, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[28]', Ext.encode({ id: 29, title: "Yahoo Cal to GCal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 29, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[29]', Ext.encode({ id: 30, title: "Yahoo Cal to Outlook", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 30, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[30]', Ext.encode({ id: 31, title: "Yahoo Cal to Win 7 (Nokia)", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 31, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[31]', Ext.encode({ id: 32, title: "Yahoo Cal to Blackberry Cal", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 32, cl_state: 'select', client_uid: Api.randomString() }));
			Api.setLocalStorageProp('feed_'+user_id+'[32]', Ext.encode({ id: 33, title: "Yahoo Cal to Windows Live!", is_selected: false, 
						created_at: todate, updated_at: todate, feed_id: 33, cl_state: 'select', client_uid: Api.randomString() }));
        }

	},
	
    initState: function() {
        Init.resetAllEntitiesMapping();
        Init.resetAllEntitiesSaverMapping();
        Init.resetEntitiesCounter();
        Init.resetTasksMoverTimeStamps();
        Init.resetEventsTimeWindow();
        Init.resetPincode();
        Init.resetAutoDefaults();
        Init.resetDayOptions();
        Init.resetHourOptions();
        Init.resetMinuteOptions();
		Init.resetFeedsItems();
    },
    
    migrateKeys: function() {
        var val,
            user_id = Api.getLocalStorageProp('user_id');
        
        if(!Ext.isEmpty(user_id)) {
            for(var key in retainableKeys) {
                val = Api.getLocalStorageProp(key)
                if(!Ext.isEmpty(val))
                    Api.setLocalStorageProp(key+'_'+user_id, val);
            
                localStorage.removeItem(key);
            }
        }
    }
};


var Api = {
    urlFor: function(endPoint) {
        return apiDomain + endPoint;
    },
    
    authParams: function(params, send_key) {
        // Util.logger('account_key is:', localStorage.account_key);
        send_key = (send_key) ? send_key : true;
        if(send_key)
            params.account_key = Api.getLocalStorageProp('account_key');
            
        return params;
    },
    
    /*It takes a normal localDateObject and returns a formattedUTCDateString*/
    formatToUTCDate: function(unfmtLocalDate) {
        // '%Y%m%d%H%M%S' --> Ruby API format
        // Util.logger('Unformatted Date is: ', unfmtLocalDate);
        if(Ext.isEmpty(unfmtLocalDate))
            return unfmtLocalDate;
            
        var fmtUTCDate = unfmtLocalDate.add(Date.MINUTE, unfmtLocalDate.getTimezoneOffset());
        
        return fmtUTCDate.format('YmdHis');
    },
    
    /*It takes a formattedUTCDateString and returns a localDateObject*/
    parseFromUTCDate: function(fmtUTCDateStr) {
        // Util.logger('Unparsed data is: ', fmtUTCDateStr);
        if(Ext.isEmpty(fmtUTCDateStr))
            return null;
            
        year = parseInt(fmtUTCDateStr.substr(0, 4), 10);
        month = parseInt(fmtUTCDateStr.substr(4, 2), 10)-1;
        date = parseInt(fmtUTCDateStr.substr(6, 2), 10);
        hrs = parseInt(fmtUTCDateStr.substr(8, 2), 10);
        mins = parseInt(fmtUTCDateStr.substr(10, 2), 10);
        secs = parseInt(fmtUTCDateStr.substr(12, 2), 10);
        
        var localDate = new Date(Date.UTC(year, month, date, hrs, mins, secs));
        // var localDate = Date.parseDate(fmtUTCDateStr, "YmdHis", true);
        // Util.logger('date is::'+year+'-'+month+'-'+date+'-'+hrs+'-'+mins+'-'+secs);
        return localDate;
    },
    
    isValidDayOfMonth: function(month, day) {
        var thirtyDayMonthArr = ['4', '6', '9', '11'];
        if((thirtyDayMonthArr.indexOf(month) != -1) && day == '31')
            return false;
        if(month == '2' && parseInt(day) > 28)
            return false;
            
        return true;
    },
    
    parseIntZero: function(str) {
        return (isNaN(parseInt(str)) ? 0 : parseInt(str));
    },
    
    pluralize: function(singular) {
        var plural = '';
        
        if( singular.substr(-1) === "y" && singular != 'birthday' && singular != 'Birthday')
            plural = singular.substr(0, singular.length-1)+'ies'; // as in party => parties
        else if( singular.substr(-2, 2) === "ss" )
            plural = singular+'es'; //as in class => classes
        else  if( singular.substr(-1) === "s" )
            plural = singular; //its already plural
        else
            plural = singular+'s'; // as in todo => todos
            
        return plural;
    },
    
    randomString: function() {
        // var length = 24;
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
        var charsLen = chars.length;
        var str = [''];
        for(var i = 0; i < 24; i++) {
            // str += chars[Math.floor(Math.random() * chars.length)];
            str.push(chars[Math.floor(Math.random() * charsLen)]);
        }
        return str.join('');
    },
    
    clearLocalStorage: function(key) {
        
        if(!Ext.isEmpty(key)) {
            Util.logger('[INFO]:: Clearing all '+key+' keys from localStorage');
            if(!Ext.isEmpty(localStorage[key]))
                localStorage.removeItem(key);
            else {
                var lKey, keys = [], count = 0, isFound = true;
                while(isFound) {
                    isFound = false;
                    keys = [];
                    for(var i = 0, ln = localStorage.length; i < ln; i++) {
                        lKey = localStorage.key(i);
                        if(lKey.indexOf(key) != -1) {
                            keys.push(lKey);
                            isFound = true;
                        }
                    }
                    for(var i = 0, ln = keys.length; i < ln; i++) {
                        localStorage.removeItem(keys[i]);
                    }
                    count++;
                }
                Util.logger('Keys were traversed '+count+' times');
            }
        } else {
            Util.logger('[WARN]:: Clearing all KEYS from localStorage');
            //these are all the user-defined or retainable keys
            var retainableKeysMap = {unsaved_todo_count: 0, unsaved_note_count: 0, unsaved_Event_count: 0, unsaved_Birthday_count: 0, 
                unsaved_Anniversary_count: 0, tasks_mover_delay: 0, hide_tasks_timestamp: '1', pin_code: '0', tmp_pin_code: '0', 
                auto_sync: 0, auto_login: 0, daily_notif_time: '0', feed: '0'};
                
            var retainableKeyVals = {};
            for(var key in retainableKeysMap) {
                retainableKeysMap[key] = localStorage[key];
                for(var i = localStorage.length-1; i >= 0; i--) {
                    if(localStorage.key(i).indexOf(key) != -1)
                        retainableKeyVals[localStorage.key(i)] = localStorage[localStorage.key(i)];
                }
            }

            localStorage.clear(); //can also use
            /*
            for(var i = localStorage.length-1; i >= 0; i--) {
                localStorage.removeItem(localStorage.key(i));
            }
            */

            //restoring the values of retainable keys
            for(var key in retainableKeysMap) {
                localStorage[key] = retainableKeysMap[key];
            }
            
            for(var key in retainableKeyVals) {
                localStorage[key] = retainableKeyVals[key];
            }
            
        }
    },
    
    getLocalStorageSize: function(key) {
        var size = 0;
        if(!Ext.isEmpty(key)) {
            for(var i = 0, len = localStorage.length; i < len; i++) {
                if(localStorage.key(i).indexOf(key) != -1)
                    size++;
            }
        } else
            size = localStorage.length;
            
        Util.logger('size is: ', size);
        return size;
    },
    
    decrementLocalStorageKey: function(key) {
        if(Ext.isNumber(localStorage[key]) && parseInt(localStorage[key], 10) > 0)
            localStorage[key]--;
    },
    
    getLocalStorageProp: function(key) {
        if(retainableKeys.indexOf(key) != -1)
            return localStorage[key+'_'+localStorage.user_id];
        else
            return localStorage[key];
    },
    
    setLocalStorageProp: function(key, value) {
        if(retainableKeys.indexOf(key) != -1)
            localStorage[key+'_'+localStorage.user_id] = value;
        else
            localStorage[key] = value;
    },

    isSyncNeeded: function(entity) {
        if(!Ext.isEmpty(entity) && entity !== 'event_all')
            return (localStorage['unsaved_'+Api.pluralize(entity)+'_count'] > 0);
        else if(entity === 'event_all')
            return ((localStorage['unsaved_'+Api.pluralize(allEntities[2])+'_count'] > 0) ||
                  (localStorage['unsaved_'+Api.pluralize(allEntities[3])+'_count'] > 0) ||
                  (localStorage['unsaved_'+Api.pluralize(allEntities[4])+'_count'] > 0) );
        else
            return ((localStorage['unsaved_'+Api.pluralize(allEntities[0])+'_count'] > 0) ||
                  (localStorage['unsaved_'+Api.pluralize(allEntities[1])+'_count'] > 0) ||
                  (localStorage['unsaved_'+Api.pluralize(allEntities[2])+'_count'] > 0) ||
                  (localStorage['unsaved_'+Api.pluralize(allEntities[3])+'_count'] > 0) ||
                  (localStorage['unsaved_'+Api.pluralize(allEntities[4])+'_count'] > 0));
    },
    
    isEventsCurrentWindow: function() {
        var now = new Date(),
            eventsStartTime = Api.parseFromUTCDate(Api.getLocalStorageProp('events_start_time')),
            eventsEndTime = Api.parseFromUTCDate(Api.getLocalStorageProp('events_end_time'));
        
        if(now > eventsStartTime && now < eventsEndTime)
            return true;
            
        return false;
    },
    
    getButtonBase: function(btnText, isHidden, cssCls, handlerCB) {
        return {
            text: btnText,
            hidden: isHidden,
            handler: handlerCB,
            cls: cssCls,
            scope: this
        };
    },
    //This function is private at the moment but it needs to provide intelligent
    //internet connection type detection on the device
    getRequestTimeout: function() {/*callBack, callBackParams*/
        //http://docs.phonegap.com/phonegap_network_network.md.html#NetworkStatus
        var timeout = 8;
        navigator.network.isReachable(apiDomain, function(reachability) {
            // There is no consistency on the format of reachability
                var networkState = reachability.code || reachability;

                var states = {};
                states[NetworkStatus.NOT_REACHABLE]                      = 'No network connection';
                states[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 'Carrier data connection';
                states[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK]         = 'WiFi connection';

                Util.logger('Connection type: ' + states[networkState]);
                
                var timeouts = {};
                timeouts[NetworkStatus.NOT_REACHABLE]                      = 1;
                timeouts[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 12;
                timeouts[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK]         = 8;
                
                timeout = timeouts[networkState];
                
                // callBack(callBackParams, timeout);
                return timeout;
        });
    }
};


var User = {
    getLoginFormBase: function(loginCB, signupCB) {
        return {
            fullscreen: true,
            standardSubmit: false,
            cls: 'auth_panel',
            items: [{
                xtype: 'fieldset',
                defaults: {
                    required: true, // KL - has no visual effect as we use a placeHolder for the label
                    useClearIcon: true
                },
                items: [{
                    xtype: 'emailfield',
                    name: 'username',
                    placeHolder: 'Email',
                    autoCapitalize : false,
                    autoComplete: false,
                    autoCorrect: false
                }, {
                    xtype: 'passwordfield',
                    name: 'password',
                    placeHolder: 'Password',
                    id: 'loginPasswordField'
                }, {
                    xtype: 'passwordfield',
                    name: 'password2',
                    placeHolder: 'Re-type Password',
                    hidden: true,
                    id: 'loginPasswordField2'
                }]
            }, 
            {
                xtype: 'fieldset',
                items: [{
                    xtype: 'button',
                    id: 'loginButton',
                    ui: 'action',
                    text: 'Login',
                    handler: loginCB
                }, {
                    xtype: 'button',
                    id: 'newuserButton',
                    text: 'New user? Sign up here',
                    handler: function(ele, eve) {
                        Ext.getCmp('loginButton').hide();
                        Ext.getCmp('newuserButton').hide();
                        Ext.getCmp('loginPasswordField2').show();
                        Ext.getCmp('signupButton').show();
                        Ext.getCmp('cancelButton').show();
                        
                        FlurryPlugin.endTimedEvent('login_form_show');
                        FlurryPlugin.logTimedEvent('signup_form_show');
                        FlurryPlugin.countPageView();
                    }
                }, {
                    xtype: 'button',
                    id: 'signupButton',
                    text: 'Sign Up',
                    hidden: true,
                    handler: signupCB
                }, {
                    xtype: 'button',
                    id: 'cancelButton',
                    text: 'Cancel',
                    hidden: true,
                    ui: 'decline',
                    handler: function(ele, eve) {
                        Ext.getCmp('loginPasswordField2').setValue('');
                        Ext.getCmp('loginPasswordField2').hide();
                        Ext.getCmp('signupButton').hide();
                        Ext.getCmp('cancelButton').hide();
                        Ext.getCmp('loginButton').show();
                        Ext.getCmp('newuserButton').show();
                        
                        FlurryPlugin.endTimedEvent('signup_form_show');
                        FlurryPlugin.logTimedEvent('login_form_show');
                        FlurryPlugin.countPageView();
                    }
                }]
            }],
            listeners: {
                // KL - this is to handle the "Go" button on the iPhone keyboard, bit hacky can't find another way to do it
                beforesubmit: function(formPanel, values, options) {
                    if(Ext.getCmp('loginButton').isHidden())
                        signupCB(formPanel, values);
                    else
                        loginCB(formPanel, values);
                }
            }
        };
    },
    
    login: function(email, password, failForm, succCallback, failCallBack) {
        var errMsg = "Device Offline or Server not responding!";

        Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
        Ext.Ajax.request({
            url: Api.urlFor('/apiv2/auth/key'),
            method: 'POST',
            params: { login: email, password: password },
            timeout: 10000,
            success: function(response, opts) {
                Api.setLocalStorageProp('account_key', Ext.decode(response.responseText).account_key);
                Api.setLocalStorageProp('user_id', Ext.decode(response.responseText).id);
                
                Util.logger('in login account_key is:', Api.getLocalStorageProp('account_key'));
                FlurryPlugin.setUserID(Api.getLocalStorageProp('user_id'));
                FlurryPlugin.endTimedEvent('login_form_show');
                
                Ext.getBody().unmask();
                
                succCallback();
            },
            failure: function(response, opts) {
                Util.logger('[INFO]:: server-side failure with status code ', response.status);
                Util.logger(response);
                
                if(!Ext.isEmpty(response.request.timedout))
                    errMsg = 'Request timedout'
                else if(response.status != 0)
                    errMsg = Ext.decode(response.responseText).error;

                Ext.getBody().unmask();
                failCallBack(failForm, "Login Failed!", errMsg);
            }
        });
    },
    
    signup: function(email, password, failForm, succCallback, failCallBack) {
        var errMsg = "Device Offline or Server not responding!";
        var signup_key = '';
        
        Ext.getBody().mask('Authenticating...', 'x-mask-loading', false);
        Ext.Ajax.request({
            url: Api.urlFor('/apiv2/auth/signup_key'),
            method: 'POST',
            timeout: 10000,
            success: function(response, opts) {
                signup_key = Ext.decode(response.responseText).signup_key;

                Ext.getBody().unmask();
                Ext.getBody().mask('Signing Up...', 'x-mask-loading', false);
                if(!Ext.isEmpty(signup_key)) {
                    Ext.Ajax.request({
                        url: Api.urlFor('/apiv2/users'),
                        method: 'POST',
                        jsonData: { signup_key: signup_key, user: { email: email, password: password }},
                        timeout: 10000,
                        success: function(response, opts) {
                            Api.setLocalStorageProp('account_key', Ext.decode(response.responseText).account_key);
                            Api.setLocalStorageProp('user_id', Ext.decode(response.responseText).id);
                            Util.logger('in login account_key is:', Api.getLocalStorageProp('account_key'));
                            FlurryPlugin.endTimedEvent('signup_form_show');
                            
                            Ext.getBody().unmask();
							
							Ext.Msg.alert('Welcome to Diary Mobile', 
				                'Access your Diary anywhere,<br/>use your phone or visit www.diary.com<br/>'+
				                'All your sync\'d data is safe<br/>and backed up.<br/>');
				            
                            succCallback();
                        },
                        failure: function(response, opts) {
                            Util.logger('[INFO]:: server-side failure with status code ', response.status);
                            Util.logger(response);
                            
                            if(!Ext.isEmpty(response.request.timedout))
                                errMsg = 'Request timedout'
                            else if(response.status != 0)
                                errMsg = Ext.decode(response.responseText).error;

                            Ext.getBody().unmask();
                            failCallBack(failForm, "Login Failed!", errMsg);
                        }
                    });
                    
                }
                
                // succCallback();
                
            },
            failure: function(response, opts) {
                Util.logger('[INFO]:: server-side failure with status code ', response.status);
                Util.logger(response);
                
                if(!Ext.isEmpty(response.request.timedout))
                    errMsg = 'Request timedout'
                else if(response.status != 0)
                    errMsg = Ext.decode(response.responseText).error;

                Ext.getBody().unmask();
                failCallBack(failForm, "Login Failed!", errMsg);
            }
        });
    }
};


var Dashboard = {
    createDashboardMainPanel: function(addEventsCB, addNotesCB, addTodosCB, eventsListCB, notesListCB, todosListCB) {
        return new Ext.form.FormPanel({
            fullscreen: true,
            hidden: false,
            // dock: 'top',
            items: [{
                html: [
                '<div class="settings_page_text" style="padding-bottom: 5px">',
                    '<b>Please read this important message!</b>', 
                    '<p>On the <b>next Update</b> on this App we will <b>not be supporting Tasks or Events.</b></p>', 
                    '<p>', 
                        'Why? Because most of you use the journal and we want to focus our efforts ',
                        'on making it the <b>best Diary to journal in.</b> We promise it will be awesome.',
                    '</p>',
                    '<p>',
                        'So if you use Events or Tasks please <b>DON’T Update on the next Update</b> ',
                        'we send out, then you can still use them. We will be providing an exporter for your Events and Tasks.',
                    '</p>',
                    '<p>',
                        'Please send <b>feedback@diary.com</b> with any questions.',
                    '</p>',
                    '<p>',
                        'We thank you for your support!',
                    '</p>',
                '</div>'
                ]
            },                
            /*{
                xtype: 'fieldset',
                items:[{
                    xtype: 'button',
                    ui: 'Normal',
                    text: 'New Event',
                    name: 'new_event',
                    flex: 1,
                    handler: addEventsCB
                }]
                }, {
                    xtype: 'fieldset',
                    items:[{
                    xtype: 'button',
                    ui: 'Normal',
                    text: 'New Journal Post',
                    name: 'new_journal',
                    flex: 1,
                    handler: addNotesCB
                }]
                }, {
                    xtype: 'fieldset',
                    items: [{
                    xtype: 'button',
                    ui: 'Normal',
                    text: 'New Task',
                    name: 'new_task',
                    flex: 1,
                    handler: addTodosCB
                }]
            }, {
                xtype: 'fieldset',
                defaults: {
                    disabled: true,
                    labelWidth: ''
                },
                items: [{
                    xtype: 'textfield',
                    name: 'events_count',
                    label: 'Events',
                    value: Util.getItemsSize('event_all').toString(),
                    cls: 'events_count_field',
                    listeners: {
                         tap: {
                            element: 'el', //bind to the underlying el property on the textfield
                            fn: eventsListCB
                        }
                    }
                },{ 
                    xtype: 'textfield',
                    name: 'journals_count',
                    label: 'Journal',
                    value: Util.getItemsSize(allEntities[1]).toString(),
                    cls: 'journal_posts_count_field',
                    listeners: {
                         tap: {
                            element: 'el', //bind to the underlying el property on the textfield
                            fn: notesListCB
                        }
                    }
                },{
                    xtype: 'textfield',
                    name: 'tasks_count',
                    label: 'Tasks',
                    value: Util.getItemsSize(allEntities[0]).toString(),
                    cls: 'tasks_count_field',
                    listeners: {
                         tap: {
                            element: 'el', //bind to the underlying el property on the textfield
                            fn: todosListCB
                        }
                    }
                }]
            },*/ {
                xtype: 'fieldset',
                baseCls: 'last_sync_field',
                
                defaults: {
                    labelWidth: ''
                },
                items:[{
                    xtype: 'textfield',
                    name: 'last_sync_timestamp',
                    label: 'Last Synced:',
                    disabled: true,
                    value: Util.getLastSyncTimestamp()
                }, {
                    xtype: 'textfield',
                    name: 'version_number',
                    label: 'Diary Mobile',
                    disabled: true,
                    value: 'v'+Environment.version()
                }]
            }]
        });
    }
};

var Settings = function() {
    /* 
    Public/private access sorted using Revealing Module Pattern 
    http://www.wait-till-i.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/
    */
    /* Public pointers to private functions */
    return {
        getPincodeTemplate: getPincodeTemplate,
        createPincodePanel: createPincodePanel,
        createSettingsMainPanel: createSettingsMainPanel,
        createSettingsFeedsPanel: createSettingsFeedsPanel,
        createSettingsHelpPanel: createSettingsHelpPanel,
        createSettingsAboutPanel: createSettingsAboutPanel,
        createSettingsTermsPanel: createSettingsTermsPanel,
        createSettingsPrivacyPanel: createSettingsPrivacyPanel,
		getFeedsListBase: getFeedsListBase,
		refreshFeedsListData: refreshFeedsListData
    };
    
    /* Private functions */
    function getPincodeTemplate() {
        return new Ext.XTemplate(
            '<div class="pinCodePage">', 
                '<p class="pinCodeMsg">{mainMsg}</p>', 
                '<div class="pinDots">',
                    '<ul>', 
                        '<tpl if="this.isEmpty(dot1)">', 
                            '<li class="empty circle"></li>', 
                        '</tpl>', 
                        '<tpl if="!this.isEmpty(dot1)">', 
                            '<li class="selected circle on">{dot1}</li>', 
                        '</tpl>', 
                        '<tpl if="this.isEmpty(dot2)">', 
                            '<li class="empty circle"></li>', 
                        '</tpl>', 
                        '<tpl if="!this.isEmpty(dot2)">', 
                            '<li class="selected circle on">{dot2}</li>', 
                        '</tpl>', 
                        '<tpl if="this.isEmpty(dot3)">', 
                            '<li class="empty circle"></li>', 
                        '</tpl>', 
                        '<tpl if="!this.isEmpty(dot3)">', 
                            '<li class="selected circle on">{dot3}</li>', 
                        '</tpl>', 
                        '<tpl if="this.isEmpty(dot4)">', 
                            '<li class="empty circle last"></li>', 
                        '</tpl>', 
                        '<tpl if="!this.isEmpty(dot4)">', 
                            '<li class="selected circle on last">{dot4}</li>', 
                        '</tpl>', 
                        '<li class="clear"></li>', 
                    '</ul>',
                    
                '</div>',
                '<div class="keys">',
                    '<div class="keypadCont">',
                        '<ul class="keypad">', 
                            '<li class="numClass">1</li>', 
                            '<li class="numClass">2</li>', 
                            '<li class="numClass last">3</li>', 
                            '<li class="numClass">4</li>', 
                            '<li class="numClass">5</li>', 
                            '<li class="numClass last">6</li>', 
                            '<li class="numClass">7</li>', 
                            '<li class="numClass">8</li>', 
                            '<li class="numClass last">9</li>', 
                            '<li class="numClass">{loginVal}</li>', 
                            '<li class="numClass">0</li>', 
                            '<li class="numClass last">Back</li>', 
                        '</ul>', 
                         
                        '<div class="clear"></div>',
                       '<p class="pinCodeWarnMsg">* Forgetting Pin code will cause your changes to be lost</p>', 

                    '</div>',
                '</div>',
            '</div>', 
            {
                isEmpty: function(c) {
                    return Ext.isEmpty(c);
                },
            });
    };
    
    function createPincodePanel(pinTpl, tapHandler, pinNavBar) {
        
        return new Ext.Panel({
            hidden: true,
            fullscreen: true,
            layout: 'fit',
            tpl: pinTpl,
            dockedItems: [pinNavBar],
            listeners: {
                afterrender: function(cmp) {
                    var el = cmp.getEl();
                    el.on("tap", tapHandler, this);
                }
            }
        });
    };
    
    function createSettingsMainPanel(tasks_mover_options, showPinCB, feedsCB, helpCB, aboutCB, termsCB, privacyCB, taskListCB) {
        /*
        var externalLinksHTML = (Ext.is.iOS) ? 
        '<p class="review_itunes"><a href="http://itunes.apple.com/gb/app/diary-mobile/id357481953?mt=8">Like Diary? Review us on iTunes</a></p>'
        : (Ext.is.Android) ? 
        '<p class="review_itunes"><a href="https://market.android.com/details?id=com.diary.android">See our reviews on the Android Market</a></p>'
        : '';
        */
        var externalLinksHTML = Environment.externalLinksHTML();
        
        return new Ext.form.FormPanel({
            // fullscreen: true,
            hidden: false,
            items: [{
                xtype: 'fieldset',
                defaults: {
                    labelWidth: ''
                },
                items: [{
                    xtype: 'remindselectfield', // one of our own
                    name: 'tasks_mover_delay',
                    id: 'tasksMoverDelayField',
                    label: 'Clear Checked Tasks after',
                    options: tasks_mover_options,
                    pickerCls: 'taskRemindSelectPicker',
                    value: Api.getLocalStorageProp('tasks_mover_delay'),
                    cls: 'move_marked_tasks_after_field',
                    listeners: {
                        change: function(selector, newVal) {
                            Api.setLocalStorageProp('tasks_mover_delay', newVal);
                            
                            taskListCB();
                        }
                    }
                }, {
                    xtype: 'timepickerfield',
                    name: 'daily_notif_time',
                    id: 'dailyNotifTimeField',
                    label: 'Daily Summary time',
                    value: Api.getLocalStorageProp('daily_notif_time'),
                    cls: 'daily_notif_time_field',
                    listeners: {
                        timeSelection: function(hours, minutes) {
                            Util.logger('Selected hour is:', hours);
                            Util.logger('Selected minute is:', minutes);
                            
                            Api.setLocalStorageProp('daily_notif_time', hours+':'+minutes);
							refreshDashAndListPanelsCB('', '');
                        }
                    }
                }, {
                    xtype: 'togglefield',
                    name: 'pin_code',
                    label: 'Change Pincode (Lock)',
                    value: (Ext.isEmpty(Api.getLocalStorageProp('pin_code')) ? 0 : 1),
                    id: 'pinCodeField',
                    // hidden: true,
                    // maxLength: 4,
                    // disabled: true,
                    cls: 'pin_code_field',
                    listeners: {
                        // focus: showPinCB
                        change: function(slider, thumb, newVal, oldVal) {
                            if(oldVal == 0 && newVal == 1) {
                                showPinCB(newVal);
                            } else if(newVal == 0 && oldVal == 1)
                                showPinCB(newVal);
                                
                        }
                    }
                }, {
                    xtype: 'togglefield',
                    name: 'auto_sync',
                    label: 'Auto Sync',
                    value: Api.getLocalStorageProp('auto_sync'),
                    id: 'autoSyncField',
                    // hidden: true,
                    cls: 'auto_sync_field',
                    listeners: {
                        change: function(slider, thumb, newVal, oldVal) {
                            FlurryPlugin.logEvent('settings_main_autoSync');
                            
                            if(newVal == 0 || newVal == 1)
                                Api.setLocalStorageProp('auto_sync', newVal);
                        }
                    }
                }, {
                    xtype: 'togglefield',
                    name: 'auto_login',
                    label: 'Auto Login',
                    value: Api.getLocalStorageProp('auto_login'),
                    id: 'autoLoginField',
                    // hidden: true,
                    cls: 'auto_login_field',
                    listeners: {
                        change: function(slider, thumb, newVal, oldVal) {
                            FlurryPlugin.logEvent('settings_main_autoLogin');
                            
                            if(newVal == 0 || newVal == 1)
                                Api.setLocalStorageProp('auto_login', newVal);
                        }
                    }
                }]
            }, /*{
                xtype: 'fieldset',
                items:[{
                    xtype: 'textfield',
                    name: 'intro_premium',
                    label: 'Introducing Diary Premium >',
					labelWidth: 250,
                    disabled: true
                }]
            }, */{
                xtype: 'fieldset',
                items: [{
                    xtype: 'button',
                    ui: 'Normal',
                    text: 'Diary.com Calendar Sync',
                    name: 'feeds',
                    flex: 1,
                    handler: feedsCB
                }]
            }, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'button',
                    ui: 'Normal',
                    text: 'Help',
                    name: 'help',
                    flex: 1,
                    handler: helpCB
                }]
            }, {
                xtype: 'fieldset',
                items: [{
                    xtype: 'button',
                    ui: 'Normal',
                    text: 'About Diary Mobile',
                    name: 'about',
                    flex: 1,
                    handler: aboutCB
                }]
            }, {
                xtype: 'fieldset',
                items:[{
                    xtype: 'button',
                    ui: 'Normal',
                    text: 'Terms & Conditions',
                    name: 'terms',
                    flex: 1,
                    handler: termsCB
                }]
            }, {
                xtype: 'fieldset',
                items:[{
                    xtype: 'button',
                    ui: 'Normal',
                    text: 'Privacy',
                    name: 'privacy',
                    // flex: 1,
                    handler: privacyCB
                }]
            }, {   
                cls: 'external_links',
                html: [
                    '<div>',
                        '<p class="twitter"><a href="http://twitter.com/diarydotcom">Follow us on Twitter</a></p><br />',
                        externalLinksHTML,
                    '</div>'
                ]
            }]
        });
    };

	function getFeedsListStore(feeds) {
		return new Ext.data.Store({
		    model: 'Feeds',
		    sorters: 'title',
			// sorters: [{ property: 'title', direction: 'ASC' }],
		    data: [ feeds ]
		});
	};	
    
    function getFeedsListBase(feedsData, itemtapCB) {
        return {
            itemTpl: '<div id="feed_item_{feed_id}" class="feed_list_item">{title}</div>',
            layout: 'fit',
            scroll: 'vertical',
			fullscreen: true,
            hidden: true,
            selModel: {
                mode: 'SIMPLE',//'MULTI',//'SINGLE',
                allowDeselect: true
            },
            // grouped: false,
            store: getFeedsListStore(feedsData),
            listeners: {
				// selectionchange: selchangeCB,
                itemtap: itemtapCB
            }
        };
    };

    function refreshFeedsListData() {
        var user_id = Api.getLocalStorageProp('user_id');
        var feeds = [], itemKey, value;
        var feedKey = 'feed_'+user_id;
        
        for(var i = 0, losLength = localStorage.length; i < losLength; i++) {
            itemKey = localStorage.key(i);
            if(itemKey.indexOf(feedKey) != -1) {
                // Util.logger('after key is: ', itemKey);
                value = Ext.decode(localStorage[itemKey]);
                if(value.cl_state != 'delete') {
                    value.updated_at = Api.parseFromUTCDate(value.updated_at);
                    value.created_at = Api.parseFromUTCDate(value.created_at);
                    feeds.push(value);
                }
                // Util.logger('after note['+i+'].id is: '+value.id+'\nnote['+i+'].title is: '+value.title);
            }
        }
        return feeds;
    };

    function createSettingsFeedsPanel(feedsList) {
        var feedDetailPanel = new Ext.Panel({
            hidden: false,
			layout: 'fit',
            // scroll: 'vertical',
            // fullscreen: true,
			dock: 'top',
            html: [
                '<div class="settings_page_text" style="padding-bottom: 5px">',
					'<b>Frustrated with Cal Sharing and Syncing?</b>', 
					// '<p>Tired of not being able to to view and share Calendars on desktop and mobile devices? Add popular Calendars to your Diary! Please let us know which Cals you want by tapping on them</p>', 
					'<p>', 
						'So are we. So we are going to fix it, so you can easily share and sync', 
						'your Calendar to any mobile device. Select the cals you want by', 
						'tapping them below and then hit the back button.', 
					'</p>', 
                '</div>'
            ]
        });

        return new Ext.Panel({
            hidden: true,
            // scroll: 'vertical',
            fullscreen: true,
            // fullscreen: (Ext.is.iOS) ? false : true,
            layout: 'fit',
			items: [feedsList],
			dockedItems: [feedDetailPanel]
        });

    };

    function createSettingsHelpPanel() {
        return new Ext.Panel({
            hidden: true,
            scroll: 'vertical',
            fullscreen: true,
            html: [
                '<div class="settings_page_text" style="padding-bottom: 60px">',
                '<h1>Help</h1>',
                
                '<p><strong>Q. Is everything private?</strong></p>',
                    '<p>A. Yes. Everything in your Diary App, and on <a href="http://www.diary.com">Diary.com</a> is private. You can however share items with contacts on <a href="http://www.diary.com">Diary.com</a>, such as ',
                        'your plans, journal or picture posts.</p>',
                    
                    '<p><strong>Q. Where does everything on my Diary App sync to?</strong></p>',
                    '<p>A. All your Diary syncs to your Diary online at <a href="http://www.diary.com">www.diary.com</a>. Just use the same username and password you used to sign up on the App, ',
                        'or vice versa, to access to  your Diary online at <a href="http://www.diary.com">www.diary.com</a>.</p>',
                    
                    '<p><strong>Q. How do I sync?</strong></p>',
                    '<p>A. If you have turned Auto Sync ON in the App Settings everything syncs automatically. You can also manually sync items by tapping ',
                        'the \'Sync\' button on the Dashboard.</p>',
                    
                    '<p><strong>Q. I\'m getting Daily Agendas by email each morning, and a Weekly Agenda by email every Monday morning. How do I control ',
                        'these?</strong></p>',
                    '<p>A. You can turn these emails ON/OFF by logging into your Diary at <a href="http://www.diary.com">www.diary.com</a>, and going to Settings then you can unselect, or ',
                        'select, the Weekly Agenda and Daily Agenda.</p>',
                    
                    '<p><strong>Q. What is the Daily Summary?</strong></p>',
                    '<p>A. The Daily Summary is your Daily list of your items you have on that day including Events, Birthdays, Anniversaries and Tasks. You ',
                        'can set the time of your Daily Summary pop up notification in Settings.</p>',

                    '<p><strong>Q. Blank Screen?</strong></p>',
                    '<p>A. Switch between tabs if the screen goes blank/white.</p>',

                    '<p><strong>Q. After I receive an alert on the device, and go into the App, when I exit the app, the notification number is still on my ',
                        'Diary App icon. How do I get rid of it?</strong></p>',
                    '<p>A. You are still seeing the icon because you are still logged into the App through multitasking. If you quit the App properly* the ',
                        'notification number will disappear.</p>',
                         '<p><strong>My Diary App freezes sometimes. How do I get out of it?</strong></p>',
                    '<p>A. The App is caught in a sync. You need to quit the app properly. Double tap the circle button on the foot of the handset, then find and touch "D" Diary App icon, at the foot, for a couple of seconds. You will see a red "-" badge. Touch the red "-" badge. This properly quits the Diary app. Then re-start the app.</p>',
                    
                    '<p><strong>Q. What happens if I forget my Pincode?</strong></p>',
                    '<p>A. Just touch the "Forgot" button on the Enter Pincode page (top right) and you can re-login with your username and password.</p>',
                    '<p class="settingsNote">*Quit app, double tap the circle at the foot of the device, then tap and hold the diary icon until it wobbles, ',
                        'then tap the red \'-\' icon on the Diary App will properly quit the app) </p>',
                    
                    '<p style="text-align:left">Get more help and support here at <a href="http://community.diary.com">community.diary.com</a> or email us ',
                        'at <a href="mailto:feedback@diary.com">feedback@diary.com</a></p>',
                    '<p style="text-align:left">For service updates please follow us on <a href="http://twitter.com/diarydotcom">Twitter</a>, or join ',
                        'our <a href="http://www.facebook.com/pages/Diarycom/19787996168">Facebook group</a></p>',
                '</div>'
            ]
        });
    };

    function createSettingsAboutPanel() {
        return new Ext.Panel({
            hidden: true,
            scroll: 'vertical',
            fullscreen: true,
            html: [
                '<div class="settings_page_text" style="padding-bottom:60px">',
					'<p class="versionNumber">Diary Mobile v'+Environment.version()+'</p>', 
                    '<h1>Diary, the easy way to plan and journal your life.</h1>',
                    '<p><strong>Features included:</strong></p>',
                    '<ul>',
                        '<li>Easy Calendar for plans</li>',
                        '<li>Useful Task manager</li>',
                        '<li>Beautiful Journal</li>',
                        '<li>Password Protected</li>',
                        '<li>Access Anywhere</li>',
                        '<li>Online Diary backup at Diary.com</li>',
                        '<li>Automatically syncs any changes</li>',
                        '<li> Daily Agenda and Weekly Agenda, by email Daily Agenda in App, set your reminder time Notifications and reminders for your ',
                            'private and social events</li>',
                        '<li>Works nicely offline and then syncs</li>',
                        '<li>Facebook Events and Birthdays synced into your Diary</li>',
                        '<li>Pop Up reminders even when you app isn&#39;t running</li>',
                    '</ul>',
                    
                    '<p><strong>In development:</strong></p>',
                    '<ul>',
                        '<li>Shared Plans and Tasks</li>',
                        '<li>Search</li>',
                        '<li>Customisation</li>',
                        '<li>Sharing onto Facebook and Twitter</li>',
                        '<li>Integration with: Android, iPad, Tablet Apps GCal/iCal sync</li>',
                    '</ul>',
                    
                    '<p class="settingsNote">Don&#39;t worry about your phones data plan - Diary reminders are tiny packets of data efficiently wrapped and ',
                        'served :)</p>',
                '</div>'
            ]
        });
    };
    
    function createSettingsTermsPanel() {
        return new Ext.Panel({
            hidden: true,
            scroll: 'vertical',
            fullscreen: true,
            html: [
                '<div class="settings_page_text" style="padding-bottom: 60px;">',
                    '<h1>Terms & Conditions</h1>',
                    '<p>Terms and Conditions for the use of the Diary Mobile and the Diary.com website and app. In these Terms and Conditions "we, our, us, ',
                        'Diary Mobile, Diary.com" refers to Diary Mobile and Diary.com.</p>',
                    '<p><strong>Acceptance of terms</strong></p>',
                    '<p>By accessing the content of Diary Mobile app and www.diary.com ("the website and app") you agree to be bound by the Terms and ',
                        'Conditions set out herein and you accept our Privacy Policy available at privacy policy. If you object to any of the Terms and ',
                        'Conditions set out in this agreement you should not use any of the products or services on the website and app and leave immediately. ',
                        'You agree that you shall not use the website and app for illegal purposes, and will respect all applicable laws and regulations. ',
                        'You agree not to use the website and app in a way that may impair the performance, corrupt the content or otherwise reduce the ',
                        'overall functionality of the website and app. You also agree not to compromise the security of the website and app or attempt to ',
                        'gain access to secured areas or sensitive information. You agree to be fully responsible for any claim, expense, liability, losses, ',
                        'costs including legal fees incurred by us arising from any infringement of the terms and conditions set out in this agreement.</p>',
                    '<p><strong>Modification</strong></p>',
                    '<p>Diary Mobile and Diary.com reserve the right to change any part of this agreement without notice and your use of the website and app ',
                        'will be deemed as acceptance of this agreement. We advise users to regularly check the Terms and Conditions of this agreement. Diary ',
                        'Mobile and Diary.com has complete discretion to modify or remove any part of the site without warning or liability arising from such action.</p>',
                    '<p><strong>Limitation of liability</strong></p>',
                    '<p>Diary Mobile and Diary.com will under no circumstance be liable for indirect, special, or consequential damages including any loss of ',
                        'business, revenue, profits, or data in relation to your use of the website and app. Nothing within this Agreement will operate to exclude ',
                        'any liability for death or personal injury arising as result of the negligence of Diary Mobile and Diary.com, its employees or agents.</p>',
                    '<p><strong>Copyright</strong></p>',
                    '<p>All intellectual property of Diary Mobile and Diary.com such as trademarks, trade names, patents, registered designs and any other ',
                        'automatic intellectual property rights derived from the aesthetics or functionality of the website and app remain the property of ',
                        'Diary.com. By using the website and app you agree to respect the intellectual property rights of Diary Mobile and Diary.com and will ',
                        'refrain from copying, downloading, transmitting, reproducing, printing, or exploiting for commercial purpose any material contained ',
                        'within the website and app.</p>',
                    '<p><strong>Disclaimer</strong></p>',
                    '<p>The information is provided on the understanding that the website and app is not engaged in rendering advice and should not be wholly ',
                        'relied upon when making any related decision. The information contained with the website and app is provided on an "as is" basis with ',
                        'no warranties expressed or otherwise implied relating to the accuracy, fitness for purpose, compatibility or security of any components ',
                        'of the website and app. We do not guarantee uninterrupted availability of the www.diary.com website and app and cannot provide any ',
                        'representation that using the website and app will be error free. We reserve the right to close accounts or alter usernames that ',
                        'infringe on famous, trademarked or copyrighted names. Sorry, but Kurt Russell can get scary when people pretend to be him.</p>',
                    '<p><strong>Third parties</strong></p>',
                    '<p>The website and app may contain hyperlinks to website and apps operated by other parties. We do not control such website and apps ',
                        'and we take no responsibility for, and will not incur any liability in respect of, their content. Our inclusion of hyperlinks to such ',
                        'website and apps does not imply any endorsement of views, statements or information contained in such website and apps.</p>',
                    '<p><strong>Severance</strong></p>',
                    '<p>If any provision of this Agreement is held to be invalid or unenforceable, such provision shall be struck out and the remaining ',
                        'provisions shall remain in force.</p>',
                    '<p><strong>Service</strong></p>',
                    '<p>We reserve the right to remove all or part of any service, for legal or commercial purposes deemed necessary by Diary.com. Misuse ',
                        'and abuse of the Diary Mobile app and Diary.com website may result in your membership being removed and your email address banned from ',
                        'registering in the future. We also reserve the right to suspend, put on hold or amend any member profile that is deemed rude, ',
                        'unsavoury or otherwise offensive.</p>',
                '</div>'
            ]
        });
    };

    function createSettingsPrivacyPanel() {
        return new Ext.Panel({
            hidden: true,
            scroll: 'vertical',
            fullscreen: true,
            html: [
                '<div class="settings_page_text">',
                    '<h1>Privacy Policy</h1>',
                    '<p>In this privacy policy references to "we", "us" and "our" are to Diary Mobile and Diary.com. References to "our app and website " ',
                        'or "the app and website " are to Diary Mobile and www.diary.com.</p>',
                    '<p><strong>What information we collect and how</strong></p>',
                    '<p>The information we collect via the app and website may include:</p>',
                    '<p>Any personal details you knowingly provide us with through forms and our email, such as name, address, telephone number etc. In order ',
                        'to effectively process credit or debit card transactions it may be necessary for the bank or card processing agency to verify your ',
                        'personal details for authorisation outside the European Economic Area (EEA). Such information will not be transferred out of the EEA ',
                        'for any other purpose. Your preferences and use of email updates, recorded by emails we send you (if you select to receive email ',
                        'updates on products and offers). Your IP Address, this is a string of numbers unique to your computer that is recorded by our web ',
                        'server when you request any page or component on the app and website  . This information is used to monitor your usage of the app ',
                        'and website  . Data recorded by the app and website   which allows us to recognise you and your preferred settings, this saves you ',
                        'from re-entering information on return visits to the site. Such data is recorded locally on your computer through the use of cookies. ',
                        'Most browsers can be programmed to reject, or warn you before downloading cookies, information regarding this may be found in your ',
                        'browsers &#39;help&#39; facility.</p>',
                    '<p><strong>What we do with your information</strong></p>',
                    '<p>Any personal information we collect from this app and website will be used in accordance with the Data Protection Act 1998 and other ',
                        'applicable laws. The details we collect will be used:</p>',
                    '<p>To process your order, to provide after sales service (we may pass your details to another organisation to supply/deliver products or ',
                        'services you have purchased and/or to provide after-sales service). In certain cases we may use your email address to send you information ',
                        'on our other products and services. In such a case you will be offered the option to opt in/out before completing your purchase. We may ',
                        'need to pass the information we collect to other companies for administrative purposes. We may use third parties to carry out certain ',
                        'activities, such as processing and sorting data, monitoring how customers use the app and website   and issuing our e-mails for us. ',
                        'Third parties will not be allowed to use your personal information for their own purposes.</p>',
                    '<p><strong>Your rights</strong></p>',
                    '<p>You have the right to request a copy of any information that we currently hold about you. In order to receive such information please ',
                        'send your contact details, including address, to us using our contact form.</p>',
                    '<p><strong>Other app and websites</strong></p>',
                    '<p>This privacy policy only covers this app and website. Any other app and websites which may be linked to by our app and website are ',
                        'subject to their own policy, which may differ from ours.</p>',
                    '<p><strong>More on Cookies</strong></p>',
                    '<p>We may store information about you using cookies (files which are sent by us to your computer or other access device) which we can ',
                        'access when you visit our site in future. If you want to delete any cookies that are already on your computer, please refer to the ',
                        'instructions for your file management software to locate the file or directory that stores cookies. The domain name www.diary.com will ',
                        'make up the filenames of our cookies. If you want to stop cookies being stored on your computer in future, please refer to your ',
                        'browser manufacturer&#39;s instructions by clicking "Help" in your browser menu. Further information on deleting or controlling ',
                        'cookies is available at www.aboutcookies.org. Please note that by deleting our cookies or disabling future cookies you may not be ',
                        'able to access certain areas or features of our site.</p>',
                    '<p><strong>Facebook Events and Birthdays</strong></p>',
                    '<p>You will find this feature on the right hand column in the Agenda on Diary.com (not Diary Mobile). Logon to Diary.com and in the ',
                        'Agenda click &#39;Connect with Facebook&#39; to add Facebook Events and Birthdays. The Facebook items you import are all private in ',
                        'your Diary, you can then privately invite other people to these events, this is especially useful for Public Events you are attending ',
                        'but want to invite others to. Facebook does not have calendar and we find the Calendar Apps to be too limited on the features they offer.</p>',
                    '<p><strong>Life Diary, Premium Diary</strong></p>',
                    '<p>We reserve the right, at a future date, to charge for services and storage of Diary.com that are currently given as free. This is to ',
                        'keep the high level of service and protection of your Diary data. We will inform all Diary Mobile and Diary.com members well in ',
                        'advance of any changes regarding this matter. Acceptable Use and Conduct It is our policy to terminate any person&#39;s Diary Mobile ',
                        'and Diary.com account with us if they repeatedly infringe the intellectual property or proprietary rights of others.</p>',
                    '<p><strong>Disclaimer:</strong></p>',
                    '<p><strong>Disclaimer:</strong></p>',
                    '<p>THE USE OF DIARY MOBILE AND DIARY.COM IS AT YOUR OWN RISK. DIARY MOBILE AND DIARY.COM IS PROVIDED ON AN &#39;AS IS&#39; BASIS. TO THE ',
                        'MAXIMUM EXTENT PERMITTED BY LAW: (A) DIARY.COM DISCLAIMS ALL LIABILITY WHATSOEVER, WHETHER ARISING IN CONTRACT, TORT (INCLUDING ',
                        'NEGLIGENCE) OR OTHERWISE IN RELATION TO THE APP AND WEBSITE   AND/OR THE APP AND WEBSITE   SERVICE; AND (B) ALL IMPLIED WARRANTIES, ',
                        'TERMS AND CONDITIONS RELATING TO THE APP AND WEBSITE   AND/OR THE APP AND WEBSITE   SERVICE (WHETHER IMPLIED BY STATUE, COMMON LAW ',
                        'OR OTHERWISE), INCLUDING (WITHOUT LIMITATION) ANY WARRANTY, TERM OR CONDITION AS TO ACCURACY, COMPLETENESS, SATISFACTORY QUALITY, ',
                        'PERFORMANCE, FITNESS FOR PURPOSE OR ANY SPECIAL PURPOSE, AVAILABILITY, NON INFRINGEMENT, INFORMATION ACCURACY, INTEROPERABILITY, ',
                        'QUIET ENJOYMENT AND TITLE ARE, AS BETWEEN FUTURE AND YOU, HEREBY EXCLUDED. IN PARTICULAR, BUT WITHOUT PREJUDICE TO THE FOREGOING, ',
                        'WE ACCEPT NO RESPONSIBILITY FOR THE CONDUCT OF ANY USER AND/OR ACCOUNT HOLDER OF THE APP AND WEBSITE   AND/OR APP AND ',
                        'WEBSITE   SERVICE; ANY ERROR, DELAY OR FAILURE IN THE TRANSMISSION OF ANY COMMUNICATION BETWEEN USERS AND/OR ACCOUNT HOLDERS; ANY ',
                        'TECHNICAL FAILURE OF THE INTERNET, THE APP AND WEBSITE   AND/OR THE APP AND WEBSITE   SERVICE; OR ANY DAMAGE OR INJURY TO USERS OR ',
                        'THEIR EQUIPMENT AS A RESULT OF OR RELATING TO THEIR USE OF THE APP AND WEBSITE   OR THE APP AND WEBSITE   SERVICE. YOUR STATUTORY ',
                        'RIGHTS ARE NOT AFFECTED.</p>',
                '</div>'
            ]
        });
    };
/*    
    function getTasksMoverDelayProp() {
        return localStorage.tasks_mover_delay;
    };
    
    function getAutoSyncProp() {
        if(localStorage.auto_sync === undefined)
            localStorage.auto_sync = 0;
            
        return localStorage.auto_sync;
    };
    
    function getAutoLoginProp() {
        if(localStorage.auto_login === undefined)
            localStorage.auto_login = 1;
            
        return localStorage.auto_login;
    };
    
    function setTasksMoverDelayProp(val) {
        localStorage.tasks_mover_delay = val;
    };
    
    function setAutoSyncProp(val) {
        if(val == 0 || val == 1)
            localStorage.auto_sync = val;
    };
    
    function setAutoLoginProp(val) {
        if(val == 0 || val == 1)
            localStorage.auto_login = val;
    };
*/
}();


var Util = function() {
    /* 
    Public/private access sorted using Revealing Module Pattern 
    http://www.wait-till-i.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/
    */
    /* Public pointers to private functions */
    return {
        pad: pad,
        logger: logger,
        getArrayKeys: getArrayKeys,
        sortAssociativeArray: sortAssociativeArray,
        getItemState: getItemState,
        getItemsSize: getItemsSize,
        getUnsyncedItemsCount: getUnsyncedItemsCount,
        getOverdueTasks: getOverdueTasks,
        getLastSyncTimestamp: getLastSyncTimestamp,
        getEmptyPinDots: getEmptyPinDots,
        // getPinDots: getPinDots,
        verifyPincode: verifyPincode,
        setupPincode: setupPincode,
		hideKeyboard: hideKeyboard,
        syncOnlyItems: syncOnlyItems,
        syncListOfItems: syncListOfItems,
        remoteSyncItem: remoteSyncItem,
        itemLocalSaverCB: itemLocalSaverCB,
        eventLocalSaverCB: eventLocalSaverCB,
        occasionLocalSaverCB: occasionLocalSaverCB,
        getMoveCompletedTimeStamp: getMoveCompletedTimeStamp,
        setHideCompletedTaskTimeStamp: setHideCompletedTaskTimeStamp,
        getBadgeText: getBadgeText
		,cacheItemLocally: cacheItemLocally
    };
    
    /* Private functions */
    function pad(n, len) {
        s = n.toString();
        if (s.length < len) {
            s = ('0000000000' + s).slice(-len);
        }
        return s;
    };
    
    function logger(txt, obj) {
        if(Environment.debug()) {
            if(Ext.isEmpty(obj))
                console.log(txt);
            else {
                if(Ext.is.Phone) { 
                    if(Ext.isObject(obj)) {
                        console.log(txt);
                        console.log(obj);
                    } else
                        console.log(txt + obj);
                } else
                    console.log(txt, obj);
            }
        }
    };
    
    function sortAssociativeArray(assArray, sortFn){
        // Setup Arrays
        var sortedKeys = new Array();
        var sortedAssArray = {};

        // Separate keys and sort them
        for (var k in assArray)
            sortedKeys.push(k);

        sortedKeys.sort(sortFn);

        // Reconstruct sorted obj based on keys
        for (var i = 0, ln = sortedKeys.length; i < ln; i++)
            sortedAssArray[sortedKeys[i]] = assArray[sortedKeys[i]];

        return sortedAssArray;
    };
    
    function getArrayKeys(assArray) {
        var keys = [], i = 0;
        for(var key in assArray)
            keys[i++] = key;
            
        return keys;
    };
    
    function getRESTUrl(entity, item, action) {
        Util.logger('In Util.getRESTUrl');

        var returnUrl = '';
		// entity = (entity == 'event_all') ? eventsEntities[0] : entity;
        var entityMapped = (entity == 'event_all') ? 'allevents' : allEntitiesMap[entity];
            
        returnUrl = '/apiv2/'+Api.pluralize(entityMapped);
        switch(action) {
            case 'new':
                returnUrl += '/create';
                break;
            case 'edit':
                returnUrl += '/update/'+item.id;
                break;
            case 'delete':
                returnUrl += '/'+item.id;
                break;
            default:
                returnUrl += '/'+action;
        }
        if(entity == 'todo') {
            if(action == 'toggle')
                returnUrl += '/'+item.id;
        } 
        else if(entity == 'note' && !Ext.isEmpty(item) && Ext.isNumber(item.id) && item.id > 0 && Ext.isEmpty(item.description)) {
            //item.id is last_id and action == '' means no sync is needed
            if(action == '')
                returnUrl += '?last_id='+item.id;
        }
        else if((eventsEntities.indexOf(entity) != -1) && (action == '' || action == 'sync')) {
            var startDateStr = (!Ext.isEmpty(item) && item.id < 0) ? Api.formatToUTCDate(item.starts_at) : Api.getLocalStorageProp('events_start_time');
            var endDateStr = (!Ext.isEmpty(item) && item.id < 0) ? Api.formatToUTCDate(item.ends_at) : Api.getLocalStorageProp('events_end_time');
            // Util.logger('startDateStr is: ', startDateStr);
            // Util.logger('endDateStr is: ', endDateStr);
            returnUrl = (Ext.isEmpty(action)) ? returnUrl.slice(0, returnUrl.length-1) : returnUrl;
            returnUrl += '?start_time='+startDateStr+'&end_time='+endDateStr;
        }
        
        return returnUrl;
    };

    function getHTTPMethod(entity, action) {
        var returnMethod = '';
        returnMethod = 'GET';
        if(action == 'new')
            returnMethod = 'POST';
        else if(action == 'edit' || action == 'sync')
            returnMethod = 'PUT';
        else if(action == 'delete')
            returnMethod = 'DELETE';
        
        if(entity == 'todo' && action == 'toggle') {
            returnMethod = 'PUT';
        }
        return returnMethod;
    };
    
    function getRESTParams(entity, item, action) {
        Util.logger('In Util.getRESTParams');
        // Util.logger('::domian plural is=> '+Api.pluralize(entity));
        var paramsList, params = item,
			syncEntity, syncItem, i = 0;
		
        if(Ext.isEmpty(item) || (item.id == -1 || item.id == -2))
            params = {};
            
        // if(entity == 'todo' || entity == 'note') {
        if(action == 'sync' && Api.isSyncNeeded(entity)) {
            params = {};
            do {
				syncEntity = (entity == 'event_all') ? eventsEntities[i] : entity;
				syncItem = (Ext.isEmpty(item.type) || (item.type == syncEntity)) ? item : null;
				
				paramsList = getSyncableItemsToJSON(syncEntity, syncItem);
            
				// console.log('\nentity is:'+entity+'\n');
				// console.log(paramsList);
	            if(paramsList.length != localStorage['unsaved_'+Api.pluralize(syncEntity)+'_count'])
	                Util.logger('[INFO]:: There is mismatch in '+Api.pluralize(syncEntity)+' state = '+paramsList.length+
	                                ' AND unsaved_count = '+localStorage['unsaved_'+Api.pluralize(syncEntity)+'_count']);
                
				if(!Ext.isEmpty(paramsList))
	            	params[Api.pluralize(allEntitiesMap[syncEntity])] = paramsList;
            
	            if(syncEntity == 'note' && !Ext.isEmpty(item) && Ext.isNumber(item.id) && item.id > 0 && Ext.isEmpty(item.description))
	                params['last_id'] = item.id;

		    } while(entity == 'event_all' && (!Ext.isEmpty(eventsEntities[++i])));
		    
        }
        // }
        
        return params;
    };
    
    /*
    This method reads the current persistence state and the action performed on the item
        and returns the resulting persistence state
    current_state refers to the current persistence state of the item, which can be
        'select', 'insert', 'update' or 'delete'
    action refers to the 'new', 'edit', 'delete' or 'toggle' action performed on the item
    */
    function getItemState(current_state, action) {
        var resultant_state = translateState(action);
        if(current_state == 'insert') {
            resultant_state = 'insert';
            //if(action == 'delete') is managed outside this function
        } else if(current_state == 'update') {
            if(action != 'delete')
                resultant_state = 'update';
        } else if(current_state == 'delete') {
            resultant_state = current_state;
        }
        
        return resultant_state;
    };
    
    function translateState(action) {
        var translated_action = action;
        if(action == 'new')
            translated_action = 'insert';
        else if(action == 'edit')
            translated_action = 'update';

        return translated_action;
    };
    
    function getItemsSize(entity) {
        Util.logger('Util.getItemsSize called with entity:: '+entity);
        var size = 0;
        var user_id = Api.getLocalStorageProp('user_id');
        
        if(Ext.isEmpty(user_id)) {
            Util.logger('[WARN]:: Util.getItemsSize() => user_id is invalid: '+user_id);
            return;
        }
        
        if(entity != 'event_all')
            size = Api.getLocalStorageSize(entity+'_'+user_id);
        else
            Ext.each(eventsEntities, function(entity, i, allItems) { size += Api.getLocalStorageSize(entity+'_'+user_id) });
/*            return Api.getLocalStorageSize('Event_'+localStorage.user_id) +
                Api.getLocalStorageSize('Birthday_'+localStorage.user_id) +
                Api.getLocalStorageSize('Anniversary_'+localStorage.user_id);
*/
        return size;
    };

    function getUnsyncedItemsCount(entity) {
        Util.logger('Util.getUnsyncedItemsCount called with entity:: '+entity);
        var count = 0;
        
        if(Ext.isEmpty(entity))
            Ext.each(allEntities, function(entity, i, allItems) { count += Api.parseIntZero(localStorage['unsaved_'+Api.pluralize(entity)+'_count']) });
        else if(entity == 'event_all')
            Ext.each(eventsEntities, function(entity, i, allItems) { count += Api.parseIntZero(localStorage['unsaved_'+Api.pluralize(entity)+'_count']) });
        else 
            count = Api.parseIntZero(localStorage['unsaved_'+Api.pluralize(entity)+'_count']);
            
        return count;
    };
    
    /* This funciton expects the tasks to be unsorted 
        while isToday refers to the boolean whether today's due tasks should also be included.
    */
    function getOverdueTasks(tasks, isToday) {
        var taskDueDate, summaryKey, overdueTasksCount = 0,
            nowFormatted = new Date().format('Y-m-d');
        
        for(var i = 0, ln = tasks.length; i < ln; i++) {
            taskDueDate = tasks[i].get('due_at');
            if(!Ext.isEmpty(taskDueDate) && Ext.isEmpty(tasks[i].get('completed_at'))) {
                summaryKey = taskDueDate.format('Y-m-d');
                //since it is a sorted associative array
                if(summaryKey < nowFormatted)
                    overdueTasksCount++;
                else {
                    if(isToday && summaryKey == nowFormatted)
                        overdueTasksCount++;
                }
            }
        }
        return overdueTasksCount;
    };
    
    function getLastSyncTimestamp() {
        return Api.parseFromUTCDate(Api.getLocalStorageProp('last_sync_timestamp'));
    };
    
    function getEmptyPinDots(pinItem, isEmpty) {
        if(isEmpty) {
            pinItem.dot1 = "";
            pinItem.dot2 = "";
            pinItem.dot3 = "";
            pinItem.dot4 = "";
        } else {
            pinItem.dot1 = "X";
            pinItem.dot2 = "X";
            pinItem.dot3 = "X";
            pinItem.dot4 = "X";
        }
        
        return pinItem;
    };
    
    function getPinDots(pinItem, pinCode) {
        if(pinCode.length == 0) {
            pinItem = getEmptyPinDots(pinItem, true);
        } else if(pinCode.length == 1) {
            pinItem.dot1 = "X";
        } else if(pinCode.length == 2) {
            pinItem.dot1 = "X";
            pinItem.dot2 = "X";
        } else if(pinCode.length == 3) {
            pinItem.dot1 = "X";
            pinItem.dot2 = "X";
            pinItem.dot3 = "X";                
        } else {
            pinItem.dot1 = "X";
            pinItem.dot2 = "X";
            pinItem.dot3 = "X";
            pinItem.dot4 = "X";
        }
        return pinItem;
    };
    
    function verifyPincode(numEntered, pinPanel) {
        Util.logger('verifyPincode called');
        var pinItem = new Object(),
            entered_pin_code = Api.getLocalStorageProp('tmp_pin_code');
        Util.logger('Tapped is::', numEntered);
        Util.logger('pin code is::', Api.getLocalStorageProp('pin_code'));
        Util.logger('entered pin code before is::', Api.getLocalStorageProp('tmp_pin_code'));

        pinItem.mainMsg = "Enter Your Pincode";
        // pinItem.loginVal = "Login";
        pinItem.loginVal = "";
        pinItem = getEmptyPinDots(pinItem, true);

        Util.logger('isNumber::', Ext.isNumber(parseInt(numEntered, 10)));

        if(Ext.isNumber(parseInt(numEntered, 10))) {
            entered_pin_code += numEntered;
            Api.setLocalStorageProp('tmp_pin_code', entered_pin_code);
            if(entered_pin_code.length < 4) {
                pinItem = getPinDots(pinItem, Api.getLocalStorageProp('tmp_pin_code'));
                
                pinPanel.update(pinItem);
            } else {
                pinItem = getEmptyPinDots(pinItem, false);

                if(entered_pin_code == Api.getLocalStorageProp('pin_code')) {
                    Util.logger('Pin code verified');

                    pinItem.mainMsg = '<span class="green">Pincode Verified</span>';

                    pinPanel.update(pinItem);
                } else {
                    Util.logger('Invalid Pin code entered');
                    pinItem.mainMsg = '<span class="red"><strong>Wrong Pincode</strong><br/>Try Again</span>';
                    pinItem = getEmptyPinDots(pinItem, false);

                    pinPanel.update(pinItem);
                    Api.setLocalStorageProp('tmp_pin_code', '');
                    
                    setTimeout(function() {
                        // pinItem.mainMsg = "Enter Your Pincode";
                        pinItem = getEmptyPinDots(pinItem, true);

                        pinPanel.update(pinItem);
                    }, 700);
                }
            }
        } else {
            if(numEntered == 'Back') {
                if(entered_pin_code.length > 0) {
                    Api.setLocalStorageProp('tmp_pin_code', entered_pin_code.slice(0, entered_pin_code.length-1));
                    
                    pinItem = getPinDots(pinItem, Api.getLocalStorageProp('tmp_pin_code'));
                    pinPanel.update(pinItem);
                }
            }
        }
        
        Util.logger('entered pin code is::', Api.getLocalStorageProp('tmp_pin_code'));
        
    };
    
    function setupPincode(numEntered, pinPanel) {
        Util.logger('setupPincode called');
        var pinItem = new Object(),
            entered_pin_code = Api.getLocalStorageProp('tmp_pin_code'),
            entered_pin_code2 = Api.getLocalStorageProp('tmp_pin_code2');
        Util.logger('isNumber::', Ext.isNumber(parseInt(numEntered, 10)));

        Util.logger('thing entered::', numEntered);
        pinItem.mainMsg = "Set Your Pincode";
        pinItem.loginVal = "";
        pinItem = getEmptyPinDots(pinItem, true);

        /*
        if(!Ext.isEmpty(Api.getLocalStorageProp('pin_code')) && (Api.getLocalStorageProp('tmp_pin_code') < 4 || 
            Api.getLocalStorageProp('pin_code') != Api.getLocalStorageProp('tmp_pin_code'))) {
            Util.logger('pin code is::', Api.getLocalStorageProp('pin_code'));
                
            verifyPincode(numEntered, pinPanel);
            
            if(Api.getLocalStorageProp('pin_code') == Api.getLocalStorageProp('tmp_pin_code')) {
                setTimeout(function() {
                    Util.logger('Enter New Pin code');
                    // pinItem.mainMsg = "Please enter the new Pin Code";
                    pinItem = getEmptyPinDots(pinItem, true);
                    pinPanel.update(pinItem);
                }, 500);
            }
            
        } 
        else */
        if(Ext.isNumber(parseInt(numEntered, 10))) {
            if(entered_pin_code.length < 4) {
                entered_pin_code += numEntered;
                Api.setLocalStorageProp('tmp_pin_code', entered_pin_code);
                
                pinItem = getPinDots(pinItem, Api.getLocalStorageProp('tmp_pin_code'));
                pinPanel.update(pinItem);
                
                if(entered_pin_code.length == 4) {
                    Util.logger('Enter Pin code again');
                    pinItem.mainMsg = "Verify Your Pincode";
                    pinItem = getEmptyPinDots(pinItem, true);
                    pinPanel.update(pinItem);
                }
                
                Util.logger('tmp_code::', Api.getLocalStorageProp('tmp_pin_code'));
            } else {
                entered_pin_code2 += numEntered;
                Api.setLocalStorageProp('tmp_pin_code2', entered_pin_code2);
                pinItem.mainMsg = "Verify Your Pincode";
                pinItem = getPinDots(pinItem, Api.getLocalStorageProp('tmp_pin_code2'));
                pinPanel.update(pinItem);
                
                if(entered_pin_code2.length == 4) {
                    if(entered_pin_code == entered_pin_code2) {
                        Util.logger('Pincode Verified');
                        
                        Api.setLocalStorageProp('pin_code', entered_pin_code);
                        pinItem.mainMsg = '<span class="green">Pincode Verified</span>';
                        pinPanel.update(pinItem);
                        
/*
                        setTimeout(function() {
                            pinPanel.hide();
                            BottomTabsInline.show();
                        }, 500);
                        
*/
                        // Api.setLocalStorageProp('ver_pin_code', '');
                        
                    } else {
                        Util.logger('Retry. Pincode Does Not Match');
                        pinItem.mainMsg = '<span class="red">Retry. Pincode Does Not Match</span>';
                        pinItem = getPinDots(pinItem, Api.getLocalStorageProp('tmp_pin_code2'));
                        pinPanel.update(pinItem);
                        
                        Api.setLocalStorageProp('tmp_pin_code', '');
                        Api.setLocalStorageProp('tmp_pin_code2', '');
                        setTimeout(function() {
                            // pinItem.mainMsg = "Set Your Pincode";
                            // pinItem.loginVal = "";
                            pinItem = getEmptyPinDots(pinItem, true);
                            pinPanel.update(pinItem);                                
                        }, 1300);                            
                    }
                }
                Util.logger('tmp_code2::', Api.getLocalStorageProp('tmp_pin_code2'));
            }
        } else if(numEntered == 'Back') {
            if(entered_pin_code2.length > 0) {
                Api.setLocalStorageProp('tmp_pin_code2', entered_pin_code2.slice(0, entered_pin_code2.length-1));
                pinItem = getPinDots(pinItem, Api.getLocalStorageProp('tmp_pin_code2'));
                pinItem.mainMsg = "Verify Your Pincode";
                pinPanel.update(pinItem);
            } else if(entered_pin_code.length > 0 && entered_pin_code.length !== 4) {
                Api.setLocalStorageProp('tmp_pin_code', entered_pin_code.slice(0, entered_pin_code.length-1));
                pinItem = getPinDots(pinItem, Api.getLocalStorageProp('tmp_pin_code'));
                pinPanel.update(pinItem);
            }
        }
        
    };
    
	function hideKeyboard(compId) {
		var titleField;
		if(Ext.is.iOS) {
            // titleField = Ext.get(compId);
            // titleField.down('input').dom.focus();
            // titleField.down('input').dom.blur();
            // titleField.fieldEl.dom.focus();                                
            // titleField.fieldEl.dom.blur();
        }
        // this.toolbar.setTitle(this.label);
        else if(Ext.is.Android) {
            window.KeyBoard.hideKeyBoard();
            titleField = Ext.getCmp(compId);
            titleField.fieldEl.dom.focus();                                
            titleField.fieldEl.dom.blur();
        }
	};

    /*
    This interface method only syncs any unsaved items from localStorage
    If remote sync is performed, then it also fetches the latest list of items
    */
    function syncOnlyItems(entity, callBack, failCallBack) {
        // remoteSyncItem(entity, null, null, Ext.emptyFn, callBack, failCallBack);
        Util.logger('auto_sync prop is::', Api.getLocalStorageProp('auto_sync'));
        if(Api.getLocalStorageProp('auto_sync') == 1)
            remoteSyncItem(entity, null, null, Ext.emptyFn, callBack, failCallBack);
    };
    
    /*
    This interface method syncs any unsaved items from localStorage
    Whether remote sync is performed or not, it always fetches the latest list of items
    entity refers to the entity for which this function is called
    item refers to the last item in the current list
    */
    function syncListOfItems(entity, item, callBack, failCallBack) {
        Util.logger('Util.syncListOfItems called');
        
        var action = '';
        var errMsg = "Device Offline or Server not responding!";
        // var paramEntity = (eventsEntities.indexOf(entity) != -1) ? 'event_all' : entity;
        
		Util.logger('entity is::', entity);
        
        // Util.logger(localStorage['unsaved_'+Api.pluralize(entity)+'_count']);
        //if there are unsaved notes then this method will try to sync first

        if(Api.isSyncNeeded(entity)) {
            action = 'sync';
        }

        var itemSaverCB = entitiesItemSaverMap[entity];
        if(Environment.debug()) {
            var url = getRESTUrl(entity, item, action);
            var method = getHTTPMethod(entity, action);
            var params = Api.authParams({});
            var jsonData = getRESTParams(entity, item, action);
        }
        Util.logger(params);
        Util.logger('JSON encoded params are: ', Ext.encode(params));
        Util.logger(jsonData);
        Util.logger('JSON encoded jsonData is: ', Ext.encode(jsonData));
        Util.logger('Remote call with :: method is: '+method+' url is: '+url);
        
        Ext.getBody().mask('Sync', 'x-mask-loading syncFeedback', false);
        Ext.Ajax.request({
            url: Api.urlFor(getRESTUrl(entity, item, action)),
            method: getHTTPMethod(entity, action),
            params: Api.authParams({}),
            jsonData: getRESTParams(entity, item, action),
			headers: (Ext.is.Android) ? {'Connection' : 'keep-alive'} : {},
            timeout: 10000,
            success: function(response, opts) {
				syncStop = (new Date()).getTime();
				Util.logger('\n\n\n====>The '+(++syncIndex)+'th >'+entity+'< call took absolute time::'+ (syncStop-syncStart));
				Util.logger('\nThe '+(syncIndex)+'th call took relative to last time::'+ (syncStop-lastSyncStart));
				lastSyncStart = syncStop;
                Util.logger('[INFO]:: server-side success with status code ',  response.status);
                Util.logger('entity is:', entity);
                // Util.logger('raw data is::',response.responseText);
                var data = Ext.decode(response.responseText);
                Util.logger('items size is:', data.length);
                // Util.logger(data);
                
                if(entity === 'todo') {
                    var comp_todo_data = data.completed_todos;
                    var uncomp_todo_data = data.uncompleted_todos;
                    
                    // data = data.uncompleted_todos.concat(data.completed_todos);
                    data = uncomp_todo_data.concat(comp_todo_data);
                }
                
                if(entity === 'note' && !Ext.isEmpty(item) && Ext.isNumber(item.id))
                    appendAllItemsLocally(entity, data, itemSaverCB);
                else {
                    Api.setLocalStorageProp('last_sync_timestamp', Api.formatToUTCDate(new Date()));
                    if(!Ext.isEmpty(item) && Ext.isNumber(item.id) && (item.id == -1 || item.id == -2)) {
                        Api.setLocalStorageProp('events_start_time', Api.formatToUTCDate(item.starts_at));
                        Api.setLocalStorageProp('events_end_time', Api.formatToUTCDate(item.ends_at));
                    }
                        
					if(entity == 'event_all') {
						Ext.each(eventsEntities, function(eveItem, i, allItems) { 
							resetAllItemsLocally(eveItem, data[Api.pluralize(eveItem.toLowerCase())], entitiesItemSaverMap[eveItem]); 
						});
	                } else
                    	resetAllItemsLocally(entity, data, itemSaverCB);
                }

                // if(!Ext.isEmpty(item))
                callBack(entity);
                    
                Ext.getBody().unmask();
            },
            failure: function(response, opts) {
                Util.logger('[INFO]:: server-side failure with status code ', response.status);
                Util.logger(response.request.timedout);
                
                if(!Ext.isEmpty(response.request.timedout)) {
                    errMsg = 'Request timedout'
                    // callBack(entity, '');
                } else if(response.status != 0) {
                    errMsg = Ext.decode(response.responseText).error;
                    // callBack(entity, '');
                } else {
                    // callBack(entity, 'time_delay');
                }
                
                if(!Ext.isEmpty(item))
                    callBack(entity);

                Ext.getBody().unmask();
                // failCallBack(entity.capitalize()+"s Failed!", errMsg)
            }
        });
    };
    
    /*
    This method saves the current param item and syncs any unsaved items from localStorage
    If remote sync is performed, then it also fetches the latest list of items
    If remote sync is not performed, then it simply calls the corresponding remote (REST) method
    */
    function remoteSyncItem(entity, item, action, callBack, syncCallBack, failCallBack) {
        Util.logger('Util.remoteSyncItem called');
        var index = 0;
        var errMsg = "Device is Offline or Server not responding!";
        // var eventsArr = [allEntities[2], allEntities[3], allEntities[4]]; //['Event', 'Birthday', 'Anniversary'];
        
        
        //if there are unsaved items other than the current one then this method will try to sync too
        if(Api.isSyncNeeded('') && action != 'toggle')//localStorage['unsaved_'+Api.pluralize(entity)+'_count'] > 1) {
            action = 'sync';
        else if(Ext.isEmpty(item)) {
            Util.logger('[INFO]:: In remoteSyncItem():: the item param is empty and entity: '+entity+' is not Syncable');
            return;
        }
        
        if(!Ext.isEmpty(item)) {
            localStorage['unsaved_'+Api.pluralize(entity)+'_count']++;
            index = (eventsEntities.indexOf(entity) != -1) ? item['event_id']-1 : item[entity+'_id']-1;
        }
        
        if(Environment.debug()) {
            var url = getRESTUrl(entity, item, action);
            var method = getHTTPMethod(entity, action);
            var params = Api.authParams(getRESTParams(entity, item, action));
        
            Util.logger('JSON encoded params are: ', Ext.encode(params));
            Util.logger('Remote call with :: method is: '+method+' url is: '+url);
            Util.logger('localStorage[unsaved_'+Api.pluralize(entity)+'_count]: '+localStorage['unsaved_'+Api.pluralize(entity)+'_count']);
        }
        
        if(action === 'sync')
            remoteSync(entity, item, index, action, callBack, syncCallBack, failCallBack);
        else
            remoteSave(entity, item, index, action, callBack, syncCallBack, failCallBack);
        
    };
    
    function remoteSync(entity, item, index, action, callBack, syncCallBack, failCallBack) {
        var errMsg = "Device Offline or Server not responding!";
        var itemSaverCB = entitiesItemSaverMap[entity];
        var paramEntity = ((eventsEntities.indexOf(entity) != -1) && (getUnsyncedItemsCount('event_all') > 1)) ? 'event_all' : entity;

/*
            var url 	= getRESTUrl(paramEntity, item, action);
            var method 	= getHTTPMethod(paramEntity, action);
            var params 	= getRESTParams(paramEntity, item, action);
        
            console.log('JSON encoded params are: ');
 			console.log(Ext.encode(params));
            console.log('Remote call with :: method is: '+method+' url is: '+url);
            console.log('localStorage[unsaved_'+Api.pluralize(entity)+'_count]: '+localStorage['unsaved_'+Api.pluralize(entity)+'_count']);
*/
		
        if(Api.getLocalStorageProp('auto_sync') == 1) {
        
            Ext.getBody().mask('Synchronizing...', 'x-mask-loading', false);
            Ext.Ajax.request({
                url: Api.urlFor(getRESTUrl(paramEntity, item, action)),
                method: getHTTPMethod(paramEntity, action),
                params: Api.authParams({}),
                jsonData: getRESTParams(paramEntity, item, action),
                timeout: 10000,
                success: function(response, opts) {
                    Util.logger('[INFO]:: server-side success with status code ', response.status);
                    var data = Ext.decode(response.responseText);
                    Util.logger(data);

                    if(paramEntity === 'todo') {
                        var comp_todo_data = data.completed_todos;
                        var uncomp_todo_data = data.uncompleted_todos;
                        // data = data.uncompleted_todos.concat(data.completed_todos);
                        data = uncomp_todo_data.concat(comp_todo_data);
                    }
 
					if(paramEntity == 'event_all') {
						Ext.each(eventsEntities, function(eveItem, i, allItems) { 
							updateItemsLocally(eveItem, data[Api.pluralize(eveItem.toLowerCase())], index, action, entitiesItemSaverMap[eveItem]); 
						});
	                } else
						updateItemsLocally(paramEntity, data, index, action, itemSaverCB);
                                    
                    Util.logger('[INFO] Item saved remotely!');
                                    
                    Api.setLocalStorageProp('last_sync_timestamp', Api.formatToUTCDate(new Date()));
                    syncCallBack(entity);

                    Ext.getBody().unmask();
                },
                failure: function(response, opts) {
                    Util.logger('[INFO]:: server-side failure with status code ', response.status);
                    Util.logger(response);
                
                    // callBack();
                    if(!Ext.isEmpty(response.request.timedout)) {
                        errMsg = 'Request timedout'
                        syncCallBack(entity, '');
                    } else if(response.status != 0) {
                        errMsg = Ext.decode(response.responseText).error;
                        syncCallBack(entity, '');
                    } else {
                        syncCallBack(entity, 'time_delay');
                    }
                
                    Ext.getBody().unmask();
                    //:::todo::: this doesn't work fine for airplane mode
                    // failCallBack(entity.capitalize()+"s Failed!", errMsg);
                
                }
            });
        }
        
        cacheItemLocally(entity, item, index);
        callBack(item);
        
    };
    
    function remoteSave(entity, item, index, action, callBack, syncCallBack, failCallBack) {
        var itemSaverCB = entitiesItemSaverMap[entity];
        var errMsg = "Device Offline or Server not responding!";
        
        if(Ext.isEmpty(item)) {
            Util.logger('[INFO]:: In remoteSave():: the item param is empty');
            return;
        }
        
        if((Api.getLocalStorageProp('auto_sync') == 1) && action != 'toggle') {
        
            Ext.Ajax.request({
                url: Api.urlFor(getRESTUrl(entity, item, action)),
                method: getHTTPMethod(entity, action),
                params: Api.authParams({}),
                jsonData: getRESTParams(entity, item, action),
                success: function(response, opts) {
                    Util.logger('[INFO]:: server-side success with status code ', response.status);
                    var data = Ext.decode(response.responseText);
                    Util.logger(data);
                    updateItemsLocally(entity, data, index, action, itemSaverCB);
                
                    Util.logger('[INFO] Item saved remotely!');
                
                    // callBack();
                    syncCallBack(entity);
                },
                failure: function(response, opts) {
                    Util.logger('[INFO]:: server-side failure with status code ', response.status);
                    Util.logger(response);
                
                    if(!Ext.isEmpty(response.request.timedout)) {
                        errMsg = 'Request timedout'
                        syncCallBack(entity, '');
                    } else if(response.status != 0) {
                        errMsg = Ext.decode(response.responseText).error;
                        syncCallBack(entity, '');
                    } else {
                        syncCallBack(entity, 'time_delay');
                    }
                
                    Util.logger('[WARN]: Util.remoteSave() failure occured with error msg::', errMsg);
                    // failCallBack(entity.capitalize()+" Failed!", errMsg);
                }
            });
        }
        
        cacheItemLocally(entity, item, index);
        callBack(item);
        
    };
    
    function updateItemsLocally(entity, items, index, action, itemSaverCB) {
        var user_id = Api.getLocalStorageProp('user_id');

        // Util.logger('In updateItemsLocally() => the itemsSaverCB is::',itemsSaverCB);
        if(Ext.isEmpty(user_id)) {
            Util.logger('[WARN]:: Util.updateItemsLocally() => user_id is invalid: ', user_id);
            return;
        }

        if(action == 'sync') {
            resetAllItemsLocally(entity, items, itemSaverCB);
        
        } else if(action == 'delete') {
            //items is only 1 item in this case
            Api.clearLocalStorage(entity+'_'+user_id+'['+index+']');
        } else {
            Util.logger('newItem after remote saving:::', JSON.stringify(items));
            //items is only 1 item in this case
            itemSaverCB(entity, index, items, user_id);
        }
        
        localStorage['unsaved_'+Api.pluralize(entity)+'_count'] = 0;
        
    };

    function cacheItemLocally(entity, item, index) {
        var user_id = Api.getLocalStorageProp('user_id');
        if(Ext.isEmpty(user_id)) {
            Util.logger('[WARN]:: Util.cacheItemLocally() => user_id is invalid: ', user_id);
            return;
        }

        if(Ext.isEmpty(item)) {
            Util.logger('[INFO]:: In cacheItemLocally() => item is empty!');
            return;
        }
        
        // if(!Ext.isEmpty(item.account_key))
        delete item.account_key;
        Util.logger('newItem before saving:::', JSON.stringify(item));

        localStorage[entity+'_'+user_id+'['+index+']'] = Ext.encode(item);
        Util.logger('Item saved locally!');
        
    };
    
    function cacheAllItemsLocally(entity, items, startIndex, itemSaverCB) {
        var user_id = Api.getLocalStorageProp('user_id');
        if(Ext.isEmpty(user_id)) {
            Util.logger('[WARN]:: Util.cacheAllItemsLocally() => user_id is invalid: ', user_id);
            return;
        }

        localStorage['unsaved_'+Api.pluralize(entity)+'_count'] = 0;
        // Ext.each(items, function(item, i, allItems) { itemSaverCB(entity, i+startIndex, item, user_id); });
        
        for(var i = 0, ln = items.length; i < ln; i++) {
            itemSaverCB(entity, i+startIndex, items[i], user_id);
        }
    };
    
    function appendAllItemsLocally(entity, items, itemSaverCB) {
        var totalSize = Util.getItemsSize(entity);
        cacheAllItemsLocally(entity, items, totalSize, itemSaverCB);
    };

    function resetAllItemsLocally(entity, items, itemSaverCB) {
        var user_id = Api.getLocalStorageProp('user_id');
        if(Ext.isEmpty(user_id)) {
            Util.logger('[WARN]:: Util.resetAllItemsLocally() => user_id is invalid: ', user_id);
            return;
        }

        Api.clearLocalStorage(entity+'_'+user_id);
        cacheAllItemsLocally(entity, items, 0, itemSaverCB);
    };
    
    function itemLocalSaverCB(entity, index, item, user_id) {
        // Util.logger('Util.itemLocalSaverCB called');
        item[entity+'_id'] = parseInt(index)+1;
        item.cl_state = 'select';
        localStorage[entity+'_'+user_id+'['+index+']'] = Ext.encode(item);
    };

    function eventLocalSaverCB(entity, index, item, user_id) {
        // Util.logger('Util.eventLocalSaverCB called');
        var startsAtDate = Api.parseFromUTCDate(item.starts_at);
        var endsAtDate = Api.parseFromUTCDate(item.ends_at);
        // item.allday = (item.allday || item.allday == 'true') ? true : false;
        item.event_id = parseInt(index)+1;
        item.cl_state = 'select';
        item.occurs_at = item.starts_at;
        // item.starts_at_time = Ext.util.Format.leftPad(startsAtDate.getHours(), 2, '0')+":"+Ext.util.Format.leftPad(startsAtDate.getMinutes(), 2, '0');
        // item.ends_at_time = (!Ext.isEmpty(endsAtDate)) ? Ext.util.Format.leftPad(endsAtDate.getHours(), 2, '0')+":"+Ext.util.Format.leftPad(endsAtDate.getMinutes(), 2, '0') : '';
		
		item.invite_emails = '';
		Ext.each(item.rsvps.accepted, function(invItem, i, allItems) { item.invite_emails += invItem.email + ', '});
		Ext.each(item.rsvps.pending, function(invItem, i, allItems) { item.invite_emails += invItem.email + ', '});
		Ext.each(item.rsvps.declined, function(invItem, i, allItems) { item.invite_emails += invItem.email + ', '});
        item.invite_emails = item.invite_emails.substr(0, item.invite_emails.length-2);
		
        item.month = startsAtDate.getMonth()+1;
        item.day = startsAtDate.getDate();

        localStorage[entity+'_'+user_id+'['+index+']'] = Ext.encode(item);
    };

    function occasionLocalSaverCB(entity, index, item, user_id) {
        // Util.logger('Util.occasionLocalSaverCB called');
        var currStartDate = Api.parseFromUTCDate(Api.getLocalStorageProp('events_start_time'));
        var year = (currStartDate.getMonth()+1 > parseInt(item.month, 10)) ? currStartDate.getFullYear()+1 : currStartDate.getFullYear();

        item.event_id = parseInt(index)+1;
        item.cl_state = 'select';
        item.occurs_at = Api.formatToUTCDate(new Date(year, parseInt(item.month, 10)-1, parseInt(item.day, 10)));

        localStorage[entity+'_'+user_id+'['+index+']'] = Ext.encode(item);
    };

    //newItem needs to be added if its not already in the updated list
    //or it needs to update an old existing one in the updated list
    function getSyncableItemsToJSON(entity, newItem) {
        var user_id = Api.getLocalStorageProp('user_id');
        var params = [];
        var value;
        var isFound = false;
        var itemKey;
        var entityKey = entity+'_'+user_id;
        var entityIdKey = (eventsEntities.indexOf(entity) != -1) ? 'event_id' : entity+'_id';
		
        for (var i = 0, losLength = localStorage.length; i < losLength; i++) {
            itemKey = localStorage.key(i);
            if(itemKey.indexOf(entityKey) != -1) {
                value = Ext.decode(localStorage[itemKey]);
                if(value.cl_state != 'select') {
                    if(!isFound && !Ext.isEmpty(newItem) && value[entityIdKey] == newItem[entityIdKey]) {
                        isFound = true;
                        params.push(newItem);
                    } else
                        params.push(value);
                }
            }
        }
        if(!isFound && !Ext.isEmpty(newItem))
            params.push(newItem);
		
        return params;
    };
    
    function getMoveCompletedTimeStamp() {
        //user wants the todos to be moved to completed list immediately
        if(Ext.isEmpty(Api.getLocalStorageProp('tasks_mover_delay')))
            return new Date();
        
        var autoMoverTimeStamp = new Date().add(Date.HOUR, -Api.getLocalStorageProp('tasks_mover_delay'));
        //if user manually moved the completed tasks before the automatic task mover delay
        if(Api.parseFromUTCDate(Api.getLocalStorageProp('hide_tasks_timestamp')) < autoMoverTimeStamp)
            return autoMoverTimeStamp;
        
        return Api.parseFromUTCDate(Api.getLocalStorageProp('hide_tasks_timestamp'));
    };
    
    function setHideCompletedTaskTimeStamp() {
        Api.setLocalStorageProp('hide_tasks_timestamp', Api.formatToUTCDate(new Date()));
    };
    
    function getBadgeText(entity) {
        var badge_text = '';
        Util.logger('entity is: ', entity);
        if(Api.isSyncNeeded(entity))
            badge_text = getUnsyncedItemsCount(entity);
        
        return badge_text;
    };
}();
