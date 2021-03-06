var Events = function(){
    /* Public pointers to private functions */
    return {
        createEventSEventFormPanel: createEventSEventFormPanel,
        createEventBdayFormPanel: createEventBdayFormPanel,
        createEventAnnivFormPanel: createEventAnnivFormPanel,
        createEventTabPanel: createEventTabPanel,
        createEventSimplePanel: createEventSimplePanel,
        getListBase: getListBase,
        copyToEventObject: copyToEventObject,
        saveEvent: saveEvent,
        renderEventsPanel: renderEventsPanel,
        onAddEventBtnTap: onAddEventBtnTap,
        showEventReadPanel: showEventReadPanel,
        showFreshEventsListPanel: showFreshEventsListPanel,
        refreshEventsListPanel: refreshEventsListPanel,
        refreshEventBadgeTextCB: refreshEventBadgeTextCB,
        setEventReminderLocalNotifications: setEventReminderLocalNotifications
    };

    /* Private functions */
    //__EVENTS utility function start=============================================================================
    function createEventSEventFormPanel(reminder_options, action) {
        var todatePlus, todate = new Date();
        todatePlus = todate.add(Date.HOUR, 1);
        todatePlus.setMinutes(0);
        
        return { 
            // fullscreen: true,
            // layout: 'fit',
            hidden: true,
            title: 'Event',
            cls: 'card1',
            standardSubmit: false,
            items: [{
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'title',
                    placeHolder: '*What',
                    required: true,
                    useClearIcon: true,
                    autoCapitalize : true,
                    id: 'sevent_title_field_'+action
                }, {
                    xtype: 'textfield',
                    name: 'location',
                    placeHolder: 'Where',
                    useClearIcon: true,
                    autoCapitalize : true
                }, {
                    xtype: 'textareafield',
                    name: 'invite_emails',
                    // cls: 'my_class',
                    placeHolder: 'Email participants an invite, comma separated. They will receive an email invite.',
                    autoCapitalize : true,
                    useClearIcon: true,
					listeners: {
						// used to log flurry event
						focus: function(fld, eveObj) {
							isInviteFocused = true;
						}
					}
                }, {
                    xtype: 'datetimepickerfield',
                    name: 'starts_at',
                    // useClearIcon: true,
                    required: true,
                    hideOnMaskTap: true,
                    label: 'Start date',
                    useTitles: true,
                    value: todate.format('M, d, Y H:i'),
                    cls: 'starts_at_field',
                    id: 'sevent_startsAt_field_'+action,
                    picker: {
                        yearFrom: todate.getFullYear(),
                        yearTo: todate.getFullYear()+10,
                        slotOrder: ['hours', 'minutes', 'day', 'month', 'year'],
                        todayText: 'Today',
                        listeners: {
                            beforeshow: function() {
								Util.hideKeyboard('sevent_title_field_'+action);
                            }
                        }
                    }
                }]
			},	{
                xtype: 'fieldset',
                items: [ /*{
                    xtype: 'timepickerfield',
                    name: 'starts_at_time',
                    // id: "starts_at_time",
                    // value: '08:01',
                    label: 'Start time',
                    cls: 'starts_at_time_field',
                    listeners: {
                        timeSelection: function(hours, minutes) {
                            Util.logger('Selected hour is:', hours);
                            Util.logger('Selected minute is:', minutes);
                            // whatever you want if you need
                        }
                    },
                    pickerBeforeShow: function() {
                        Util.logger('Entering pickerBeforeShow');
                        var eventTitleField = Ext.get('sevent_title_field_'+action);
                        eventTitleField.down('input').dom.focus();
                        eventTitleField.down('input').dom.blur();
                    }
                },*/ {
                    xtype: 'datetimepickerfield',
                    name: 'ends_at',
                    // useClearIcon: true,
                    hideOnMaskTap: true,
                    label: 'End date',
                    useTitles: true,
                    value: todatePlus,
                    id: 'event_endsAt_field_'+action,
                    cls: 'ends_at_field',
                    id: 'sevent_endsAt_field_'+action,
                    picker: {
                        yearFrom: todate.getFullYear(),
                        yearTo: todate.getFullYear()+10,
                        hourRounding: 2,
                        slotOrder: ['hours', 'minutes', 'day', 'month', 'year'],
                        todayText: 'Today',
                        listeners: {
                            beforeshow: function() {
								// Util.hideKeyBoard('sevent_title_field_'+action);
                                
                                // set todays date on the default without setting it on the actual object initially
                                if(Ext.isEmpty(this.value)) {
                                    this.value = new Date();
                                    this.setValue(this.value);
                                }
                                this.dockedItems.items[0].insert(1, new Ext.Button({ ui: 'action', text: 'Clear', cls: 'x-clear', handler: onClearEndsAtBtnTap } ));
                                
                            }/*,
                            change: function(pickerEl, newSlot) {
                                Ext.get('event_endsAtTime_field_'+action).show();
                            }
                            */
                        }
                    }
                }, /*{
                    xtype: 'timepickerfield',
                    name: 'ends_at_time',
                    id: 'event_endsAtTime_field_'+action,
                    label: 'End time',
                    hidden: true,//(Ext.isEmpty(Ext.getCmp('event_endsAt_field_'+action).getValue())) ? true : false,
                    cls: 'ends_at_time_field',
                    listeners: {
                        timeSelection: function(hours, minutes) {
                            Util.logger('Selected hour is:', hours);
                            Util.logger('Selected minute is:', minutes);
                            // whatever you want if you need
                        }
                    },
                    pickerBeforeShow: function() {
                        Util.logger('Entering pickerBeforeShow');
                        var eventTitleField = Ext.get('sevent_title_field_'+action);
                        eventTitleField.down('input').dom.focus();
                        eventTitleField.down('input').dom.blur();
                    }
                }, */{
                    xtype: 'checkboxfield',
                    name: 'allday',
                    label: 'All day',
                    cls: 'allday_field',
                    listeners: {
                        check: function(cbox) {
                            Util.logger('Checkbox check fired');
                            cbox.setValue(true);
                        },
                        uncheck: function(cbox) {
                            Util.logger('Checkbox uncheck fired');
                            cbox.setValue(false);
                        }
                    }
                }, {
                    xtype: 'remindselectfield',
                    name: 'remind_before',
                    // useClearIcon: true,
                    hideOnMaskTap: true,
                    label: 'Reminder',
                    options: reminder_options,
                    cls: 'event_remind_before_field',
                    id: 'sevent_remindBefore_field_'+action,
                    pickerBeforeShow: function() {
						// Util.hideKeyBoard('sevent_title_field_'+action);

						if(Ext.is.iOS) {
/*
							var eventTitleField = Ext.get('sevent_title_field_'+action);
							eventTitleField.down('input').dom.focus();
							eventTitleField.down('input').dom.blur();
*/
						}
						// this.toolbar.setTitle(this.label);
						else if(Ext.is.Android) {
							window.KeyBoard.hideKeyBoard();
							Ext.getCmp('sevent_title_field_'+action).fieldEl.dom.focus();                                
							Ext.getCmp('sevent_title_field_'+action).fieldEl.dom.blur();
						}
                    }
                }, {
                    xtype: 'textareafield',
                    name: 'description',
                    placeHolder: 'Notes',
                    autoCapitalize : true,
                    useClearIcon: true
                }]
            }, {
                id: 'sevent_delete_panel_'+action,
                height: (Ext.is.iOS) ? 20 : '',
                cls: 'sevent_delete_panel'
            }]
        };
    };
    
    function createEventBdayFormPanel(reminder_options, action) {
        return {
            // fullscreen: true,
            // layout: 'fit',
            hidden: true,
            title: 'Birthday',
            cls: 'card2',
            standardSubmit: false,
            items: [{
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'title',
                    placeHolder: 'Whose Birthday?*',
                    required: true,
                    useClearIcon: true,
                    autoCapitalize : true,
                    id: 'bday_title_field_'+action
                }, {
                    xtype: 'remindselectfield',
                    name: 'day',
                    // useClearIcon: true,
                    required: true,
                    label: 'Day',
                    hideOnMaskTap: true,
                    options: getDayOptions(),
                    cls: 'bday_day_field',
                    id: 'bday_day_field_'+action,
                    pickerBeforeShow: function() {
						// Util.hideKeyBoard('bday_title_field_'+action);
						if(Ext.is.iOS) {
/*
							var eventTitleField = Ext.get('bday_title_field_'+action);
							eventTitleField.down('input').dom.focus();
							eventTitleField.down('input').dom.blur();
*/
						}
						// this.toolbar.setTitle(this.label);
						else if(Ext.is.Android) {
							window.KeyBoard.hideKeyBoard();
							Ext.getCmp('bday_title_field_'+action).fieldEl.dom.focus();                                
							Ext.getCmp('bday_title_field_'+action).fieldEl.dom.blur();
						}						
                    }
                }, {
                    xtype: 'remindselectfield',
                    name: 'month',
                    // useClearIcon: true,
                    required: true,
                    label: 'Month',
                    hideOnMaskTap: true,
                    options: getMonthOptions(),
                    cls: 'bday_month_field',
                    id: 'bday_month_field_'+action,
                    pickerBeforeShow: function() {
						// Util.hideKeyBoard('bday_title_field_'+action);
						if(Ext.is.iOS) {
/*
							var eventTitleField = Ext.get('bday_title_field_'+action);
							eventTitleField.down('input').dom.focus();
							eventTitleField.down('input').dom.blur();
*/
						}
						// this.toolbar.setTitle(this.label);
						else if(Ext.is.Android) {
							window.KeyBoard.hideKeyBoard();
							Ext.getCmp('bday_title_field_'+action).fieldEl.dom.focus();                                
							Ext.getCmp('bday_title_field_'+action).fieldEl.dom.blur();
						}

                    }
                }, {
                    xtype: 'remindselectfield',
                    name: 'remind_before',
                    // useClearIcon: true,
                    label: 'Reminder',
                    options: reminder_options,
                    cls: 'bday_remind_before_field',
                    id: 'bday_remindBefore_field_'+action,
                    pickerBeforeShow: function() {
						// Util.hideKeyBoard('bday_title_field_'+action);
						if(Ext.is.iOS) {
/*
						var eventTitleField = Ext.get('sevent_title_field_'+action);
						eventTitleField.down('input').dom.focus();
						eventTitleField.down('input').dom.blur();
*/
					}
					// this.toolbar.setTitle(this.label);
					else if(Ext.is.Android) {
						window.KeyBoard.hideKeyBoard();
						Ext.getCmp('bday_title_field_'+action).fieldEl.dom.focus();                                
						Ext.getCmp('bday_title_field_'+action).fieldEl.dom.blur();
					}

                    }
                }]
            }, {
                id: 'bday_delete_panel_'+action,
                height: 180
            }]
        };
    };

    function createEventAnnivFormPanel(reminder_options, action) {
        return {
            // fullscreen: true,
            // layout: 'fit',
            hidden: true,
            title: 'Anniversary',
            cls: 'card3',
            standardSubmit: false,
            items: [{
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'title',
                    placeHolder: 'Which anniversary?*',
                    required: true,
                    useClearIcon: true,
                    autoCapitalize : true,
                    id: 'anniv_title_field_'+action
                }, {
                    xtype: 'remindselectfield',
                    name: 'day',
                    // useClearIcon: true,
                    required: true,
                    label: 'Day',
                    hideOnMaskTap: true,
                    options: getDayOptions(),
                    cls: 'anniv_day_field',
                    id: 'anniv_day_field_'+action,
                    pickerBeforeShow: function() {
						// Util.hideKeyBoard('anniv_title_field_'+action);
						if(Ext.is.iOS) {
/*
							var eventTitleField = Ext.get('sevent_title_field_'+action);
							eventTitleField.down('input').dom.focus();
							eventTitleField.down('input').dom.blur();
*/
						}
						// this.toolbar.setTitle(this.label);
						else if(Ext.is.Android) {
							window.KeyBoard.hideKeyBoard();
							Ext.getCmp('anniv_title_field_'+action).fieldEl.dom.focus();                                
							Ext.getCmp('anniv_title_field_'+action).fieldEl.dom.blur();
						}
						
                    }
                }, {
                    xtype: 'remindselectfield',
                    name: 'month',
                    // useClearIcon: true,
                    required: true,
                    label: 'Month',
                    hideOnMaskTap: true,
                    options: getMonthOptions(),
                    cls: 'anniv_month_field',
                    id: 'anniv_month_field_'+action,
                    pickerBeforeShow: function() {
						// Util.hideKeyBoard('anniv_title_field_'+action);
						if(Ext.is.iOS) {
/*
							var eventTitleField = Ext.get('sevent_title_field_'+action);
							eventTitleField.down('input').dom.focus();
							eventTitleField.down('input').dom.blur();
*/
						}
						// this.toolbar.setTitle(this.label);
						else if(Ext.is.Android) {
							window.KeyBoard.hideKeyBoard();
							Ext.getCmp('anniv_title_field_'+action).fieldEl.dom.focus();                                
							Ext.getCmp('anniv_title_field_'+action).fieldEl.dom.blur();
						}
                    }
                }, {
                    xtype: 'remindselectfield',
                    name: 'remind_before',
                    // useClearIcon: true,
                    label: 'Reminder',
                    options: reminder_options,
                    cls: 'anniv_remind_before_field',
                    id: 'anniv_remindBefore_field_'+action,
                    pickerBeforeShow: function() {
						// Util.hideKeyBoard('anniv_title_field_'+action);
						if(Ext.is.iOS) {
/*
							var eventTitleField = Ext.get('sevent_title_field_'+action);
							eventTitleField.down('input').dom.focus();
							eventTitleField.down('input').dom.blur();
*/
						}
						// this.toolbar.setTitle(this.label);
						else if(Ext.is.Android) {
							window.KeyBoard.hideKeyBoard();
							Ext.getCmp('anniv_title_field_'+action).fieldEl.dom.focus();                                
							Ext.getCmp('anniv_title_field_'+action).fieldEl.dom.blur();
						}
                    }
                }]
            }, {
              id: 'anniv_delete_panel_'+action,
              height: 180
            }]
        };
    };

    function createEventTabPanel(seventPanel, bdayPanel, annivPanel, eventTabHandlerCB) {
        return new Ext.TabPanel({
            // fullscreen: true,
            hidden: true,
            // scroll: 'vertical',
            ui: 'light',
            tabBarDock: 'top',
            // layout: 'card',
            defaults: {
                fullscreen: true,
                scroll: 'vertical'
            },
            // activeItem: 0,
            items: [
                seventPanel, bdayPanel, annivPanel
            ],
            listeners: {
                cardswitch : function(cont, newCard, oldCard, index, isAnimated) {
                    //change: function(tabBar, tab, card) may also be used
                    Util.logger('cardswitch! index is: ', index);
                    eventTabHandlerCB(index);
                }
            }
        });
    };
    
    function createEventSimplePanel(seventPanel, bdayPanel, annivPanel) {
        return new Ext.Panel({
            // fullscreen: true,
            hidden: true,
            scroll: 'vertical',
            // layout: 'fit',
            items: [seventPanel, bdayPanel, annivPanel]
        });
    };
    
    function getListBase(eventsTpl, eventsData, itemtapCB) {
		// var listStore = getEventsListStore(eventsData);
		// listStore.sort();
        return {
            itemTpl: eventsTpl,
            layout: 'fit',
            hidden: true,
            selModel: {
                mode: 'SINGLE',
                allowDeselect: true
            },
            grouped: true,
            store: getEventsListStore(eventsData), //listStore,
            fullscreen: true,
            // scroll: 'vertical',
            listeners: {
                itemtap: itemtapCB,
                refresh: function(comp) {
                    // SCROLL TO TOP
                    // this.scroller.scrollTo({ x: 0, y: 56 });
                    
                    // SCROLL TO TODAY
                    
                    // height of load older events
                    var yOffset = 51;
                    
                    if(this.todayGroupIndex > 0 && this.todayIndex > 0) {
                        
                        yOffset = yOffset + ((this.todayGroupIndex - 1) * 24); // group header height
                        // items in previous groups height
                        for(var i = 1; i < this.todayGroupIndex; i++) {
                            yOffset = yOffset + (this.store.getGroups()[i].children.length * 83); 
                        }
                        
                        // items in current group height
                        yOffset = yOffset + (this.todayIndex  * 83);
                    }
                    this.scroller.scrollTo({ x: 0, y: yOffset });
                }
            },
            groupTpl: [
                '<tpl for=".">',
                    '<div class="x-list-group x-group-{id} x_group_type_{group_type}">',
                        '<h3 class="x-list-header">{groupName}</h3>',
                        '<div class="x-list-group-items">',
                            '{items}',
                        '</div>',
                    '</div>',
                '</tpl>'
            ],
            todayGroupIndex: -1,
            todayIndex: -1,
            collectData : function(records, startIndex) {
                if (!this.grouped) {
                    return Ext.List.superclass.collectData.call(this, records, startIndex);
                }

                var results = [],
                    groups = this.store.getGroups(),
                    ln = groups.length,
                    children, cln, c,
                    group, i, lastMonthDay, currentMonthDay,
                    group_type, todayFound = false;
                var todayStr = new Date().format('Y-m-d');
                this.todayGroupIndex = -1;
                this.todayIndex = -1;
                for(var i = 0, ln = groups.length; i < ln; i++) {
                    group = groups[i];
                    children = group.children;
                    lastMonthDay = "00-00";
                    for(var c = 0, cln = children.length; c < cln; c++) {
                        if(children[c].data.id < 0) {
                            children[c] = children[c].data;
                        } else {
                            currentMonthDay = Util.pad(children[c].data.occurs_at.format('m'), 2) + "-" + Util.pad(children[c].data.occurs_at.format('d'), 2);
                            children[c] = Ext.apply(children[c].data, { firstDateChild: currentMonthDay == lastMonthDay ? false : true });
                            
                            // Indexes to all position calculation to scroll later on
                            if(!todayFound && (todayStr == children[c].occurs_at.format('Y-m-d'))) {
                                todayFound = true;
                                this.todayGroupIndex = i;
                                this.todayIndex = c;
                            }
                            else if(!todayFound && (todayStr < children[c].occurs_at.format('Y-m-d'))) {
                                todayFound = true;
                                this.todayGroupIndex = i;
                                this.todayIndex = c;
                            }
                        }
                        lastMonthDay = currentMonthDay;
                    }
                    groupType = 'has_events';
                    if(children.length == 1 && children[0].id < -2)
                        groupType = 'empty';
                    if(children.length == 1 && children[0].id == -2)
                        groupType = 'prev';
                    if(children.length == 1 && children[0].id == -1)
                        groupType = 'next';
                    results.push({
                        group: group.name,
                        id: this.getGroupId(group),
                        items: this.listItemTpl.apply(children),
                        groupName: (groupType == 'prev' || groupType == 'next') ? ''  : group.name.replace('-', ' '),
                        group_type: groupType
                    });
                }

                return results;
            }
        };
    };
    
    function getEventsListStore(events) {
        return new Ext.data.Store({
            model: 'Events',
            sorters: [{ property: 'occurs_at', direction: 'ASC' }],//{ property: 'month', direction: 'ASC' }, { property: 'day', direction: 'ASC' }, 
            getGroupString : function(record) {
                return Ext.util.Format.date(record.get('occurs_at'), 'F-Y');//record.get('occurs_at').format('F Y');
            },
            groupDir: 'DESC',
            data: [events]
        });
    };

	//NOT used at the moment
	function copyToEventModel(eventItem, isCopy) {
		
		// if(eventModel.data) {
	    var eventModel = Ext.ModelMgr.create({
            id: parseInt(record.get('id')),
            title: record.get('title'),
            location: record.get('location'),
            year: parseInt(record.get('year')),
            month: parseInt(record.get('month'), 10),
            day: parseInt(record.get('day'), 10),
            occurs_at: record.get('occurs_at'),
            starts_at: record.get('starts_at'),
            // starts_at_time: record.get('starts_at_time'),
            ends_at: record.get('ends_at'),
            // ends_at_time: record.get('ends_at_time'),
            allday: record.get('allday'),
            remind_before: record.get('remind_before'),
			invite_emails: record.get('invite_emails'),
            description: record.get('description'),
            event_id: parseInt(record.get('event_id')),
            type: record.get('type'),
            cl_state: record.get('cl_state'),
            client_uid: record.get('client_uid'),
            action: 'edit'},
            'Event');
    	
		return eventModel;
	};
	//NOT used ends
		
    function copyToEventObject(eventModel) {
        var eventObj = new Object();
        eventObj.id = eventModel.get('id');
        eventObj.title = eventModel.get('title');
        eventObj.location = eventModel.get('location');
        eventObj.year = eventModel.get('year');
        eventObj.month = eventModel.get('month');
        eventObj.day = eventModel.get('day');
        eventObj.occurs_at = eventModel.get('occurs_at');
        eventObj.starts_at = eventModel.get('starts_at');
        // eventObj.starts_at_time = eventModel.get('starts_at_time');
        eventObj.ends_at = eventModel.get('ends_at');
        // eventObj.ends_at_time = eventModel.get('ends_at_time');
        eventObj.allday = eventModel.get('allday');
        eventObj.remind_before = eventModel.get('remind_before');
		eventObj.invite_emails = eventModel.get('invite_emails');
        eventObj.description = eventModel.get('description');
        eventObj.type = eventModel.get('type');
        eventObj.created_at = eventModel.get('created_at');
        eventObj.event_id = eventModel.get('event_id');
        eventObj.cl_state = eventModel.get('cl_state');
        eventObj.client_uid = eventModel.get('client_uid');
        return eventObj;
    };

    /*
    title, location, month, day, year, starts_at, ends_at, allday, remind_before refers to the properties of Event item
    type refers to the 'sevent', 'bday', or 'anniv' type of event item
    index refers to the index position in the localStorage events array
    curr_state refers to the current persistence state of the todo item, which can be
        'select', 'insert', 'update' or 'delete'
    action refers to the 'new', 'edit' or 'delete' action performed on the todo item
    callBack refers to the function to call after or parallel to the AJAX request
    syncCallBack refers to the function to call only after the AJAX request returns
    */
    function saveEvent(eventParam, index, curr_state, action, callBack, syncCallBack, failCallBack) {
        Util.logger('In saveEvent()');
        
        // var user_id = Api.getLocalStorageProp('user_id');
        var newEvent = new Object();
/*
        if(curr_state == 'insert' && action == 'delete') {
            localStorage.removeItem(eventParam.type+'_'+user_id+'['+index+']');
            Util.logger('Item removed locally');
            Api.decrementLocalStorageKey('unsaved_'+Api.pluralize(eventParam.type)+'_count');
            callBack();
            syncCallBack();
        } else {
*/
        newEvent.id = eventParam.id;
        newEvent.title = eventParam.title;
        newEvent.location = eventParam.location;
        newEvent.year = eventParam.year;
        newEvent.month = parseInt(eventParam.month, 10);
        newEvent.day = parseInt(eventParam.day, 10);
        newEvent.occurs_at = Api.formatToUTCDate(eventParam.occurs_at);
        newEvent.starts_at = Api.formatToUTCDate(eventParam.starts_at);
        // newEvent.starts_at_time = eventParam.starts_at_time;
        newEvent.ends_at = Api.formatToUTCDate(eventParam.ends_at);
        // newEvent.ends_at_time = eventParam.ends_at_time;
        newEvent.allday = (eventParam.allday) ? 'true' : 'false';
        newEvent.remind_before = eventParam.remind_before;
		newEvent.invite_emails = eventParam.invite_emails;
        newEvent.description = eventParam.description;
        newEvent.type = eventParam.type;
        newEvent.created_at = Api.formatToUTCDate(eventParam.created_at);
        newEvent.updated_at = Api.formatToUTCDate(new Date());
        newEvent.event_id = index+1;
        newEvent.cl_state = Util.getItemState(curr_state, action);
        newEvent.client_uid = eventParam.client_uid;
        
        // Util.logger('newTodo before saving:::',JSON.stringify(newTodo));
        
        Util.remoteSyncItem(newEvent.type, newEvent, action, callBack, syncCallBack, failCallBack);
        
    // }
    };
    //__EVENTS utility function end=============================================================================

    //__EVENTS panels layout start==================================================================================
    function getDayOptions() {
/*        if(Ext.isEmpty(day_options)) {
            day_options = new Array();
            var dayItem = new Object();
            for(day = 1; day <= 31; day++) {
                dayItem = new Object();
                dayItem.text = day+'';
                dayItem.value = day+'';
                day_options.push(dayItem);
            }
        }
*/        return day_options;
    };
    
    function getMonthOptions() {
        month_options = [
            {text: 'January',  value: '1'},
            {text: 'February',  value: '2'},
            {text: 'March', value: '3'},
            {text: 'April', value: '4'},
            {text: 'May',  value: '5'},
            {text: 'June',  value: '6'},
            {text: 'July',  value: '7'},
            {text: 'August',  value: '8'},
            {text: 'September',  value: '9'},
            {text: 'October',  value: '10'},
            {text: 'November',  value: '11'},
            {text: 'December',  value: '12'}];
            
        return month_options;
    };
    
    function renderEventsPanel() {
        // SIM: {title:ellipsis(25, true)}  ==> {[fm.ellipsis(title, 25, true)]}  {occurs_at:date("D j")} 
        var eventsTpl = new Ext.XTemplate(
            '<div id="event_item_{event_id}" class="events_container {[values.id < 0 ? (values.id < -2 ? "" : (values.id == -1 ? "next" : "prev")) : (values.firstDateChild ? "firstDateChild" : "notFirstDateChild")]}">', 
            '<tpl if="!(id &lt; 0)">', 
                '<div class="event_date_container {[this.isOccurringToday(values.occurs_at) ? "today_container" : ""]}">', 
                    '<div class="event_item_day"><span>{occurs_at:date("D")}</span></div>', 
                    '<div class="event_item_date"><span>{occurs_at:date("j")}</span></div>', 
                '</div>', 
                '<div class="event_list_item {[this.isOccurringToday(values.occurs_at) ? "today_list_item" : ""]} title">', 
                    '<div class="eventDescMain">', 
                        '<p class="eventTitle">{[fm.htmlEncode(fm.ellipsis(values.title, 30, true))]}</p>', 
                        '<tpl if="this.isPresent(description)">', 
                            '<p class="note">{[fm.htmlEncode(fm.ellipsis(values.description, 30, true))]}</p>',
                         '</tpl>',  
                        '<tpl if="this.isPresent(location)">', 
                        	'<p class="eventLocation">{location}</p>', 
						'</tpl>', 
                    '</div>', 
                '<tpl if="allday == true || allday == \'true\'">', 
                    '<p class="createdAt">{occurs_at:date("j-M")}</p>', 
                    '<p class="createdAt">&nbsp;All Day</p>', 
                '</tpl>', 
                '<tpl if="allday == false || allday ==\'false\'">', 
                    '<p class="createdAt">{occurs_at:date("j-M g:i A")}</p>', 
                '</tpl>', 
                '<tpl if="(allday == false || allday ==\'false\') && this.isPresent(ends_at)">', 
                    '<p class="createdAt">&nbsp;&ndash;&nbsp;{ends_at:date("j-M g:i A")}</p>', 
                '</tpl>',
                    '<div class="eventType{type}"></div>', 
                    '<div class="reminder {[(this.isPresent(values.remind_before)) ? "hasReminder" : ""]}"></div>',
                '</div>', 
            '</tpl>', 
            '<tpl if="(id == -1) || (id == -2)">', 
                '<div class="event_list_item">{title}</div>', 
            '</tpl>', 
            '<tpl if="(id == -3) || (id == -4) || (id == -5)">', 
                '<div class="event_empty_item">{title}</div>', 
            '</tpl>', 
            '</div>', 
            {
                isOccurringToday: function(d) {
                    return (new Date().format('j,F,Y') == d.format('j,F,Y'));
                },
                isPresent: function(d) {
                    return !Ext.isEmpty(d);
                }
            });
            // ,fm.date(values.values.ends_at,"j-M-Y"),
            // '<p class="createdAt">{[(this.isPresent(values.allday)) ? "All Day" : (this.isPresent(values.ends_at)) ? values.ends_at:date("j-M-Y") : ""]}</p>', 
            // '<p class="reminder {[(this.isPresent(values.remind_before)) ? "hasReminder" : ""]}"></p>', 
        
        var eventReadTpl = new Ext.XTemplate(
            '<div class="eventViewPage">', 
                '<div class="eventViewPageDate">', 
                    '<p class="eventDetail day">{occurs_at:date("D")}</p>', 
                    '<p class="eventDetail date">{occurs_at:date("d")}</p>', 
                    '<div>', 
                        '<p class="eventDetail month">{occurs_at:date("F")}</p>', 
                        '<p class="eventDetail year">{occurs_at:date("Y")}</p>', 
                    '</div>', 
                '</div>', 
                '<div class="eventViewPageContent clear">', 
                	'<p class="event_list_item title clear"><strong>{[fm.htmlEncode(fm.ellipsis(values.title, 40, true))]}</strong></p>', 
                    '<p class="createdAt">{occurs_at:date("ga d M Y")}</p>', 
					'<tpl if="(allday == false || allday ==\'false\') && this.isPresent(ends_at)">', 
                    	'<p class="createdAt"> - {ends_at:date("ga d M Y")}</p>', 
					'</tpl>', 
					'<tpl if="allday == true || allday == \'true\'">', 
						'<p class="event_list_item desc clear">When: All Day</p>', 
					'</tpl>', 
                    '<tpl if="this.isPresent(location)">', 
						'<p class="event_list_item desc clear">Where: {location}</p>', 
                    '</tpl>', 
                    '<tpl if="this.isPresent(invite_emails)">', 
						'<p class="event_list_item desc clear">Invited: {invite_emails:ellipsis(30, false)}</p>', 
                    '</tpl>', 
                    '<tpl if="this.isPresent(description)">', 
	                    '<div class="event_list_item desc clear">', 
							'<p>Notes:{[this.nl2br(fm.htmlEncode(values.description))]}</p>', 
	                    '</div>', 
					'</tpl>', 
                '</div>', 
            '</div>', 
            {
                isPresent: function(c) {
                    return !Ext.isEmpty(c);
                },
				nl2br: function(str) {
					return str.replace(/\n/g, "<br/>");
				}
            });

        var events = [];
        
        eventsTodayBtn = new Ext.Button(Api.getButtonBase('Today', true, 'event_today', onTodayEventBtnTap));

        eventsCancelBtn = new Ext.Button(Ext.apply(
            Api.getButtonBase('Cancel', true, 'event_cancel', onCancelEventBtnTap), 
            { ui: 'cancel' }
            ));

        // events = refreshEventsListData();
        eventsBackBtn = new Ext.Button(Ext.apply(
            Api.getButtonBase('Back', true, 'event_back', onBackEventBtnTap), 
            { ui: 'cancel' }
            ));

        eventsEditBtn = new Ext.Button(Api.getButtonBase('Edit', true, 'event_edit', onEditEventBtnTap));
        eventsDoneBtn = new Ext.Button(Api.getButtonBase('Done', true, 'event_done', onDoneEventBtnTap));
        eventsAddBtn = new Ext.Button(Api.getButtonBase('+', false, 'event_add', onAddEventBtnTap));

        eventsNavBar = new Ext.Toolbar({
            ui: 'dark',
            dock: 'top',
            title: 'Events',
            items: [eventsTodayBtn, eventsBackBtn, eventsCancelBtn, {xtype: 'spacer'}, eventsAddBtn, eventsDoneBtn, eventsEditBtn]
        });

        eventsNextBtn = new Ext.Button(Api.getButtonBase('<span class="btn-next-post"></span>', false, 'event_next', onNextEventBtnTap));
        eventsPrevBtn = new Ext.Button(Api.getButtonBase('<span class="btn-prev-post"></span>', false, 'event_prev', onNextEventBtnTap));

        eventsNextPrevBar = new Ext.Toolbar({
            ui: 'light',
            dock: 'bottom',
            // title: 'Journal',
            hidden: true,
            items: [eventsPrevBtn, {xtype: 'spacer'}, eventsNextBtn],
            listeners: {
                hide: function(comp) {
                    this.up("tabpanel").componentLayout.childrenChanged = true;
                    this.up("tabpanel").doComponentLayout();
                },
                show: function(comp) {
                    this.up("tabpanel").componentLayout.childrenChanged = true;
                    this.up("tabpanel").doComponentLayout();
                }
            }
        });

        //List starts
        Ext.regModel('Events', {
            fields: ['id', 'title', 'location', 'year', 'month', 'day', 'starts_at', 'ends_at',
                              'remind_before', 'invite_emails', 'description', 'created_at', 'event_id', 'type', 'cl_state', 'client_uid']
        });

        eventsListComp = new Ext.List(Ext.apply(Events.getListBase(eventsTpl, events, onEventItemtapCB)));

        //List ends
        
        eventSEventDeleteBtn = new Ext.Button(Ext.apply(
            Api.getButtonBase('Delete', true, 'sevent_delete', function() { 
                    Ext.Msg.confirm("Confirmation", "Are you sure you want to delete that?", onDeleteEventBtnTap);}), 
            { ui: 'decline',
              dock: 'bottom'}
            ));

/*        //this is a workaround to fix rendering issues
        eventSEventDeletePanel = new Ext.Panel({
            // layout: 'fit',
            dock: 'top',
            height: 1,
            dockedItems: [eventSEventDeleteBtn]
        });
*/
        event_reminder_options = [
            {text: 'Never',  value: null},
            {text: '15 minutes',  value: 15*60+''},
            {text: '30 minutes',  value: 30*60+''},
            {text: '45 minutes',  value: 45*60+''},
            {text: '1 hour',  value: 60*60+''},
            {text: '2 hours',  value: 2*60*60+''},
            {text: '3 hours',  value: 3*60*60+''},
            {text: '12 hours',  value: 12*60*60+''},
            {text: '1 day',  value: 24*60*60+''},
            {text: '2 days', value: 2*24*60*60+''},
            {text: '1 week',  value: 7*24*60*60+''}];

        eventSEventAddFormPanel = new Ext.form.FormPanel(Events.createEventSEventFormPanel(event_reminder_options, 'add'));
        eventSEventEditFormPanel = new Ext.form.FormPanel(Ext.apply(Events.createEventSEventFormPanel(event_reminder_options, 'edit'), 
        { fullscreen: true
         // ,layout: 'fit'
        }));
        Ext.getCmp('sevent_delete_panel_edit').addDocked(eventSEventDeleteBtn);
        // eventSEventEditFormPanel.addDocked(eventSEventDeletePanel);
      
        eventBdayDeleteBtn = new Ext.Button(Ext.apply(
            Api.getButtonBase('Delete', true, 'bday_delete', function() { 
                    Ext.Msg.confirm("Confirmation", "Are you sure you want to delete that?", onDeleteEventBtnTap);}),
            { ui: 'decline',
            dock: 'bottom' }
            ));
/*
        //this is a workaround to fix rendering issues
        eventBdayDeletePanel = new Ext.Panel({
            layout: 'fit',
            dock: 'bottom',
            items: [eventBdayDeleteBtn]
        });
*/
        bday_anniv_reminder_options = [
            {text: 'Never',  value: null},
            {text: '1 day',  value: 24*60*60+''},
            {text: '2 days', value: 2*24*60*60+''},
            {text: '3 days', value: 3*24*60*60+''},
            {text: '1 week',  value: 7*24*60*60+''},
            {text: '1 month',  value: 30*24*60*60+''}];

        eventBdayAddFormPanel = new Ext.form.FormPanel(Events.createEventBdayFormPanel(bday_anniv_reminder_options, 'add'));
        eventBdayEditFormPanel = new Ext.form.FormPanel(Ext.apply(Events.createEventBdayFormPanel(bday_anniv_reminder_options, 'edit'),
        { fullscreen: true
          // ,layout: 'fit'
        }));
        
        Ext.getCmp('bday_delete_panel_edit').addDocked(eventBdayDeleteBtn);
        // eventBdayEditFormPanel.addDocked(eventBdayDeletePanel);

        eventAnnivDeleteBtn = new Ext.Button(Ext.apply(
            Api.getButtonBase('Delete', true, 'anniv_delete', function() { 
                    Ext.Msg.confirm("Confirmation", "Are you sure you want to delete that?", onDeleteEventBtnTap);}), 
            { ui: 'decline',
            dock: 'bottom' }
            ));
/*
        //this is a workaround to fix rendering issues
        eventAnnivDeletePanel = new Ext.Panel({
            layout: 'fit',
            dock: 'bottom',
            items: [eventAnnivDeleteBtn]
        });
*/
        eventAnnivAddFormPanel = new Ext.form.FormPanel(Events.createEventAnnivFormPanel(bday_anniv_reminder_options, 'add'));
        eventAnnivEditFormPanel = new Ext.form.FormPanel(Ext.apply(Events.createEventAnnivFormPanel(bday_anniv_reminder_options, 'edit'), 
        { fullscreen: true
         // ,layout: 'fit'
        }));
        
        Ext.getCmp('anniv_delete_panel_edit').addDocked(eventAnnivDeleteBtn);
        // eventAnnivEditFormPanel.addDocked(eventAnnivDeletePanel);

		eventReadPanel = new Ext.Panel({
            fullscreen: true,
            hidden: true,
            scroll: 'vertical',
            draggable: {threshold: 50, direction: 'horizontal'},
            showAnimation: 'slide',
            tpl: eventReadTpl/*,
            listeners: {
                afterRender: function() {
                    this.mon(this.el, {
                        swipe: onEventSwipeCB,
                        showAnimation: 'slide',
                        scope: this
                    });
                }
            }*/
        });
        
        Ext.regModel('Event', { 
            fields: [
                {name: 'id', type: 'int'},
                {name: 'title', type: 'string'},
                {name: 'location', type: 'string'},
                {name: 'year', type: 'string'},
                {name: 'month', type: 'string'},
                {name: 'day', type: 'string'},
                {name: 'occurs_at', type: 'date'},
                {name: 'starts_at', type: 'date'},
                // {name: 'starts_at_time', type: 'string'},
                {name: 'ends_at', type: 'date'},
                // {name: 'ends_at_time', type: 'string'},
                {name: 'allday', type: 'boolean'},
                {name: 'remind_before', type: 'string'},
				{name: 'invite_emails', type: 'string'},
                {name: 'description', type: 'string'},
                {name: 'event_id', type: 'int'},
                {name: 'type', type: 'string'},
                {name: 'cl_state', type: 'string'},
                {name: 'client_uid', type: 'string'},
                {name: 'action', type: 'string'},
                /*
                {
                    name: 'occurs_at',
                    convert: function(value, record) {
                        var occurs_at = record.get('starts_at');
                        if(record.get('type') == allEntities[3] || record.get('type') == allEntities[4]) {
                            var currStartDate = Api.parseFromUTCDate(Api.getLocalStorageProp('events_start_time'));
                            var year = (currStartDate.getMonth()+1 > parseInt(record.get('month'), 10)) ? currStartDate.getFullYear()+1 : currStartDate.getFullYear();
                            occurs_at = new Date(year, parseInt(record.get('month'), 10)-1, parseInt(record.get('day'), 10));
                        }
                        return occurs_at;
                    }
                }*/
            ],
            validations: [
                {type: 'presence', name: 'title', message: "Title is required"}
            ],
            
            generateOccursAtStr: function() {
                if(this.get('type') == allEntities[3] || this.get('type') == allEntities[4]) {
                    var currStartDate = Api.parseFromUTCDate(Api.getLocalStorageProp('events_start_time'));
                    var year = (currStartDate.getMonth()+1 > parseInt(this.get('month'), 10)) ? currStartDate.getFullYear()+1 : currStartDate.getFullYear();
                    this.set('occurs_at', new Date(year, parseInt(this.get('month'), 10)-1, parseInt(this.get('day'), 10)));
                } 
                else if(this.get('type') == allEntities[2]) {
                    /*
                    var timeArr = this.get('starts_at_time').split(':');
                    var dateTime = this.get('starts_at');
                    Util.logger('dateTime starts_at is::', dateTime);
                    
                    dateTime.setHours(timeArr[0], timeArr[1]);
                    this.set('starts_at', dateTime);
                    */
                    /*
                    var timeArr = this.get('ends_at_time').split(':');
                    var dateTime = this.get('ends_at');
                    if(!Ext.isEmpty(dateTime) && !Ext.isEmpty(timeArr[0]))
                        dateTime.setHours(timeArr[0], timeArr[1]);
                    this.set('ends_at', dateTime);
                    */
                    this.set('occurs_at', this.get('starts_at'));
                }
            }
        });

        resetEventSEventFormPanel();
        resetEventBdayFormPanel();
        resetEventAnnivFormPanel();

        eventTabPanel = Events.createEventTabPanel(eventSEventAddFormPanel, eventBdayAddFormPanel, eventAnnivAddFormPanel, onSwitchEventTabCB);
        eventEditPanel = Events.createEventSimplePanel(eventSEventEditFormPanel, eventBdayEditFormPanel, eventAnnivEditFormPanel);
        
        eventsPanel = new Ext.Panel({
            title: 'Events',
            id: 'tab'+panelIndex.event+1,
            cls: 'card'+(panelIndex.event+1) + ' events_panel',
            iconCls: 'team',
            layout: 'card',
            fullscreen: true,
            // badgeText: Util.getBadgeText('event_all'),
            items: [ eventsListComp, eventReadPanel, eventTabPanel, eventEditPanel ],
            dockedItems: [eventsNavBar/*, eventsNextPrevBar*/]
        });

        return eventsPanel;
    };
    //__EVENTS panels layout end====================================================================================
    
    //__EVENTS action handlers start===============================================================
    
    function resetEventSEventFormPanel() {
        var startDate = new Date();
        startDate = startDate.add(Date.HOUR, 1);
        startDate.setMinutes(0);
        // var currTime = todate.format('H')+':'+todate.format('i');
        newEvent = Ext.ModelMgr.create({ id: null, title: '', location: '', year: '', month: '', day: '', 
                        starts_at: startDate.format('M, d, Y H:i'), /*starts_at_time: currTime, */ends_at: null, /*ends_at_time: currTime,  */
                        allday: false, remind_before: null, invite_emails: '', description: '', event_id: null, type: allEntities[2], created_at: new Date(), cl_state: 'insert', 
                        client_uid: Api.randomString(), action: 'new'}, 'Event');
        eventSEventAddFormPanel.load(newEvent);
        eventSEventEditFormPanel.load(newEvent);
    };

    function resetEventBdayFormPanel() {
		/*starts_at_time: '00:00', ends_at_time: '00:00', */
        var todate = new Date();
        newEvent = Ext.ModelMgr.create({ id: null, title: '', location: '', year: todate.getFullYear(), month: todate.getMonth()+1, day: todate.getDate(), 
                        starts_at: null, ends_at: null, allday: false, remind_before: null, invite_emails: '', description: '', event_id: null, 
                        type: allEntities[3], created_at: new Date(), cl_state: 'insert', client_uid: Api.randomString(), action: 'new'}, 'Event');
        eventBdayAddFormPanel.load(newEvent);
        eventBdayEditFormPanel.load(newEvent);
    };

    function resetEventAnnivFormPanel() {
		/*starts_at_time: '00:00', ends_at_time: '00:00', */
        var todate = new Date();
        newEvent = Ext.ModelMgr.create({ id: null, title: '', location: '', year: todate.getFullYear(), month: todate.getMonth()+1, day: todate.getDate(), 
                        starts_at: null, ends_at: null, allday: false, remind_before: null, invite_emails: '', description: '', event_id: null, 
                        type: allEntities[4], created_at: new Date(), cl_state: 'insert', client_uid: Api.randomString(), action: 'new'}, 'Event');
        eventAnnivAddFormPanel.load(newEvent);
        eventAnnivEditFormPanel.load(newEvent);
    };

    //NON-WORKING -- will use this function once tasks are integrated in Events/Upcoming tab
    // function onEventItemtapCB(dataview, index, item, eve) {
    //     var event = dataview.store.getAt(index).data;
    // 
    //     if (eve.getTarget('input#event_check_'+event.event_id)) {
    //         Ext.get(item).addCls('selected');
    //         ele = Ext.get('event_check_'+event.event_id);
    // 
    //         Util.logger(ele);
    //         Util.logger('cheeked state of #event_check_'+event.event_id+' is: '+!ele.getAttribute('checked'));
    //         //reverse condition as the event is fired before the state is set
    //         if(!ele.getAttribute('checked')) {
    //             event.completed_at = Api.formatToUTCDate(new Date());
    //             ele.replaceCls('unchecked', 'checked');
    //         } else {
    //             ele.replaceCls('checked', 'unchecked');
    //             event.completed_at = null;
    //         }
    // 
    //         // saveAllData(event.type, event, event.event_id-1, event_id.cl_state, 'toggle');
    //     }
    // };
    //NON-WORKING ends
    
    function onClearEndsAtBtnTap() {
        var endsAtId = 'event_endsAt_field_add';
            // endsAtTimeId = 'event_endsAtTime_field_add';
        if(newEvent.get('action') == 'edit') {
            endsAtId = 'event_endsAt_field_edit';
            // endsAtTimeId = 'event_endsAtTime_field_edit';
        }
        
        var eventEndsAtField = Ext.getCmp(endsAtId);
        eventEndsAtField.setValue(null);
        eventEndsAtField.getDateTimePicker().hide();
/*        
        Ext.get(endsAtTimeId).hide();
        Ext.getCmp(endsAtTimeId).setValue('00:00');
*/
    }

    function onSwitchEventTabCB(index) {
        var barTitle = 'Event';
        newEvent.set('type', allEntities[2]);
        if(index == 1) {
            barTitle = 'Birthday';
            newEvent.set('type', allEntities[3]);
        }
        else if(index == 2) {
            barTitle = 'Anniversary';
            newEvent.set('type', allEntities[4]);
        }
        // eventsNavBar.setTitle(barTitle);
    };
    
    function onTodayEventBtnTap() {
        if(Api.isEventsCurrentWindow())
            eventsListComp.refresh();
        else {
            var currStartDate = new Date().getFirstDateOfMonth().add(Date.MONTH, -1);
            var currEndDate = new Date().getFirstDateOfMonth().add(Date.MONTH, 2);

            var loadCurrEvents = {id: -1, title: 'Load current Events', occurs_at: currStartDate, 
                        starts_at: currStartDate, ends_at: currEndDate, 
                        month: 0, day: 0};
            
            Util.syncListOfItems('event_all', loadCurrEvents, refreshDashAndListPanelsCB, requestFailedCB);
/*
            Util.syncListOfItems(allEntities[2], loadCurrEvents, refreshDashAndListPanelsCB, requestFailedCB);
            Util.syncListOfItems(allEntities[3], loadCurrEvents, refreshDashAndListPanelsCB, requestFailedCB);
            Util.syncListOfItems(allEntities[4], loadCurrEvents, refreshDashAndListPanelsCB, requestFailedCB);
*/
        }
    };
    
    function onAddEventBtnTap() {
        Util.logger('In onAddEventBtnTap()');

        var eventActivePanel, eventPanelAnim;
        var barTitle = 'Event';
		// used to log flurry event
		isInviteFocused = false;
		
        if(newEvent.get('action') == 'edit') {
            Util.logger('In edit with type::', newEvent.get('type'));
            
            eventPanelAnim = { showAnimation: 'slide', direction: 'left' };
            
            if(newEvent.get('type') == allEntities[2]) {
                barTitle = 'Edit Event';
				// used to log flurry event
				origInviteEmails = newEvent.get('invite_emails');
				
                eventActivePanel = eventSEventEditFormPanel;
                eventSEventDeleteBtn.show();
            }
            else if(newEvent.get('type') == allEntities[3]) {
                barTitle = 'Edit Birthday';
                eventActivePanel = eventBdayEditFormPanel;
                eventBdayDeleteBtn.show();
            }
            else if(newEvent.get('type') == allEntities[4]) {
                barTitle = 'Edit';
                eventActivePanel = eventAnnivEditFormPanel;
                eventAnnivDeleteBtn.show();
            }
            
            eventTabPanel.hide();

            Ext.apply(eventEditPanel, eventPanelAnim);
            
            eventEditPanel.show();
            eventActivePanel.show();
            /*
            if(newEvent.get('type') == allEntities[2]) {
                if(!Ext.isEmpty(newEvent.get('ends_at')))
                    Ext.get('event_endsAtTime_field_edit').show();
                else 
                    Ext.get('event_endsAtTime_field_edit').hide();
            }
            */
        } else {
            Util.logger('In new');
            FlurryPlugin.logEvent('events_main_add');
            FlurryPlugin.countPageView();
            
            eventPanelAnim = { showAnimation: 'slide', direction: 'up' };
            
            Util.logger('the newEvent.type is:::', newEvent.get('type'));

            resetEventSEventFormPanel();
            resetEventBdayFormPanel();
            resetEventAnnivFormPanel();

            barTitle = 'Create';
            newEvent.set('type', allEntities[2]);
            
            // eventSEventDeleteBtn.hide();
            // eventBdayDeleteBtn.hide();
            // eventAnnivDeleteBtn.hide();

            eventEditPanel.hide();
            Ext.apply(eventTabPanel, eventPanelAnim);
            if(!Ext.isEmpty(eventTabPanel.getActiveItem()))
                eventTabPanel.setActiveItem(0);
            // eventSEventFormPanel.show();
            // eventBdayFormPanel.show();
            // eventAnnivFormPanel.show();
            eventTabPanel.show();
            
            if(Ext.is.Android)
                document.removeEventListener("backbutton", Ext.emptyFn, false);

            // Ext.get('event_endsAtTime_field_add').hide();
        }

        if(Ext.is.Android) {
            // document.removeEventListener("menubutton", onMenuKeyDown, false);
            document.addEventListener("menubutton", onEventMenuKeyDown, false);
            
            // document.removeEventListener("backbutton", Ext.emptyFn, false);
            document.addEventListener("backbutton", onCancelEventBtnTap, false);
        }

        eventsNavBar.setTitle(barTitle);

        eventsCancelBtn.show();
        eventsDoneBtn.show();
        eventsAddBtn.hide();
        eventsTodayBtn.hide();
        eventsBackBtn.hide();
        eventsEditBtn.hide();

        eventsListComp.hide();
        eventReadPanel.hide();

        eventsNextPrevBar.hide();
        BottomTabsInline.getTabBar().hide();

    };

    function onBackEventBtnTap() {
        Util.logger('In onBackEventBtnTap()');
        
        FlurryPlugin.logEvent('events_read_back');
        
        Ext.apply(eventReadPanel, { showAnimation: 'slide', direction: 'right' });
        
        showFreshEventsListPanel();

        if(Ext.is.Android) {
            document.removeEventListener("backbutton", onBackEventBtnTap, false);
            document.addEventListener("backbutton", Ext.emptyFn, false);
        }
        
    };
    
	function onCancelEventBtnTap() {
        Util.logger('In onCancelEventBtnTap()');

        var eventTitleField;
        
        if(Ext.is.Android) {
            onAndroidButtonHandler();
        }

        if(eventTabPanel.isHidden()) {
            if(!eventSEventEditFormPanel.isHidden())
                eventTitleField = Ext.get('sevent_title_field_edit');
            else if(!eventBdayEditFormPanel.isHidden())
                eventTitleField = Ext.get('bday_title_field_edit');
            else if(!eventAnnivEditFormPanel.isHidden())
                eventTitleField = Ext.get('anniv_title_field_edit');
        } else
            eventTitleField = eventTabPanel.getActiveItem().getEl().first();

        // hide keyboard
        if(Ext.is.iOS) {
            if(eventTitleField) {
                eventTitleField.down('input').dom.focus();
                eventTitleField.down('input').dom.blur();
            }
        }        
        if(newEvent.get('action') == 'new') {
            FlurryPlugin.logEvent(Api.pluralize(newEvent.get('type')).toLowerCase()+'_addForm_cancel');
            
            Ext.apply(eventTabPanel, { showAnimation: 'fade' });
	        showFreshEventsListPanel();
        } else {
            FlurryPlugin.logEvent(Api.pluralize(newEvent.get('type')).toLowerCase()+'_editForm_cancel');
            
            Ext.apply(eventTabPanel, { showAnimation: 'slide', direction: 'right' });
            showEventReadPanel();

            if(Ext.is.Android)
                document.addEventListener("backbutton", onBackEventBtnTap, false);

        }

        // showFreshEventsListPanel();

    };

    function onEditEventBtnTap() {
        Util.logger('In onEditEventBtnTap()');
        FlurryPlugin.logEvent('events_main_edit');
        FlurryPlugin.countPageView();

        // journalFormPanel.load(newEvent);
        if(newEvent.get('type') == allEntities[2])
            eventSEventEditFormPanel.load(newEvent);
        else if(newEvent.get('type') == allEntities[3])
            eventBdayEditFormPanel.load(newEvent);
        else if(newEvent.get('type') == allEntities[4])
            eventAnnivEditFormPanel.load(newEvent);
        
        if(Ext.is.Android)
            document.removeEventListener("backbutton", onBackEventBtnTap, false);
        
        onAddEventBtnTap();
        
    };
    
    function onDoneEventBtnTap(btn, eveObj) {
        Util.logger('In onDoneEventBtnTap()');

        var index = Util.getItemsSize('event_all');
        var current_state = 'select';
        var ends_at = '', month = '', day = '';

        var eventTitleField, activeEventFormPanel;
        
        if(eventTabPanel.isHidden()) {
            Util.logger('It is Edit event action: ');
            if(!eventSEventEditFormPanel.isHidden()) {
                activeEventFormPanel = eventSEventEditFormPanel;
                eventTitleField = Ext.get('sevent_title_field_edit');
            }
            else if(!eventBdayEditFormPanel.isHidden()) {
                activeEventFormPanel = eventBdayEditFormPanel;
                eventTitleField = Ext.get('bday_title_field_edit');
            }
            else if(!eventAnnivEditFormPanel.isHidden()) {
                activeEventFormPanel = eventAnnivEditFormPanel;
                eventTitleField = Ext.get('anniv_title_field_edit');
            }
        } else {
            Util.logger('It is Add event action: ');
            activeEventFormPanel = eventTabPanel.getActiveItem();
            eventTitleField = activeEventFormPanel.getEl().first();
        }
        // hide keyboard
        if(Ext.is.iOS) {
            if(eventTitleField) {
                // Util.logger(activeEventFormPanel.getEl());
                // eventTitleField = activeEventFormPanel.getEl().first();
                eventTitleField.down('input').dom.focus();
                eventTitleField.down('input').dom.blur();
            }
        }    
        if(Ext.is.Android)
            window.KeyBoard.hideKeyBoard();
        
        var model = Ext.ModelMgr.create(activeEventFormPanel.getValues(), 'Event');
        var eventLog = '', message = "", errors = model.validate();
        
        //manual validation
        model.set('type', newEvent.get('type'));
        model.generateOccursAtStr();
        ends_at = model.get('ends_at');
        month = model.get('month');
        day = model.get('day');
        if(!Ext.isEmpty(ends_at) && ends_at < model.get('starts_at')) {
            var error = {field: 'ends_at', message: 'End time should be after Starts time of event'};
            errors.add("ends_at", error);
        } 
        else if(!Ext.isEmpty(month) && !Ext.isEmpty(day) && !Api.isValidDayOfMonth(month, day)) {
            var error = {field: 'day', message: 'Invalid day of the month'};
            errors.add("day", error);
        }
        
        if(errors.isValid()) {
            if(newEvent) {
                Util.logger('event type is: ', newEvent.get('type'));
                Util.logger('event action is: ', newEvent.get('action'));

                activeEventFormPanel.updateRecord(newEvent, true);
                
                newEvent.generateOccursAtStr();
                
                //formating date properly
                // starts_at = Api.formatToUTCDate(newEvent.get('starts_at'));
            
                // Util.logger('starts_at retrieved is: ', starts_at);
                if(Ext.is.Android) {
                    // document.removeEventListener("menubutton", onJournalMenuKeyDown, false);
                    // document.addEventListener("menubutton", onMenuKeyDown, false);

                    document.removeEventListener("backbutton", onCancelEventBtnTap, false);
                    document.addEventListener("backbutton", onBackEventBtnTap, false);
                }


                if(newEvent.get('action') == 'edit') {
                    FlurryPlugin.logEvent(Api.pluralize(newEvent.get('type')).toLowerCase()+'_editForm_done');
                    FlurryPlugin.countPageView();
                    
					/* For 'Event' types only: 
						No change:: isInviteFocused = false 
						Tapped but no change: isInviteFocused = true && invite_emails == origInviteEmails
						Add invites: invite_emails != origInviteEmails
					*/
					// used to log flurry event
                    if(newEvent.get('type') == eventsEntities[0]) {
/*
						Util.logger('\n\n\n isInviteFocused::', isInviteFocused);
						Util.logger('invite_emails::', newEvent.get('invite_emails'));
						Util.logger('origInviteEmails::'+ origInviteEmails+'\n\n');
*/
						if(!isInviteFocused)
							eventLog = 'events_editForm_noChange';
						else if(isInviteFocused && newEvent.get('invite_emails') == origInviteEmails)
							eventLog = 'events_editForm_tapNoChange';
						else {
							eventLog = 'events_editForm_editInvite';
							newEvent.set('invite_emails', newEvent.get('invite_emails').toLocaleLowerCase());
						}
							
						Util.logger('Event Invited log is:',eventLog);
						FlurryPlugin.logEvent(eventLog);
						origInviteEmails = '';
					}
					
					index = newEvent.get('event_id')-1;
                    current_state = newEvent.get('cl_state');
                } else {
                    FlurryPlugin.logEvent(Api.pluralize(newEvent.get('type')).toLowerCase()+'_addForm_done');
                    FlurryPlugin.countPageView();
					/* For 'Event' types only: 
						No change:: isInviteFocused = false 
						Tapped but no change: isInviteFocused = true && invite_emails = ''
						Add invites: invite_emails != ''
					*/
					// used to log flurry event
					if(newEvent.get('type') == eventsEntities[0]) {
						if(!isInviteFocused)
							eventLog = 'events_addForm_noChange';
						else if(isInviteFocused && Ext.isEmpty(newEvent.get('invite_emails')))
							eventLog = 'events_addForm_tapNoChange';
						else {
							eventLog = 'events_addForm_addInvite';
							newEvent.set('invite_emails', newEvent.get('invite_emails').toLocaleLowerCase());
						}
						
						Util.logger('Event Invited log is:',eventLog);
						FlurryPlugin.logEvent(eventLog);
					}
                }

                // newEvent.set('starts_at', starts_at);
                // newEvent.set('ends_at', ends_at);
                var newEventObj = Events.copyToEventObject(newEvent);
                saveAllData(newEvent.get('type'), newEventObj, index, current_state, newEvent.get('action'));
            } else {
                Util.logger('[INFO]:: onDoneEventBtnTap(): newEvent is null');
            }
            
            // if(Ext.is.Android) {
                // document.removeEventListener("menubutton", onEventMenuKeyDown, false);
                // document.addEventListener("menubutton", onMenuKeyDown, false);

                // document.removeEventListener("backbutton", onCancelEventBtnTap, false);
                // document.addEventListener("backbutton", Ext.emptyFn, false);
            // }
            
        } else {
            Ext.each(errors.items, function(rec, i) {
                message += '<p class="loginErrorMsg">'+rec.message+'</p>';
            });
            Ext.Msg.alert("Oops!", message, Ext.emptyFn);
        }
        return false;

    };

    function onDeleteEventBtnTap(btn) {
        Util.logger('In onDeleteEventBtnTap()');

        if(btn == 'yes') {
            
            if(newEvent) {
                // eventSEventEditFormPanel.updateRecord(newEvent, true);
                Util.logger('event type is: ', newEvent.get('type'));
                FlurryPlugin.logEvent(Api.pluralize(newEvent.get('type')).toLowerCase()+'_editForm_delete');
                FlurryPlugin.countPageView();

                if(newEvent.get('type') == allEntities[2]) {
                    eventSEventEditFormPanel.updateRecord(newEvent, true);
                    newEvent.set('type', allEntities[2]);
                }
                else if(newEvent.get('type') == allEntities[3]) {
                    eventBdayEditFormPanel.updateRecord(newEvent, true);
                    newEvent.set('type', allEntities[3]);
                }
                else if(newEvent.get('type') == allEntities[4]) {
                    eventAnnivEditFormPanel.updateRecord(newEvent, true);
                    newEvent.set('type', allEntities[4]);
                }

                index = newEvent.get('event_id')-1;
                
                var newEventObj = Events.copyToEventObject(newEvent);
                saveAllData(newEvent.get('type'), newEventObj, index, newEvent.get('cl_state'), 'delete');
            } else {
                Util.logger('[INFO]:: onDeleteEventBtnTap(): newEvent is null');
            }
            
            if(Ext.is.Android) {
                document.removeEventListener("menubutton", onEventMenuKeyDown, false);
                document.addEventListener("menubutton", onMenuKeyDown, false);

                document.removeEventListener("backbutton", onCancelEventBtnTap, false);
                document.addEventListener("backbutton", Ext.emptyFn, false);
            }
        }
    };

    function onNextEventBtnTap(btn, eveObj) {
        Util.logger('Events.onNextEventBtnTap called');
        
        var otherRecord;
        var index = eventsListComp.getStore().findExact('event_id', newEvent.get('event_id'));

        if(btn.text == '>' || btn.initialConfig.cls == 'event_next') {
            //load below event if any
/*
            otherRecord = eventsListComp.getStore().getAt(index+1);
			if(otherRecord.get('id') < -2)
	            otherRecord = eventsListComp.getStore().getAt(index+2);
*/
/*
		otherRecord = eventsListComp.getRecord(eventsListComp.getNode(index+1));
		if(otherRecord.get('id') < -2)
            otherRecord = eventsListComp.getRecord(eventsListComp.getNode(index+2));
*/
		otherRecord = eventsListComp.store.getAt(index+1);
		if(otherRecord.get('id') < -2)
            otherRecord = eventsListComp.store.getAt(index+2);
        } else if(btn.text == '<' || btn.initialConfig.cls == 'event_prev') {
            //load above event if any
			otherRecord = eventsListComp.store.getAt(index-1);
			if(otherRecord.get('id') < -2)
	            otherRecord = eventsListComp.store.getAt(index-2);
        }

        Util.logger('selected item index in list is::', index);
        Util.logger('otherRecord is::', otherRecord);

        updateEventReadPanel(otherRecord);
        
    };
    
    // function onEventsItemDisclosureCB(record, btn, index) {
    function onEventItemtapCB(dataview, index, item, eve) {
        Util.logger('In onEventItemtapCB()');
        var eventText = '', record = dataview.store.getAt(index);
        // var recordIndex = dataview.store.findBy(function(pRec, pId) {
        //     if(pRec.get('id') == Ext.get(item).down('.event_item').id.substr(6)) {
        //         return true;
        //     }
        //     return false;
        // });
        // var record = dataview.store.getAt(recordIndex);

        Util.logger(index);
        // Util.logger(Events.copyToEventObject(record));
        Util.logger('id is: '+record.get('id')+' title is: ' + record.get('title')+', event_id is:'+record.get('event_id')+', allday is:'+record.get('allday')
            +', month: '+record.get('month')+', day: '+record.get('day')+', occurs_at: '+record.get('occurs_at')+', type: '+record.get('type'));
            
        //last record of Load More journals is pressed
        if(record.get('id') == -1 || record.get('id') == -2) {
            eventText = (record.get('id') == -2) ? 'Prev' : 'More';
			FlurryPlugin.logEvent('events_main_load'+eventText);

            var recordObj = Events.copyToEventObject(record);
            Util.syncListOfItems('event_all', recordObj, refreshDashAndListPanelsCB, requestFailedCB);
/*
            Util.syncListOfItems(allEntities[2], recordObj, refreshDashAndListPanelsCB, requestFailedCB);
            Util.syncListOfItems(allEntities[3], recordObj, refreshDashAndListPanelsCB, requestFailedCB);
            Util.syncListOfItems(allEntities[4], recordObj, refreshDashAndListPanelsCB, requestFailedCB);
*/
        } 
        else if(Ext.isNumber(record.get('id')) && (record.get('id') < 0)) {
            return;
        }
        else {
            FlurryPlugin.logEvent('events_main_edit');
            FlurryPlugin.countPageView();

			//get a reference to the User model class
			// var newEvent = Ext.ModelMgr.getModel('Event');
			
			newEvent = Ext.ModelMgr.create({
                id: parseInt(record.get('id')),
                title: record.get('title'),
                location: record.get('location'),
                year: parseInt(record.get('year')),
                month: parseInt(record.get('month'), 10),
                day: parseInt(record.get('day'), 10),
                occurs_at: record.get('occurs_at'),
                starts_at: record.get('starts_at'),
                // starts_at_time: record.get('starts_at_time'),
                ends_at: record.get('ends_at'),
                // ends_at_time: record.get('ends_at_time'),
                allday: record.get('allday'),
                remind_before: record.get('remind_before'),
				invite_emails: record.get('invite_emails'),
                description: record.get('description'),
                event_id: parseInt(record.get('event_id')),
                type: record.get('type'),
                cl_state: record.get('cl_state'),
                client_uid: record.get('client_uid'),
                action: 'edit'},
                'Event');
/*            
            if(newEvent.get('type') == allEntities[2])
                eventSEventEditFormPanel.load(newEvent);
            else if(newEvent.get('type') == allEntities[3])
                eventBdayEditFormPanel.load(newEvent);
            else if(newEvent.get('type') == allEntities[4])
                eventAnnivEditFormPanel.load(newEvent);
*/        
			Util.logger('eventModel is:', newEvent);
			Util.logger('typeof eventModel is:', typeof newEvent);
			// Util.logger('instanceof eventModel is:', instanceof newEvent);
			
            var eventItem = copyToEventObject(newEvent);
	        eventReadPanel.update(eventItem);

            showEventReadPanel();

            if(Ext.is.Android) {
                document.removeEventListener("backbutton", Ext.emptyFn, false);
                document.addEventListener("backbutton", onBackEventBtnTap, false);
            }

            // onAddEventBtnTap();
        }
    };

    function onEventSwipeCB(eve, ele, item) {
        Util.logger('In onEventSwipeCB()');
        Util.logger('event is::', eve);
        Util.logger('ele is::', ele);
        Util.logger('item is::', item);
        Util.logger('item.scope.data is::', item.scope.data);

        var otherRecord;
        var index = eventsListComp.getStore().findExact('event_id', newEvent.get('event_id'));
        //item.scope.data.event_id
        Util.logger('selected item index in list is::', index);

        if(eve.direction == 'left') {
            //load below event if any
			otherRecord = eventsListComp.getRecord(eventsListComp.getNode(index+1));
			if(otherRecord.get('id') < -2)
	            otherRecord = eventsListComp.getRecord(eventsListComp.getNode(index+2));
        } else if(eve.direction == 'right') {
            //load above event if any
			otherRecord = eventsListComp.getRecord(eventsListComp.getNode(index-1));
			if(otherRecord.get('id') < -2)
	            otherRecord = eventsListComp.getRecord(eventsListComp.getNode(index-2));

        }
        
        updateEventReadPanel(otherRecord);
    };
    
    function updateNextPrevBtns() {
        var index = eventsListComp.getStore().findExact('event_id', newEvent.get('event_id'));
        var nextRecord = eventsListComp.getStore().getAt(index+1);
        var prevRecord = eventsListComp.getStore().getAt(index-1);
    
        if(Ext.isEmpty(nextRecord) || nextRecord.get('id') < 0) {
			if(nextRecord.get('id') < -2) {
				nextRecord = eventsListComp.getStore().getAt(index+2);
				if(Ext.isEmpty(nextRecord) || nextRecord.get('id') < 0)
            		eventsNextBtn.disable();
			} else
				eventsNextBtn.disable();
        } else {
            eventsNextBtn.enable();
        }
        
        if(Ext.isEmpty(prevRecord) || prevRecord.get('id') < 0) {
			if(prevRecord.get('id') < -2) {
				prevRecord = eventsListComp.getStore().getAt(index-2);
				if(Ext.isEmpty(prevRecord) || prevRecord.get('id') < 0)
            		eventsPrevBtn.disable();
			} else
            	eventsPrevBtn.disable();
        } else {
            eventsPrevBtn.enable();
        }
        
    };
    
    function updateEventReadPanel(record) {
        if(!Ext.isEmpty(record) && record.get('id') > 0) {
            newEvent = Ext.ModelMgr.create({
                id: parseInt(record.get('id')),
                title: record.get('title'),
                location: record.get('location'),
                year: parseInt(record.get('year')),
                month: parseInt(record.get('month'), 10),
                day: parseInt(record.get('day'), 10),
                occurs_at: record.get('occurs_at'),
                starts_at: record.get('starts_at'),
                // starts_at_time: record.get('starts_at_time'),
                ends_at: record.get('ends_at'),
                // ends_at_time: record.get('ends_at_time'),
                allday: record.get('allday'),
                remind_before: record.get('remind_before'),
                invite_emails: record.get('invite_emails'), 
				description: record.get('description'),
                event_id: parseInt(record.get('event_id')),
                type: record.get('type'),
                cl_state: record.get('cl_state'),
                client_uid: record.get('client_uid'),
                action: 'edit'},
                'Event');
            
            updateNextPrevBtns();
            
            var eventItem = copyToEventObject(newEvent);
            eventReadPanel.update(eventItem);
            
        }

    };
    
    function showEventReadPanel(eventItem) {
        Util.logger('In showEventReadPanel()');
        FlurryPlugin.countPageView();

        if(!Ext.isEmpty(eventItem)) {
            //need to do this as it comes back from the callBack of remoteSyncItem with server exchangeable format			
        	eventItem.occurs_at = Api.parseFromUTCDate(eventItem.occurs_at);
            eventItem.starts_at = Api.parseFromUTCDate(eventItem.starts_at);
            eventItem.ends_at = Api.parseFromUTCDate(eventItem.ends_at);
            eventReadPanel.update(eventItem);
        }
            
		Util.logger('newEvent is::', newEvent);

        refreshEventsListPanel('');
        eventsNavBar.setTitle('Events');
            
        Ext.apply(eventReadPanel, { showAnimation: { type : 'slide', direction: 'left'} });
            
        eventsCancelBtn.hide();
        eventsDoneBtn.hide();
        eventsAddBtn.hide();
        eventsTodayBtn.hide();
        // eventsDeleteBtn.hide();
        
        eventsBackBtn.show();
        eventsEditBtn.show();
        
        eventTabPanel.hide();
        eventEditPanel.hide();
        eventSEventEditFormPanel.hide();
        eventBdayEditFormPanel.hide();
        eventAnnivEditFormPanel.hide();
        eventsListComp.hide();

        eventReadPanel.show();
        
        updateNextPrevBtns();
        eventsNextPrevBar.show();
        BottomTabsInline.getTabBar().hide();
        
    };
    
    function showFreshEventsListPanel() {
        Util.logger('In showFreshEventsListPanel()');
        FlurryPlugin.countPageView();
        
        //refreshing for next usage
        resetEventSEventFormPanel();
        resetEventBdayFormPanel();
        resetEventAnnivFormPanel();
        
        refreshEventsListPanel('');
        
        eventsCancelBtn.hide();
        eventsDoneBtn.hide();
        eventsBackBtn.hide();
        eventsEditBtn.hide();
        eventsAddBtn.show();
        eventsTodayBtn.show();

        eventsNavBar.setTitle('Events');

        eventTabPanel.hide();
        eventEditPanel.hide();
        eventSEventEditFormPanel.hide();
        eventBdayEditFormPanel.hide();
        eventAnnivEditFormPanel.hide();

        eventReadPanel.hide();
        eventsListComp.show();
        
        eventsNextPrevBar.hide();
        BottomTabsInline.getTabBar().show();

    };
    
    function refreshEventsListPanel(timeDelay) {
        Util.logger('In refreshEventsListPanel()');
        var events = [];

        events = refreshEventsListData();

        var currStartDate = Api.parseFromUTCDate(Api.getLocalStorageProp('events_start_time'));
        var currEndDate = Api.parseFromUTCDate(Api.getLocalStorageProp('events_end_time'));

        Util.logger('list currStartDate is: ', currStartDate);
        Util.logger('list currEndDate is: ', currEndDate);
        // Util.logger('\n\n\nrefreshed events is ', events);

        var loadPrevEvents = {id: -2, title: 'Load previous events', occurs_at: currStartDate.add(Date.YEAR, -100), 
                    starts_at: currStartDate.add(Date.MONTH, -1), ends_at: currEndDate.add(Date.MONTH, -1), 
                    month: 0, day: 0};
        var loadNextEvents = {id: -1, title: 'Load more events', occurs_at: currEndDate.add(Date.YEAR, 100), 
                starts_at: currStartDate.add(Date.MONTH, 1), ends_at: currEndDate.add(Date.MONTH, 1), 
                month: 13, day: 32};

        var loadEmptyItem1 = {id: -3, title: 'No events this month', occurs_at: currStartDate,
            starts_at: currStartDate, ends_at: currEndDate.add(Date.MONTH, -2), 
            month: currStartDate.getMonth()+1, day: currStartDate.getFirstDateOfMonth().getDate()};
            
        var loadEmptyItem2 = {id: -4, title: 'No events this month', occurs_at: currStartDate.add(Date.MONTH, 1),
            starts_at: currStartDate.add(Date.MONTH, 1), ends_at: currEndDate.add(Date.MONTH, -1), 
            month: currStartDate.getMonth()+2, day: currStartDate.add(Date.MONTH, 1).getFirstDateOfMonth().getDate()};
            
        var loadEmptyItem3 = {id: -5, title: 'No events this month', occurs_at: currStartDate.add(Date.MONTH, 2),
            starts_at: currStartDate.add(Date.MONTH, 2), ends_at: currEndDate, 
            month: currStartDate.getMonth()+3, day: currStartDate.add(Date.MONTH, 2).getFirstDateOfMonth().getDate()};
        
        var month1 = currStartDate.getMonth();
        var month2 = currStartDate.add(Date.MONTH, 1).getMonth();
        var month3 = currStartDate.add(Date.MONTH, 2).getMonth();
        var count1 = 0;
        var count2 = 0;
        var count3 = 0;
        
        Ext.each(events, function(item, index, allItems) {
            if(item.occurs_at.getMonth() == month1)
                count1++;
            else if(item.occurs_at.getMonth() == month2)
                count2++;
            else if(item.occurs_at.getMonth() == month3)
                count3++;

			// Util.logger('*****Ext.isEmpty(item.get(id)) is:', Ext.isEmpty(item.get('id')));
			// Util.logger('*****item.get(id) ==', item.get('id') === 'undefined');
			// Util.logger('*****item is::', item);
			/*
			for(var propertyName in item) {
			  if(item.hasOwnProperty(propertyName)) {
			    console.log('click el prop is: '+propertyName);
			    console.log('click el prop value is: '+item[propertyName]);
			  }
			}
			*/
			if((newEvent.get('id') == 0) && (item.client_uid == newEvent.get('client_uid')) && (item.id != 0)) {
				
				newEvent = Ext.ModelMgr.create({
	                id: parseInt(item.id),
	                title: item.title,
	                location: item.location,
	                year: parseInt(item.year),
	                month: parseInt(item.month, 10),
	                day: parseInt(item.day, 10),
	                occurs_at: item.occurs_at,
	                starts_at: item.starts_at,
	                // starts_at_time: item.starts_at_time,
	                ends_at: item.ends_at,
	                // ends_at_time: item.ends_at_time,
	                allday: item.allday,
	                remind_before: item.remind_before,
	                invite_emails: item.invite_emails,
					description: item.description,
	                event_id: parseInt(item.event_id),
	                type: item.type,
	                cl_state: item.cl_state,
	                client_uid: item.client_uid,
	                action: 'edit'},
	                'Event');
			}		

        });
        
        if(count1 == 0)
            events.push(loadEmptyItem1);
        if(count2 == 0)
            events.push(loadEmptyItem2);
        if(count3 == 0)
            events.push(loadEmptyItem3);
            
        Util.logger('loadPrevEvents is: ', loadPrevEvents);
        Util.logger('loadNextEvents is: ', loadNextEvents);
        
        events.push(loadNextEvents);
        events.push(loadPrevEvents);

        // Util.logger('item added events is ', events);

        eventsListComp.getStore().loadData(events, false);
		// eventsListComp.getStore().sort();
		
        if(Ext.isEmpty(timeDelay))
            refreshEventBadgeTextCB();
        else {
            setTimeout("Util.logger(\'eventsListComp & tabBadge refreshing\'); eventsListComp.refresh();", 1900);
            setTimeout("Events.refreshEventBadgeTextCB()", 2100);
        }
        
        return events;
    };

    function refreshEventBadgeTextCB() {
        Util.logger('In refreshEventBadgeTextCB()');
        // BottomTabsInline.getTabBar().items.items[panelIndex.event].setBadge(Util.getBadgeText('event_all'));
    };

    function refreshEventsListData() {
        var user_id = Api.getLocalStorageProp('user_id');
        
        var events = [], itemKey, value;
        var eventKey = allEntities[2]+'_'+user_id;
        var bdayKey = allEntities[3]+'_'+user_id;
        var annivKey = allEntities[4]+'_'+user_id;
        
        for(var i = 0, losLength = localStorage.length; i < losLength; i++) {
            itemKey = localStorage.key(i);
            if((itemKey.indexOf(eventKey) != -1) || (itemKey.indexOf(bdayKey) != -1) || (itemKey.indexOf(annivKey) != -1)) {
                value = Ext.decode(localStorage[itemKey]);
                if(value.cl_state != 'delete') {
                    value.starts_at = Api.parseFromUTCDate(value.starts_at);
                    value.ends_at = Api.parseFromUTCDate(value.ends_at);
                    value.occurs_at = Api.parseFromUTCDate(value.occurs_at);
                    value.created_at = Api.parseFromUTCDate(value.created_at);
                    value.updated_at = Api.parseFromUTCDate(value.updated_at);
                    value.month = (!Ext.isEmpty(value.month)) ? Util.pad(value.month, 2) : value.month;
                    value.day = (!Ext.isEmpty(value.day)) ? Util.pad(value.day, 2) : value.day;
                    events.push(value);
                }
            }
        }

        return events;
    };

    function onEventMenuKeyDown() {
        onAndroidButtonHandler();
        onMenuKeyDown();
    };
    
    function onAndroidButtonHandler() {
        var screenAction = (newEvent.get('action') === 'new') ? 'add' : newEvent.get('action');
        
        Ext.getCmp('sevent_startsAt_field_'+screenAction).getDateTimePicker().hide();
        Ext.getCmp('sevent_endsAt_field_'+screenAction).getDateTimePicker().hide();
        Ext.getCmp('sevent_remindBefore_field_'+screenAction).getPicker().hide();

        Ext.getCmp('bday_day_field_'+screenAction).getPicker().hide();
        Ext.getCmp('bday_month_field_'+screenAction).getPicker().hide();
        Ext.getCmp('bday_remindBefore_field_'+screenAction).getPicker().hide();

        Ext.getCmp('anniv_day_field_'+screenAction).getPicker().hide();
        Ext.getCmp('anniv_month_field_'+screenAction).getPicker().hide();
        Ext.getCmp('anniv_remindBefore_field_'+screenAction).getPicker().hide();

        Ext.Msg.hide();
        window.KeyBoard.hideKeyBoard();
        
        document.removeEventListener("backbutton", onCancelEventBtnTap, false);
        document.addEventListener("backbutton", Ext.emptyFn, false);
    };

	
    //__EVENTS action handlers end===============================================================

    function setEventReminderLocalNotifications(events) {
        var remindableEvents = [], remindAt, remindBefore, now = new Date(), nowFormatted,
            remindableEvent, summaryEvents = {}, summaryKey;
        nowFormatted = now.format('Y-m-d');
        for(var i = 0, ln = events.length; i < ln; i++) {
            remindableEvent = events[i];
            if(remindableEvent.get('id') <= 0)
                continue;
            remindBefore = remindableEvent.get('remind_before');
            remindAt = null;
            if(!Ext.isEmpty(remindBefore)) {
                remindAt = remindableEvent.get('occurs_at').add(Date.SECOND, -remindBefore);
                if(remindAt > now)
                    remindableEvents.push({ id: "event_" + remindableEvent.get('event_id'), title: remindableEvent.get('title'), remindAt: remindAt });
            }
            
            summaryKey = remindableEvent.get('occurs_at').format('Y-m-d');
            if(summaryKey >= nowFormatted) {
                if(Ext.isEmpty(summaryEvents[summaryKey])) {
                    summaryEvents[summaryKey] = 1;
                } else {
                    summaryEvents[summaryKey]++;
                }
            }
        }  
        
        var sortedReminders = remindableEvents.sort(function(a,b) {
            return (a.remindAt > b.remindAt ? 1 : -1);
        });
        LocalNotificationPlugin.cancelAll();
        var reminder;
        for(var i = 0, ln = sortedReminders.length; (i < ln && i < 59); i++) {
            reminder = sortedReminders[i];
            LocalNotificationPlugin.add(reminder.remindAt.format("m/d/Y h:i A"), reminder.title, 1, reminder.id);
        }
        
        return summaryEvents;
    };
}();