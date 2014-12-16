var Tasks = function(){
    /* Public pointers to private functions */
    return {
        createTaskFormPanel: createTaskFormPanel,
        createTasksTabPanel: createTasksTabPanel,
        getListBase: getListBase,
        copyToTodoObject: copyToTodoObject,
        saveTodo: saveTodo,
        renderTasksPanel: renderTasksPanel,
        onAddTaskBtnTap: onAddTaskBtnTap,
        showFreshTasksListPanel: showFreshTasksListPanel,
        refreshTasksTabListPanel: refreshTasksTabListPanel,
        refreshTaskBadgeTextCB: refreshTaskBadgeTextCB
    };

    /* Private functions */
    //__TASKS utility function end=============================================================================
    function createTaskFormPanel(reminder_options, dockedItem) {
        return {
            fullscreen: (Ext.is.iOS) ? true : false,
            hidden: true,
            standardSubmit: false,
            items: [{
                xtype: 'fieldset',
                /*
                listeners: {
                    keyup: function(fld, e){
                        if (e.browserEvent.keyCode == 13){
                            e.stopEvent();
                            fld.fieldEl.dom.blur();
                        }
                    },
                    afterRender: function() {
                            // Ext.ux.alertForm.superclass.afterRender.call(this);

                            this.mon(this.el, {
                                tap: this.handleEvent,
                                scope: this
                            });
                    } 
                },*/
                items: [{
                    xtype: 'textfield',
                    name: 'title',
                    placeHolder: 'e.g. Buy Milk',
                    required: true,
                    useClearIcon: true,
                    hideOnMaskTap: true,
                    autoCapitalize : true,
                    id: 'task_title_field'
                    /*,listeners: {
                        keyup: function(fld, e){
                            if (e.browserEvent.keyCode == 13){
                                e.stopEvent();
                                fld.fieldEl.dom.blur();
                            }
                        },
                        blur: function(fld, e) {
                              hideKeyboard(fld);
                        }
                    }*/
                }, {
                    xtype: 'datepickerfield',
                    name: 'due_at',
                    label: 'Due at',
                    hideOnMaskTap: true,
                    id: 'task_dueAt_field',
                    cls: 'due_at_field',
                    picker: {
                        userTitles: true,
                        yearFrom: (new Date()).getFullYear(),
                        yearTo: (new Date()).getFullYear() + 5,
                        slotOrder: ['day', 'month', 'year'],
                        listeners: {
                            beforeshow: function(comp) {
								Util.hideKeyboard('task_title_field');

                                if(Ext.isEmpty(this.value)) {
                                    this.value = new Date();
                                    this.setValue(this.value);
                                }
                                this.dockedItems.items[0].insert(1, new Ext.Button({ ui: 'action', text: 'Clear', cls: 'x-clear', handler: onClearDueAtBtnTap } ));
                                
                                // this.up("tabpanel").componentLayout.childrenChanged = true;
                                // this.up("tabpanel").doComponentLayout();
                            }
                        }
                    }
                }/*, {
                    xtype: 'remindselectfield', // one of our own
                    name: 'remind_before',
                    label: 'Reminder',
                    options: reminder_options,
                    pickerCls: 'taskRemindSelectPicker',
                    pickerBeforeShow: function() {
                        var taskTitleField = Ext.get('task_title_field');
                        taskTitleField.down('input').dom.focus();
                        taskTitleField.down('input').dom.blur();
                    }
                }*/]
            }, {
                height: 275,
                dockedItems:[dockedItem]
            }]
        };
    };
        
    function createTasksTabPanel(uncompletedListComp, completedListComp) {
        return new Ext.TabPanel({
            hidden: true,
            ui: 'light',
            tabBarDock: 'top',
            defaults: {
                scroll: 'vertical'
            },
            items: [
                uncompletedListComp,
                completedListComp
            ],
            listeners: {
                cardswitch : function(cont, newCard, oldCard, index, isAnimated) {
                    //change: function(tabBar, tab, card) may also be used
                    Util.logger('cardswitch! index is: ', index);
                    FlurryPlugin.logEvent('tasks_'+newCard.title.toLowerCase()+'_show');
                    FlurryPlugin.countPageView();
                    if(index == 0)
                        todosHideCompBtn.show();
                    else
                        todosHideCompBtn.hide();
                }
            }
        });
    };

    function getListBase(todosTpl, todosData, itemtapHandlerCB) {
        return {
            itemTpl: todosTpl,
            layout: 'fit',
            hidden: true,
            selModel: {
                mode: 'SINGLE',
                allowDeselect: true
            },
            indexBar: true,
            store: getTodosListStore(todosData),
            fullscreen: true,
            scroll: 'vertical',
            listeners: {
                itemtap: itemtapHandlerCB
            }
        };
    };

    function getTodosListStore(todos) {
        return new Ext.data.Store({
            model: 'Todos',
            sorters: [{
                property: 'created_at',
                direction: 'DESC'
            }],

            getGroupString : function(record) {
                return record.get('title')[0];
            },

            data: [todos]
        });
    };

    function copyToTodoObject(todoModel) {
        var todoObj = new Object();
        todoObj.id = todoModel.get('id');
        todoObj.title = todoModel.get('title');
        todoObj.due_at = todoModel.get('due_at');
        todoObj.remind_before = todoModel.get('remind_before');
        todoObj.completed_at = todoModel.get('completed_at');
        todoObj.created_at = todoModel.get('created_at');
        todoObj.todo_id = todoModel.get('todo_id');
        todoObj.cl_state = todoModel.get('cl_state');
        todoObj.client_uid = todoModel.get('client_uid');
        return todoObj;
    };

    /*
    title, due_at, remind_before, comp_at refers to the properties of Todo item
    index refers to the index position in the localStorage todos array
    curr_state refers to the current persistence state of the todo item, which can be
        'select', 'insert', 'update' or 'delete'
    action refers to the 'new', 'edit', 'delete' or 'toggle' action performed on the todo item
    callBack refers to the function to call after or parallel to the AJAX request
    syncCallBack refers to the function to call only after the AJAX request returns
    */
    function saveTodo(todoParam, index, curr_state, action, callBack, syncCallBack, failCallBack) {
        Util.logger('In saveTodo()');


        var user_id = Api.getLocalStorageProp('user_id');
        var newTodo = new Object();

/*
        if(curr_state == 'insert' && action == 'delete') {
            localStorage.removeItem('todo_'+user_id+'['+index+']');
            Util.logger('Item removed locally');
            Api.decrementLocalStorageKey('unsaved_'+Api.pluralize(allEntities[0])+'_count');

            callBack();
            syncCallBack();
        } else {
*/
            newTodo.id = todoParam.id;
            newTodo.title = todoParam.title;
            newTodo.due_at = Api.formatToUTCDate(todoParam.due_at);
            newTodo.remind_before = todoParam.remind_before;
            newTodo.completed_at = Api.formatToUTCDate(todoParam.completed_at);
            newTodo.created_at = Api.formatToUTCDate(todoParam.created_at);
            newTodo.updated_at = Api.formatToUTCDate(new Date());
            newTodo.set_completed = (!Ext.isEmpty(todoParam.completed_at)) ? true : false;
            newTodo.todo_id = index+1;
            newTodo.cl_state = Util.getItemState(curr_state, action);
            newTodo.client_uid = todoParam.client_uid;

            // Util.logger('newTodo before saving:::', JSON.stringify(newTodo));

            Util.remoteSyncItem(allEntities[0], newTodo, action, callBack, syncCallBack, failCallBack);

            // cacheTodoLocally(newTodo, index);
            // callBack();
//        }
    };
    //__TASKS utility function end=============================================================================
    
    //__TASKS panels layout start==================================================================================
    function renderTasksPanel() {
        var todosTpl = new Ext.XTemplate(
            '<tpl if="this.isPresent(completed_at)">', 
                '<div class="todo_container completed {[(xcount) == xindex ? "last" : ""]}">', 
                '<div id="todo_check_container_{todo_id}" class="todo_check_container completed"></div>', 
            '</tpl>', 
            '<tpl if="!this.isPresent(completed_at)">', 
                '<div class="todo_container uncompleted {[(xcount) == xindex ? "last" : ""]}">', 
                '<div id="todo_check_container_{todo_id}" class="todo_check_container uncompleted"></div>', 
            '</tpl>', 
            '<div id="todo_item_{todo_id}" class="todo_list_item">', 
                '<span>{title:htmlEncode}</span>', 
                '<tpl if="this.isPresent(due_at)">', 
                    '<p class="taskDueAt">Due: {due_at:date("j-M-y")}</p>', 
                '</tpl>',
            '</div>', 
            '</div>', 
            {
                isPresent: function(c) {
                    return !Ext.isEmpty(c);
                }
            });

        var todos = [];
        var completed_todos = [];

        todosCancelBtn = new Ext.Button(Ext.apply(
            Api.getButtonBase('Cancel', true, 'todo_cancel', onCancelTaskBtnTap)
        ));

        // todos = refreshTasksListData(isUncompletedTaskTimeStampCB);
        // completed_todos = refreshTasksListData(isCompletedTaskTimeStampCB);
        
        todosDoneBtn = new Ext.Button(Api.getButtonBase('Done', true, 'todo_done', onDoneTaskBtnTap));
        todosAddBtn = new Ext.Button(Api.getButtonBase('+', false, 'todo_add', onAddTaskBtnTap));
        todosHideCompBtn = new Ext.Button(Api.getButtonBase('Clear', false, 'todo_hide', onHideCompletedTaskBtnTap));

        todosNavBar = new Ext.Toolbar({
            ui: 'dark',
            dock: 'top',
            title: 'Tasks',
            items: [todosCancelBtn, todosHideCompBtn, {xtype: 'spacer'}, todosAddBtn, todosDoneBtn]
        });

        todosDeleteBtn = new Ext.Button(Ext.apply(
            Api.getButtonBase('Delete', true, 'todo_delete', function() { 
                    Ext.Msg.confirm("Confirmation", "Are you sure you want to delete that?", onDeleteTaskBtnTap);}), 
            { ui: 'decline',
            dock: 'bottom' }
            ));

        //List starts
        Ext.regModel('Todos', {
            fields: ['id', 'title', 'due_at', 'remind_before', 'completed_at', 'created_at', 'todo_id', 'cl_state', 'client_uid']
        });

        tasksListComp = new Ext.List(
            Ext.apply(
                Tasks.getListBase(todosTpl, todos, onTaskItemtapCB),
                { cls: 'main_task_list', title: 'Current', emptyText: '<p class="emptyTaskMessage"><strong>You have no upcoming Tasks</strong></p>' }
            )
        );

        tasksCompletedListComp = new Ext.List(
            Ext.apply(
                Tasks.getListBase(todosTpl, completed_todos, onTaskItemtapCB),
                { cls: 'main_task_list', title: 'Completed', emptyText: '<p class="emptyTaskMessage">There are no completed Tasks</p>' }
            )
        );

        tasksTabPanel = Tasks.createTasksTabPanel(tasksListComp, tasksCompletedListComp);

/*
        tasksListComp.el.on({
            tap: todoCheckHandler
        });
*/
        //List ends
/*
        //this is a workaround to fix rendering issues
        taskDeletePanel = new Ext.Panel({
            layout: 'fit',
            dock: 'bottom',
            items: [todosDeleteBtn]
        });
*/
/*
        var picker = new Ext.Picker({
            slots: [
                {
                    name : 'remind_before',
                    title: 'Reminder',
                    data : [todo_reminder_options]
                }
            ]
        });
*/
        todo_reminder_options = [
            {text: 'Never',  value: null},
            {text: '15 minutes',  value: 15*60+''},
            {text: '30 minutes',  value: 30*60+''},
            {text: '1 hour',  value: 60*60+''},
            {text: '2 hours',  value: 2*60*60+''},
            {text: '4 hours',  value: 4*60*60+''},
            {text: '12 hours',  value: 12*60*60+''},
            {text: '1 day',  value: 24*60*60+''},
            {text: '2 days', value: 2*24*60*60+''},
            {text: '1 week',  value: 7*24*60*60+''}];


        taskFormBase = Tasks.createTaskFormPanel(todo_reminder_options, todosDeleteBtn);
        taskFormPanel = new Ext.form.FormPanel(taskFormBase);

        Ext.regModel('Todo', { 
            fields: [
                {name: 'id', type: 'int'},
                {name: 'title', type: 'string'},
                {name: 'due_at', type: 'date'},
                {name: 'remind_before', type: 'string'},
                {name: 'completed_at', type: 'string'},
                {name: 'todo_id', type: 'int'},
                {name: 'cl_state', type: 'string'},
                {name: 'client_uid', type: 'string'},
                {name: 'action', type: 'string'}
            ],
            validations: [
                {type: 'presence', name: 'title', message: "Title is required"}
                // ,{type: 'presenceDueDate', name: 'remind_before'}
            ]
        });

        resetTaskFormPanel();

        tasksPanel = new Ext.Panel({
            fullscreen: (Ext.is.iOS) ? false : true,
            title: 'Tasks',
            id: 'tab'+panelIndex.todo+1,
            cls: 'card'+(panelIndex.todo+1) + ' tasks_panel',
            iconCls: 'favorites',
            layout: 'card',
            // badgeText: Util.getBadgeText(allEntities[0]), //todo entity
            items: [ tasksTabPanel, taskFormPanel ],
            dockedItems: [todosNavBar]
        });
        
        return tasksPanel;
    };
    //__TASKS panels layout ends==================================================================================
    
    //__TASKS action handlers start============================================================
    
    function resetTaskFormPanel() {
        taskFormBase.todo = Ext.ModelMgr.create({ id: null, title: '', due_at: null, remind_before: null, todo_id: null, 
                                completed_at: null, created_at: new Date(), cl_state: 'insert', client_uid: Api.randomString(), action: 'new'}, 'Todo');
        taskFormPanel.load(taskFormBase.todo);
    };
    
    //NON-WORKING function
    function todoCheckHandler(eve, el) {
        Util.logger(eve);
        Util.logger(el);
        
        user_id = Api.getLocalStorageProp('user_id');
        
        elem = Ext.get(el);
        if(elem.hasCls('todo_checkbox')) {
            todoId = elem.getAttribute('id').split("_").pop();
            // Util.logger(todos[todoId]);
            if(elem.getAttribute('checked') == true) {
                elem.replaceCls('unchecked', 'checked');
                localStorage['todo_'+user_id+'['+(todoId-1)+']'].completed_at = Api.formatToUTCDate(new Date());
            } else {
                elem.replaceCls('checked', 'unchecked');
                localStorage['todo_'+user_id+'['+(todoId-1)+']'].completed_at = null;
            }
            Util.logger(localStorage['todo_'+user_id+'['+(todoId-1)+']']);
        }
    };
    //NON-WORKING function ends

    function onClearDueAtBtnTap() {
        // taskFormPanel.getComponent(0).getComponent(1).setValue(null);
        // taskFormPanel.getComponent(0).getComponent(1).getDatePicker().hide();
        
        var taskDueAtField = Ext.getCmp('task_dueAt_field');
        taskDueAtField.setValue(null);
        taskDueAtField.getDatePicker().hide();
    }

    function onHideCompletedTaskBtnTap() {
        Util.logger('In onHideCompletedTaskBtnTap()');
        Util.setHideCompletedTaskTimeStamp();

        refreshTasksTabListPanel('');
    };
    
    function onAddTaskBtnTap() {
        Util.logger('In onAddTaskBtnTap()');
        
        if(taskFormBase.todo.get('action') == 'edit') {
            Util.logger('In edit');
            todosNavBar.setTitle('Edit Task');
            
            todosDeleteBtn.show();
            
            Ext.apply(taskFormPanel, { showAnimation: 'slide', direction: 'left' });
            
        } else {
            Util.logger('In new');
            FlurryPlugin.logEvent('tasks_main_add');
            FlurryPlugin.countPageView();
            
            todosNavBar.setTitle('New Task');
            
            resetTaskFormPanel();
            
            todosDeleteBtn.hide();
            
            Ext.apply(taskFormPanel, { showAnimation: { type : 'slide', direction: 'up'} });
            
            // taskFormPanel.load(taskFormBase.todo);
        }
        
        if(Ext.is.Android) {
            // document.removeEventListener("menubutton", onMenuKeyDown, false);
            document.addEventListener("menubutton", onTaskMenuKeyDown, false);
            
            document.removeEventListener("backbutton", Ext.emptyFn, false);
            document.addEventListener("backbutton", onCancelTaskBtnTap, false);
        }            
        
        todosCancelBtn.show();
        todosDoneBtn.show();
        todosAddBtn.hide();
        todosHideCompBtn.hide();
        
        // tasksListComp.hide();
        tasksTabPanel.hide();
        
        taskFormPanel.show();
        
        BottomTabsInline.getTabBar().hide();
    };
    
    function onCancelTaskBtnTap() {
        Util.logger('In onCancelTaskBtnTap()');
        
        // hide keyboard
        if(Ext.is.iOS) {
            var taskTitleField = Ext.get('task_title_field');
            taskTitleField.down('input').dom.focus();
            taskTitleField.down('input').dom.blur();
        }
        if(Ext.is.Android) {
            onAndroidButtonHandler();
        }

        if(taskFormBase.todo.get('action') == 'new') {
            FlurryPlugin.logEvent('tasks_addForm_cancel');
            
            Ext.apply(taskFormPanel, { showAnimation: 'fade' });
        } else {
            FlurryPlugin.logEvent('tasks_editForm_cancel');
            
            Ext.apply(taskFormPanel, { showAnimation: 'slide', direction: 'right' });
        }
        
        showFreshTasksListPanel();
    };
    
    function onDoneTaskBtnTap(btn, eveObj) {
        Util.logger('In onDoneTaskBtnTap()');

        var index = Util.getItemsSize(allEntities[0]);
        var current_state = 'select';
        var model = Ext.ModelMgr.create(taskFormPanel.getValues(), 'Todo');
        var message = "", errors = model.validate();
        
        // KL - hide keyboard
        if(Ext.is.iOS) {
            var taskTitleField = Ext.get('task_title_field');
            taskTitleField.down('input').dom.focus();
            taskTitleField.down('input').dom.blur();
        }
        if(Ext.is.Android)
            window.KeyBoard.hideKeyBoard();

        //manual validation
        if(!Ext.isEmpty(model.get('remind_before')) && Ext.isEmpty(model.get('due_at'))) {
            var error = {field: 'remind_before', message: 'Set Due at to enable reminder'};
            errors.add("remind_before", error);
        }

        if(errors.isValid()) {
            
            if(taskFormBase.todo) {
                Util.logger('Before updateRecord');
                Util.logger('todo:', taskFormBase.todo);
                taskFormPanel.updateRecord(taskFormBase.todo, true);
                if(taskFormBase.todo.get('action') == 'edit') {
                    FlurryPlugin.logEvent('tasks_editForm_done');
                    FlurryPlugin.countPageView();
                    
                    index = taskFormBase.todo.get('todo_id')-1;
                    current_state = taskFormBase.todo.get('cl_state');
                    Util.logger('taskFormBase.todo todo_id-1 is:', index);
                } else {
                    FlurryPlugin.logEvent('tasks_addForm_done');
                    FlurryPlugin.countPageView();
                }
                // Tasks.saveTodo(taskFormBase.todo.get('id'), taskFormBase.todo.get('title'), due_at, taskFormBase.todo.get('remind_before'), 
                //  taskFormBase.todo.get('completed_at'), index, current_state, taskFormBase.todo.get('action'), showFreshTasksListPanel, refreshTaskBadgeTextCB);
                var newTodoObj = Tasks.copyToTodoObject(taskFormBase.todo);
                saveAllData(allEntities[0], newTodoObj, index, current_state, taskFormBase.todo.get('action'));
            } else {
                Util.logger('[INFO]:: onDoneTaskBtnTap(): taskFormBase.todo is null');
            }
            
            if(Ext.is.Android) {
                document.removeEventListener("menubutton", onTaskMenuKeyDown, false);
                document.addEventListener("menubutton", onMenuKeyDown, false);
                
                document.removeEventListener("backbutton", onCancelTaskBtnTap, false);
                document.addEventListener("backbutton", Ext.emptyFn, false);
            }
            
        } else {
            Ext.each(errors.items, function(rec, i) {
                message += '<p class="loginErrorMsg">'+rec.message+'</p>';
            });
            Ext.Msg.alert("Oops!", message, Ext.emptyFn);
        }
        
        return false;

        // showFreshTasksListPanel();
        
    };
    
    function onDeleteTaskBtnTap(btn) {
        Util.logger('In onDeleteTaskBtnTap()');
        
        if(btn == 'yes') {
            FlurryPlugin.logEvent('tasks_editForm_delete');
            FlurryPlugin.countPageView();
            
            if(taskFormBase.todo) {
                taskFormPanel.updateRecord(taskFormBase.todo, true);
                
                index = taskFormBase.todo.get('todo_id')-1;
                
                // Tasks.saveTodo(taskFormBase.todo.get('id'), taskFormBase.todo.get('title'), taskFormBase.todo.get('due_at'), taskFormBase.todo.get('remind_before'), 
                //  taskFormBase.todo.get('completed_at'), index, taskFormBase.todo.get('cl_state'), 'delete', showFreshTasksListPanel, refreshTaskBadgeTextCB);
                var newTodoObj = Tasks.copyToTodoObject(taskFormBase.todo);
                saveAllData(allEntities[0], newTodoObj, index, taskFormBase.todo.get('cl_state'), 'delete');
            } else {
                Util.logger('[INFO]:: onDeleteTaskBtnTap(): taskFormBase.todo is null');
            }

            if(Ext.is.Android) {
                document.removeEventListener("menubutton", onTaskMenuKeyDown, false);
                document.addEventListener("menubutton", onMenuKeyDown, false);
                
                document.removeEventListener("backbutton", onCancelTaskBtnTap, false);
                document.addEventListener("backbutton", Ext.emptyFn, false);
            }
            
            // showFreshTasksListPanel();
        }
    };
    
    function onTaskItemtapCB(dataview, index, item, eve) {
        Util.logger("[onTaskItemtapCB] function executing");
        var record = dataview.store.getAt(index);
        var todo = record.data;
        
        // KL - catching the toggle event tap zone
        if(new Ext.Element(eve.getTarget()).hasCls('todo_check_container')) {
            Util.logger("[onTaskItemtapCB] toggle task tapped");
            if(tasksTabPanel.getActiveItem() == tasksListComp)
                FlurryPlugin.logEvent('tasks_current_toogle');
            else
                FlurryPlugin.logEvent('tasks_completed_toogle');
                
            if(Ext.isEmpty(todo.completed_at)) {
                Util.logger("[onTaskItemtapCB] task marked as completed");
                todo.completed_at = new Date();
            } else {
                Util.logger("[onTaskItemtapCB] task marked as uncompleted");
                todo.completed_at = null;
            }
            saveAllData(allEntities[0], todo, todo.todo_id - 1, todo.cl_state, 'toggle');
        } 
        else {
            Util.logger("[onTaskItemtapCB] disclose task tapped");
            FlurryPlugin.logEvent('tasks_main_edit');
            FlurryPlugin.countPageView();

            if(tasksListComp == tasksTabPanel.getActiveItem()) {
                taskFormBase.todo = Ext.ModelMgr.create({
                    id: parseInt(record.get('id')),
                    title: record.get('title'),
                    due_at: record.get('due_at'),
                    remind_before: record.get('remind_before'),
                    todo_id: parseInt(record.get('todo_id')),
                    completed_at: record.get('completed_at'),
                    cl_state: record.get('cl_state'),
                    client_uid: record.get('client_uid'),
                    action: 'edit'},
                    'Todo');
                taskFormPanel.load(taskFormBase.todo);
                onAddTaskBtnTap();
            }
                // onTasksItemDisclosureCB(record, item, index);
        }
    };
    
    //NON-WORKING code
    function onTasksItemDisclosureCB(record, btn, index) {
        Util.logger('In onTasksItemDisclosureCB()');
        
        Util.logger(index);
        Util.logger('title is: ' + record.get('title')+', todo_id is:'+record.get('todo_id')
            +', due_at: '+record.get('due_at')+', completed_at: '+record.get('completed_at'));
        taskFormBase.todo = Ext.ModelMgr.create({
            id: parseInt(record.get('id')),
            title: record.get('title'),
            due_at: record.get('due_at'),
            remind_before: record.get('remind_before'),
            todo_id: parseInt(record.get('todo_id')),
            completed_at: record.get('completed_at'),
            cl_state: record.get('cl_state'),
            client_uid: record.get('client_uid'),
            action: 'edit'},
            'Todo');
        taskFormPanel.load(taskFormBase.todo);
        // deleteTaskSheet.show();
        // Util.logger(taskFormBase.todo);
        onAddTaskBtnTap();
    };
    //NON-WORKING code ends
    
    function showFreshTasksListPanel() {
        Util.logger('In showFreshTasksListPanel()');
        FlurryPlugin.countPageView();
        
        refreshTasksTabListPanel('');
        
        resetTaskFormPanel();
        
        // todosDeleteBtn.hide();
        todosCancelBtn.hide();
        todosDoneBtn.hide();
        todosAddBtn.show();
        todosHideCompBtn.show();
        
        todosNavBar.setTitle('Tasks');
        taskFormPanel.hide();
        
        tasksTabPanel.show();
        tasksListComp.show();
        
        BottomTabsInline.getTabBar().show();
    };
    
    function refreshTasksTabListPanel(timeDelay) {
        Util.logger('In refreshTasksTabListPanel()');
        
        var todos = [];
        var completed_todos = [];
        todos = refreshTasksListData(isUncompletedTaskTimeStampCB);
        completed_todos = refreshTasksListData(isCompletedTaskTimeStampCB);
        
        tasksListComp.getStore().loadData(todos, false);
        tasksCompletedListComp.getStore().loadData(completed_todos, false);
        /*
        if(!Ext.isEmpty(todos)) {
            todos = todos.sort(function(a,b) {
                return (a.get('due_at') > b.get('due_at') ? 1 : -1)
            });
        }
        */
        if(Ext.isEmpty(timeDelay)) {
            refreshTaskBadgeTextCB(todos);
        } else {
            setTimeout("Util.logger(\'tasksListComp, tasksCompletedListComp & tabBadge refreshing\'); "+
                                "tasksListComp.refresh(); tasksCompletedListComp.refresh();", 1700);
            setTimeout("Tasks.refreshTaskBadgeTextCB("+todos+")", 2000);
        }
        
        //refreshing for next usage
        // taskFormBase.todo = Tasks.initializeTodoModel();
        return todos;
    };
    
    function refreshTaskBadgeTextCB(tasks, timeDelay) {
        Util.logger('In refreshTaskBadgeTextCB()');
        
        BottomTabsInline.getTabBar().items.items[panelIndex.todo].setBadge(Util.getOverdueTasks(tasks, true)); //todo entity
    };
    
    function refreshTasksListData(taskTimeStampCB) {
        var user_id = Api.getLocalStorageProp('user_id');
        //comp_subent is completed_subEntity
        // comp_subent = (Ext.isEmpty(comp_subent) ? comp_subent : comp_subent+'_');//making of 'comp' to 'comp_'
        var todos = [], itemKey, value;
        var todoKey = allEntities[0]+'_'+user_id;
        for(var i = 0, losLength = localStorage.length; i < losLength; i++) {
            itemKey = localStorage.key(i);
            if(itemKey.indexOf(todoKey) != -1) {
                // Util.logger('after key is: '+itemKey);
                value = Ext.decode(localStorage[itemKey]);
                if(value.cl_state != 'delete') {
                    if(taskTimeStampCB(value.completed_at)) {
                        value.due_at = Api.parseFromUTCDate(value.due_at);
                        value.completed_at = Api.parseFromUTCDate(value.completed_at);
                        value.created_at = Api.parseFromUTCDate(value.created_at);
                        value.updated_at = Api.parseFromUTCDate(value.updated_at);
                        todos.push(value);
                    }
                }
                // Util.logger('after todo['+i+'].id is: '+value.id+'\ntodo['+i+'].title is: '+value.title);
            }
        }
        return todos;
    };
    
    function isUncompletedTaskTimeStampCB(completed_at) {
        if(Ext.isEmpty(completed_at) || (Api.parseFromUTCDate(completed_at) > Util.getMoveCompletedTimeStamp()))
            return true;

        return false;
    };
    
    function isCompletedTaskTimeStampCB(completed_at) {
        if(!Ext.isEmpty(completed_at))
            return true;
            
        return false;
    };
    
    function onTaskMenuKeyDown() {
        onAndroidButtonHandler();
        onMenuKeyDown();
    };
    
    function onAndroidButtonHandler() {
        Ext.getCmp('task_dueAt_field').getDatePicker().hide();
        /*
        Ext.getCmp('task_title_field').fieldEl.dom.focus();                                
        Ext.getCmp('task_title_field').fieldEl.dom.blur();
        */
        Ext.Msg.hide();
        window.KeyBoard.hideKeyBoard();
        
        document.removeEventListener("backbutton", onCancelTaskBtnTap, false);
        document.addEventListener("backbutton", Ext.emptyFn, false);
    };
    
    //__TASKS action handlers end============================================================
    
    
}();