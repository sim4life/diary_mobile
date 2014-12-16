// __CUSTOM_COMPONENTS
Ext.form.RemindSelect = Ext.extend(Ext.form.Select, {
    pickerCls: '',
    pickerDoneButton: 'Set',
    pickerBeforeShow: Ext.emptyFn,
    showComponent: function() {
        this.getPicker().show();
    },
    getPicker: function() {
        if (!this.picker) {
            this.picker = new Ext.Picker({
                slots: [{
                    align       : 'center',
                    name        : this.name,
                    valueField  : this.valueField,
                    displayField: this.displayField,
                    value       : this.getValue(),
                    store       : this.store
                }],
                listeners: {
                    beforeshow: this.pickerBeforeShow,
                    change: this.onPickerChange,
                    scope: this
                },
                doneButton: this.pickerDoneButton,
                cls: this.pickerCls
            });
        }
        return this.picker;
    }
});
Ext.reg('remindselectfield', Ext.form.RemindSelect);

/*
Ext.ns("Ext.ux");
Ext.ux.DatePicker = Ext.extend(Ext.DatePicker, {
    pickerCls: '',
    pickerDoneButton: 'Set',
    pickerBeforeShow: Ext.emptyFn,
    showComponent: function() {
        this.getPicker().show();
    },
    getPicker: function() {
        if (!this.datePicker) {
            if (this.picker instanceof Ext.DatePicker) {
                this.datePicker = this.picker;
            } else {
                this.datePicker = new Ext.DatePicker(Ext.apply(this.picker || {}));
                this.datePicker.toolbar.setTitle(this.label);
            }

            this.datePicker.setValue(this.value || null);

            this.datePicker.on({
                scope : this,
                change: this.onPickerChange,
                hide  : this.onPickerHide
            });
        }

        return this.datePicker;
    }

});
Ext.reg('ux.datepickerfield', Ext.ux.DatePicker);
*/

Ext.form.TimePicker = Ext.extend(Ext.form.Field, {
    ui: 'select',
    picker: null,
    pickerBeforeShow: Ext.emptyFn,
    initComponent: function() {
        this.useMask = true;
        Ext.form.Text.superclass.initComponent.apply(this, arguments);
    },

    getTimePicker: function() {
        var cmp = this;
        if (!this.picker || this.picker.isDestroyed){ 
            this.picker = this.timePicker(this.value);
            this.picker.addListener("timeSelection", function(hours, minutes) {
                cmp.setValue(hours + ":" + minutes);
                cmp.fireEvent("timeSelection", hours, minutes);
            });
        }
        
        var timeArr = this.value.split(':');
        var slotsValue = {hours: timeArr[0], minutes: timeArr[1]};

        this.picker.setValue(slotsValue, true);
// this.picker.toolbar.setTitle(this.label);
        return this.picker;
    },

    onMaskTap: function() {
        this.getTimePicker().show();
    },

    setValue: function(value) {
        this.value = value;
        if (this.rendered) {
            this.fieldEl.dom.value = this.value;
        }
        return this;
    },

    getValue: function() {
        return this.value;
    },

    onDestroy: function() {
        if (this.picker) {
            this.picker.destroy();
        }

        Ext.Picker.superclass.onDestroy.call(this);
    },
    
    timePicker : function (value) { 
        var p = new Ext.Picker({ 
            doneButton:{ 
                text:'Set', 
                handler:function(){ 
                    p.fireEvent("timeSelection",  p.getValue()["hours"],  p.getValue()["minutes"]); 
                    this.hide(); 
                } 

            }, 
            listeners:{ 
                hide:function(){ 
                    // BUG PICKER 
                    // this.destroy(); 
                    this.p; 

                },
                beforeshow: this.pickerBeforeShow,
                // change: this.onPickerChange,
                scope: this
            }, 
            cancelButton:'Cancel',
            slots: [ 
                {
                    name : 'hours', 
                    title: 'Hours', 
                    useTitles:true, //not workning 
                    data : hour_options 
                }, { 
                    name : 'minutes', 
                    title: 'Minutes', 
                    useTitles:true, //not working 
                    data : min_options 
                } 
            ]
        }); 
        
        p.addEvents("timeSelection"); 
        return p; 
    }
});

Ext.reg('timepickerfield', Ext.form.TimePicker);

Ext.DateTimePicker = Ext.extend(Ext.Picker, {
    yearFrom: 1980,
    yearTo: new Date().getFullYear(),
    monthText: 'Month',
    dayText: 'Day',
    yearText: 'Year',
    hourText: 'Hours',
    minuteText: 'Minutes',
    todayText: '',
    hourRounding: 0,

    slotOrder: ['day', 'month', 'year', 'hours', 'minutes'],

    initComponent: function() {
        var yearsFrom = this.yearFrom,
            yearsTo = this.yearTo,
            todayText = this.todayText,
            years = [],
            days = [],
            months = [],
            hours = [],
            minutes = [],
            ln, tmp, i,
            daysInMonth,
            todate,
            todateFormatted,
            startDate,
            daySlotText;

        
        if (yearsFrom > yearsTo) {
            tmp = yearsFrom;
            yearsFrom = yearsTo;
            yearsTo = tmp;
        }

        for (i = yearsFrom; i <= yearsTo; i++) {
            years.push({
                text: i,
                value: i
            });
        }

        todate = new Date();
        todateFormatted = todate.format('Y-M-d');
        daysInMonth = this.getDaysInMonth(todate.getMonth()+1, todate.getFullYear());
        startDate = todate.getFirstDateOfMonth();
        // currStartDate.add(Date.MONTH, 1).getMonth();
        // var valueInit = Ext.DateTimePicker.superclass.getValue.call(this);
        for (i = 0; i < daysInMonth; i++, startDate = startDate.add(Date.DAY, 1)) {
            daySlotText = ((startDate.format('Y-M-d') == todateFormatted) && !Ext.isEmpty(todayText)) ? todayText : startDate.format('D d');
            days.push({
                text: daySlotText,
                value: i + 1
            });
        }

        for (i = 0, ln = Date.monthNames.length; i < ln; i++) {
            months.push({
                text: Date.getShortMonthName(i),
                value: i + 1
            });
        }

        for (i = 0; i < 24; i++) {
            hours.push({
                text: Ext.util.Format.leftPad(i, 2, '0'),
                value: i
            });
        }
        
        for (i = 00; i < 60; i++) {
            minutes.push({
                text: Ext.util.Format.leftPad(i, 2, '0'),
                value: i
            });
        }

        this.slots = [];
        
        this.slotOrder.forEach(function(item){
            this.slots.push(this.createSlot(item, days, months, years, hours, minutes));
        }, this);

        Ext.DateTimePicker.superclass.initComponent.call(this, arguments);
    },

    afterRender: function() {
        Util.logger('DateTimePicker afterRender called');
        Ext.DateTimePicker.superclass.afterRender.apply(this, arguments);

        this.setValue(this.value);
    },
    
    createSlot: function(name, days, months, years, hours, minutes){
        switch (name) {
            case 'year':
                return { 
                    name: 'year',
                    align: 'center',
                    data: years,
                    title: this.useTitles ? this.yearText : false,
                    flex: 2
                };
            case 'month':
                return {
                    name: name,
                    align: 'right',
                    data: months,
                    title: this.useTitles ? this.monthText : false,
                    flex: 2
                };
            case 'day':
                return {
                    name: 'day',
                    align: 'center',
                    data: days,
                    title: this.useTitles ? this.dayText : false,
                    flex: 3
                };
            case 'hours':
                return {
                    name: 'hours',
                    align: 'center',
                    data: hours,
                    title: this.useTitles ? this.hourText : false,
                    flex: 1
                };
            case 'minutes':
                return {
                    name: 'minutes',
                    align: 'center',
                    data: minutes,
                    title: this.useTitles ? this.minuteText : false,
                    flex: 1
                };
        }
    },

    
    onSlotPick: function(slot, value, node) {
        var name = slot.name,
            date, daysInMonth, daySlot, startDate,
            daySlotText, todateFormatted, newDays = [], todayText = this.todayText;

        if (name === "month" || name === "year") {
            daySlot = this.child('[name=day]');
            var valueInit = Ext.DateTimePicker.superclass.getValue.call(this);
            date = this.getValue();
            if(name === "month") //double confirm to improve wrong month picking issue
                date.setMonth(value-1);
            
            daysInMonth = this.getDaysInMonth(date.getMonth()+1, date.getFullYear());
            
            daySlot.store.clearFilter();
            daySlot.store.filter({
                fn: function(r) {
                    return r.get('extra') === true || r.get('value') <= daysInMonth;
                }
            });
            daySlot.scroller.updateBoundary(true);
            
            startDate = date.getFirstDateOfMonth();
            todateFormatted = new Date().format('Y-M-d');
            for (i = 0; i < daysInMonth; i++, startDate = startDate.add(Date.DAY, 1)) {
                daySlotText = ((startDate.format('Y-M-d') == todateFormatted) && !Ext.isEmpty(todayText)) ? todayText : startDate.format('D d');
                newDays.push({
                    text: daySlotText,
                    value: i + 1
                });
            }
            daySlot.store.loadData(newDays, false);
        }

        Ext.DateTimePicker.superclass.onSlotPick.apply(this, arguments);
    },

    getValue: function() {
        Util.logger('DateTimePicker getValue called');
        var value = Ext.DateTimePicker.superclass.getValue.call(this),
            daysInMonth = this.getDaysInMonth(value.month, value.year),
            day = Math.min(value.day, daysInMonth);
        Util.logger('$$$$£$$$========DateTimePicker in getValue value is:::', value);
        Util.logger('value date is::', new Date(value.year, value.month-1, day, value.hours, value.minutes));
        return new Date(value.year, value.month-1, day, value.hours, value.minutes);
    },
    
    setValue: function(value, animated) {
        Util.logger('DateTimePicker setValue called');
        
        var date, daysInMonth, daySlot, startDate, daySlotText, todateFormatted, newDays = [], 
            todayText = this.todayText, hourRounding = this.hourRounding, todatetimeFormatted = new Date().format('Y-m-d-H-i'), valueFormatted;
        var dateRounded = new Date();
        dateRounded = dateRounded.add(Date.HOUR, hourRounding);
        dateRounded.setMinutes(0);
        
        if (!Ext.isDate(value) && !Ext.isObject(value)) {
            value = null;
        }

        if (Ext.isDate(value)) {
            this.value = {
                day : value.getDate(),
                year: value.getFullYear(),
                month: value.getMonth() + 1,
                hours: value.getHours(),
                minutes: value.getMinutes()
            };
        } else {
            this.value = value;
        }

        if(!Ext.isEmpty(this.value))
            valueFormatted = this.value.year+'-'+Ext.util.Format.leftPad(this.value.month, 2, '0')+'-'+Ext.util.Format.leftPad(this.value.day, 2, '0')+'-'+
                                Ext.util.Format.leftPad(this.value.hours, 2, '0')+'-'+Ext.util.Format.leftPad(this.value.minutes, 2, '0');
            
        daySlot = this.child('[name=day]');
        date = this.value || {day: dateRounded.getDate(), year: dateRounded.getFullYear(), month: dateRounded.getMonth()+1, hours: dateRounded.getHours(), minutes: dateRounded.getMinutes()};
        if(!Ext.isEmpty(this.value) && hourRounding != 0 && (todatetimeFormatted >= valueFormatted)) {
            date.hours = dateRounded.getHours();
            date.minutes = dateRounded.getMinutes();
        }
            
        daysInMonth = this.getDaysInMonth(date.month, date.year);
        
        daySlot.store.clearFilter();
        daySlot.store.filter({
            fn: function(r) {
                return r.get('extra') === true || r.get('value') <= daysInMonth;
            }
        });
        /*
        if(!Ext.isEmpty(daySlot.scroller)) {
            daySlot.scroller.updateBoundary(true);
        }
        */
        todateFormatted = new Date().format('Y-M-d');
        startDate = new Date(date.year, date.month-1, date.day, date.hours, date.minutes).getFirstDateOfMonth();
        for (i = 0; i < daysInMonth; i++, startDate = startDate.add(Date.DAY, 1)) {
            daySlotText = ((startDate.format('Y-M-d') == todateFormatted) && !Ext.isEmpty(todayText)) ? todayText : startDate.format('D d');
            newDays.push({
                text: daySlotText,
                value: i + 1
            });
        }
        daySlot.store.loadData(newDays, false);
        
        return Ext.DateTimePicker.superclass.setValue.call(this, this.value, animated);
    },

    
    getDaysInMonth: function(month, year) {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return month == 2 && this.isLeapYear(year) ? 29 : daysInMonth[month-1];
    },

    
    isLeapYear: function(year) {
        return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
    }
});

Ext.reg('datetimepicker', Ext.DateTimePicker);

Ext.form.DateTimePicker = Ext.extend(Ext.form.Field, {
    ui: 'select',
    picker: null,
    destroyPickerOnHide: false,

    initComponent: function() {
        this.addEvents('select');

        this.tabIndex = -1;
        this.useMask = true;

        Ext.form.Text.superclass.initComponent.apply(this, arguments);
    },

    
    getDateTimePicker: function() {
        Util.logger('form.DateTimePicker getDateTimePicker called');
        if (!this.dateTimePicker) {
            if (this.picker instanceof Ext.DateTimePicker) {
                this.dateTimePicker = this.picker;
            } else {
                this.dateTimePicker = new Ext.DateTimePicker(Ext.apply(this.picker || {}));
            }
            this.dateTimePicker.setValue(this.value || null);

            this.dateTimePicker.on({
                scope : this,
                change: this.onPickerChange,
                hide  : this.onPickerHide
            });
        }

        return this.dateTimePicker;
    },

    
    onMaskTap: function() {
        if (Ext.form.DateTimePicker.superclass.onMaskTap.apply(this, arguments) !== true) {
            return false;
        }
        
        this.getDateTimePicker().show();
    },
    
    
    onPickerChange : function(picker, value) {
        this.setValue(value);
        this.fireEvent('select', this, this.getValue());
    },
    
    
    onPickerHide: function() {
        if (this.destroyPickerOnHide && this.dateTimePicker) {
            this.dateTimePicker.destroy();
        }
    },

    
    setValue: function(value, animated) {
        if (this.dateTimePicker) {
            this.dateTimePicker.setValue(value, animated);
            this.value = (value != null) ? this.dateTimePicker.getValue() : null;
        } else {
            if (!Ext.isDate(value) && !Ext.isObject(value)) {
                value = null;
            }

            if (Ext.isObject(value)) {
                this.value = new Date(value.year, value.month-1, value.day, value.hours, value.minutes);
            } else {
                this.value = value;
            }
        }

        if (this.rendered) {
            this.fieldEl.dom.value = this.getValue(true);
        }
        
        return this;
    },
    
    
    getValue: function(format) {
        var value = this.value || null;
        return (format && Ext.isDate(value)) ? value.format('d/m/Y H:i') : value;
    },
    
    
    onDestroy: function() {
        if (this.dateTimePicker) {
            this.dateTimePicker.destroy();
        }
        
        Ext.form.DateTimePicker.superclass.onDestroy.call(this);
    }
});

Ext.reg('datetimepickerfield', Ext.form.DateTimePicker);


Ext.form.DateTimePickerField = Ext.extend(Ext.form.DateTimePicker, {

    constructor: function() {
         // console.warn("Ext.form.DateTimePickerField has been deprecated and will be removed in Sencha Touch 1.0. Please use Ext.form.DateTimePicker instead");
        Ext.form.DateTimePickerField.superclass.constructor.apply(this, arguments);
    }
});

Ext.ns("Ext.ux");
