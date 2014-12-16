var Journals = function(){
    /* Public pointers to private functions */
    return {
        createJournalFormPanel: createJournalFormPanel,
        getListBase: getListBase,
        copyToNoteObject: copyToNoteObject,
        saveNote: saveNote,
        renderJournalsPanel: renderJournalsPanel,
        onAddJournalBtnTap: onAddJournalBtnTap,
        showJournalReadPanel: showJournalReadPanel,
        showFreshJournalsListPanel: showFreshJournalsListPanel,
        refreshJournalsListPanel: refreshJournalsListPanel,
        refreshJournalBadgeTextCB: refreshJournalBadgeTextCB
    };
    
    /* Private functions */
    //__JOURNALS utility function start=============================================================================
    function createJournalFormPanel(dockedItem) {
        return {
            fullscreen: (Ext.is.iOS) ? true : false,
            hidden: true,
            standardSubmit: false,
            scroll: (Ext.is.iOS) ? false : 'vertical',
            items: [{
                xtype: 'fieldset',
                items: [{
                    xtype: 'textfield',
                    name: 'title',
                    placeHolder: 'Title (optional) ...',
                    useClearIcon: true,
                    autoCapitalize : true,
                    id: 'journal_title_field'
                }, {
                    xtype: 'textareafield',
                    name: 'description',
                    placeHolder: '*Post something private ...',
                    maxRows: 8,
                    required: true,
                    useClearIcon: true,
                    autoCapitalize: true
                }, {
                    xtype: 'datepickerfield',
                    name: 'posted_at',
                    // useClearIcon: true,
                    required: true,
                    hideOnMaskTap: true,
                    label: 'Post at',
                    value: new Date(), //.format('M, d, Y'),
                    cls: 'posted_at_field',
                    id: 'journal_postedAt_field',
                    picker: {
                        listeners: {
                            beforeshow: function() {
								Util.hideKeyboard('journal_title_field');
                            }
                        }
                    }
                }]
            }, {
                height: (Ext.is.iOS) ? 70 : '',
                dockedItems:[dockedItem]
            }]
        };
    };
    
    function getListBase(notesTpl, notesData, itemtapCB) {
        return {
            itemTpl: notesTpl,
            layout: 'fit',
            hidden: true,
            selModel: {
                mode: 'SINGLE',
                allowDeselect: true
            },
            // grouped: true,
/*            onItemDisclosure: {
                scope: 'test',
                handler: itemDisclosureCB
            },
            indexBar: true,
*/          
            emptyText: '<p class="emptyJournalMessage"><strong>You have no Journal posts yet</strong></p>',
            grouped: true,
            store: getNotesListStore(notesData),
            fullscreen: true,
            scroll: 'vertical',
            listeners: {
                itemtap: itemtapCB
            },
            collectData : function(records, startIndex) {
                if (!this.grouped) {
                    return Ext.List.superclass.collectData.call(this, records, startIndex);
                }

                var results = [],
                    groups = this.store.getGroups(),
                    ln = groups.length,
                    children, cln, c,
                    group, i, lastMonthDay, currentMonthDay;

                for(var i = 0, ln = groups.length; i < ln; i++) {
                    group = groups[i];
                    children = group.children;
                    lastMonthDay = "00-00";
                    for(var c = 0, cln = children.length; c < cln; c++) {
                        if(children[c].data.id < 0) {
                            children[c] = children[c].data;
                        } else {
                            currentMonthDay = Util.pad(children[c].data.posted_at.getMonth() + 1) + "-" + Util.pad(children[c].data.posted_at.getDate());
                            children[c] = Ext.apply(children[c].data, { firstDateChild: currentMonthDay == lastMonthDay ? false : true });
                        }
                        lastMonthDay = currentMonthDay;
                    }
                    results.push({
                        group: group.name,
                        id: this.getGroupId(group),
                        items: this.listItemTpl.apply(children)
                    });
                }

                return results;
            }
        };
    };
    
    function getNotesListStore(notes) {
        return new Ext.data.Store({
            model: 'Notes',
            sorters: [{   
                //match it with the model method: Person.load_more argument: order
                property : 'posted_at',
                direction: 'DESC'
            }],
            getGroupString : function(record) {
                return Ext.util.Format.date(record.get('posted_at'), 'F Y');//record.get('occurs_at').format('F Y');
            },

            data: [notes]
        });
    };
    
    function copyToNoteObject(noteModel) {
        var noteObj = new Object();
        noteObj.id = noteModel.get('id');
        noteObj.title = noteModel.get('title');
        noteObj.description = noteModel.get('description');
        noteObj.posted_at = noteModel.get('posted_at');
        noteObj.created_at = noteModel.get('created_at');
        noteObj.note_id = noteModel.get('note_id');
        noteObj.cl_state = noteModel.get('cl_state');
        noteObj.client_uid = noteModel.get('client_uid');
        return noteObj;
    };

    /*
    title, description, posted_at refers to the properties of Note item
    index refers to the index position in the localStorage notes array
    curr_state refers to the current persistence state of the note item, which can be
        'select', 'insert', 'update' or 'delete'
    action refers to the 'new', 'edit' or 'delete' action performed on the note item
    callBack refers to the function to call after or parallel to the AJAX request
    syncCallBack refers to the function to call only after the AJAX request returns
    */
    function saveNote(noteParam, index, curr_state, action, callBack, syncCallBack, failCallBack) {
        Util.logger('In saveNote()');
        
        var user_id = Api.getLocalStorageProp('user_id');
        var newNote = new Object();

/*
        if(curr_state == 'insert' && action == 'delete') {
            localStorage.removeItem('note_'+user_id+'['+index+']');
            Util.logger('Item removed locally');
            Api.decrementLocalStorageKey('unsaved_'+Api.pluralize(allEntities[1])+'_count');
            callBack();
            syncCallBack();
        } else {
*/
            newNote.id = noteParam.id;
            newNote.title = noteParam.title;
            newNote.description = noteParam.description;
            newNote.posted_at = Api.formatToUTCDate(noteParam.posted_at);
            newNote.created_at = Api.formatToUTCDate(noteParam.created_at);
            newNote.updated_at = Api.formatToUTCDate(new Date());
            newNote.note_id = index+1;
            newNote.cl_state = Util.getItemState(curr_state, action);
            newNote.client_uid = noteParam.client_uid;
            
            // Util.logger('newNote before saving:::', JSON.stringify(newNote));
            
            Util.remoteSyncItem(allEntities[1], newNote, action, callBack, syncCallBack, failCallBack);
            
            // cacheNoteLocally(newNote, index);
            // callBack();
        // }
    };
    //__JOURNALS utility function end=============================================================================
    
    //__JOURNALS panels layout start==================================================================================
    function renderJournalsPanel() {
        
        var notesTpl = new Ext.XTemplate(
            '<tpl if="id != -1">', 
                '<div class="journal_date_container {[this.isPostingToday(values.posted_at) ? "today_container" : ""]} {[values.firstDateChild ? "firstDateChild" : "notFirstDateChild"]}">', 
                    '<div class="journal_item_day"><span>{posted_at:date("D")}</span></div>', 
                    '<div class="journal_item_date"><span>{posted_at:date("j")}</span></div>', 
                '</div>', 
                '<div class="journalDescMain">',
                '<tpl if="this.hasTitle(title)">', 
                    '<div class="journal_list_item title">{[fm.htmlEncode(fm.ellipsis(values.title, 30, true))]}</div>', 
                '</tpl>', 
                '<div class="journal_list_item{[this.isPostingToday(values.posted_at) ? " today_list_item" : ""]} desc">', 
                    '<p class="note">{[fm.htmlEncode(fm.ellipsis(values.description, 72, true))]}</p>', 
                '</div>', 
                '</div>', 
                '<p class="createdAt">{posted_at:date("g:i A")}</p>', 
            '</tpl>', 
            '<tpl if="id == -1">', 
                '<div class="journal_list_item load_more">{description}</div>', 
            '</tpl>',
            {
                hasTitle: function(c) {
                    return !Ext.isEmpty(c);
                },
                isPostingToday: function(d) {
                    return (new Date().format('j,F,Y') == d.format('j,F,Y'));
                }
            });
        
        var noteReadTpl = new Ext.XTemplate(
            '<div class="journalViewPage">', 
                '<div class="journalViewPageDate">', 
                    '<p class="journalDetail day">{posted_at:date("D")}</p>', 
                    '<p class="journalDetail date">{posted_at:date("d")}</p>', 
                    '<div>', 
                        '<p class="journalDetail month">{posted_at:date("F")}</p>', 
                        '<p class="journalDetail year">{posted_at:date("Y")}</p>', 
                    '</div>', 
                '</div>', 
                '<div class="journalViewPageContent clear">', 
                    '<p class="createdAt">{posted_at:date("g:i A")}</p>', 
                    '<tpl if="this.hasTitle(title)">', 
                        '<p class="journal_list_item title clear"><strong>{[fm.htmlEncode(fm.ellipsis(values.title, 40, true))]}</strong></p>', 
                    '</tpl>', 
                    '<div class="journal_list_item desc clear">', 
						'<p>{[this.nl2br(fm.htmlEncode(values.description))]}</p>', 
                    '</div>', 
                '</div>', 
            '</div>', 
            {
                hasTitle: function(c) {
                    return !Ext.isEmpty(c);
                },
				nl2br: function(str) {
					return str.replace(/\n/g, "<br/>");
				}
            });
            
        var notes = [];

        notesCancelBtn = new Ext.Button(Ext.apply(
            Api.getButtonBase('Cancel', true, 'note_cancel', onCancelJournalBtnTap), 
            { ui: 'cancel' }
            ));

        // notes = refreshJournalsListData();
        notesBackBtn = new Ext.Button(Ext.apply(
            Api.getButtonBase('Back', true, 'note_back', onBackJournalBtnTap), 
            { ui: 'cancel' }
            ));

        notesEditBtn = new Ext.Button(Api.getButtonBase('Edit', true, 'note_edit', onEditJournalBtnTap));
        notesDoneBtn = new Ext.Button(Api.getButtonBase('Done', true, 'note_done', onDoneJournalBtnTap));
        // notesMoreAddBtn = new Ext.Button(Api.getButtonBase('++', false, 'note_more_add', onMoreAddJournalBtnTap));
		notesAddBtn = new Ext.Button(Api.getButtonBase('+', false, 'note_add', onAddJournalBtnTap));

        notesNavBar = new Ext.Toolbar({
            ui: 'dark',
            dock: 'top',
            title: 'Journal',
            items: [/*notesMoreAddBtn, */notesCancelBtn, notesBackBtn, {xtype: 'spacer'}, notesAddBtn, notesDoneBtn, notesEditBtn]
        });

        notesNextBtn = new Ext.Button(Api.getButtonBase('<span class="btn-next-post"></span>', false, 'note_next', onNextJournalBtnTap));
        notesPrevBtn = new Ext.Button(Api.getButtonBase('<span class="btn-prev-post"></span>', false, 'note_prev', onNextJournalBtnTap));

        notesNextPrevBar = new Ext.Toolbar({
            ui: 'light',
            dock: 'bottom',
            // title: 'Journal',
            hidden: true,
            items: [notesPrevBtn, {xtype: 'spacer'}, notesNextBtn],
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

        notesFormBarBtn = new Ext.Button(Ext.apply(
			Api.getButtonBase('<span class="btn-add-pic"></span>', false, 'note_formbar', onFormBarJournalBtnTap),
			{ centered: true,
			pack: 'center'}
			));

        notesFormBar = new Ext.Toolbar({
            ui: 'light',
            dock: 'bottom',
            // title: 'Journal',
			pack: 'center',
            hidden: true,
            items: [notesFormBarBtn],
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

        notesDeleteBtn = new Ext.Button(Ext.apply(
            Api.getButtonBase('Delete', true, 'note_delete', function() { 
                    Ext.Msg.confirm("Confirmation", "Are you sure you want to delete that?", onDeleteJournalBtnTap);}), 
            { ui: 'decline',
            dock: 'bottom' }
            ));

        //List starts
        Ext.regModel('Notes', {
            fields: ['id', 'title', 'description', 'posted_at', 'created_at', 'note_id', 'cl_state', 'client_uid']
        });

        journalsListComp = new Ext.List(Ext.apply(Journals.getListBase(notesTpl, notes, onJournalItemtapCB)));

        //List ends
/*
        //this is a workaround to fix rendering issues
        journalDeletePanel = new Ext.Panel({
            layout: 'fit',
            dock: 'bottom',
            items: [notesDeleteBtn]
        });
*/
        journalFormBase = Journals.createJournalFormPanel(notesDeleteBtn);
        journalFormPanel = new Ext.form.FormPanel(journalFormBase);
        journalReadPanel = new Ext.Panel({
            fullscreen: true,
            hidden: true,
            scroll: 'vertical',
            draggable: {threshold: 50, direction: 'horizontal'},
            showAnimation: 'slide',
            tpl: noteReadTpl,
            listeners: {
                afterRender: function() {
                    this.mon(this.el, {
                        swipe: onJournalSwipeCB,
                        showAnimation: 'slide',
                        scope: this
                    });
                }
            }
        });
        
        Ext.regModel('Note', { 
            fields: [
                {name: 'id', type: 'int'},
                {name: 'title', type: 'string'},
                {name: 'description', type: 'string'},
                {name: 'posted_at', type: 'date'},
                {name: 'note_id', type: 'int'},
                {name: 'cl_state', type: 'string'},
                {name: 'client_uid', type: 'string'},
                {name: 'action', type: 'string'}
            ],
            validations: [
                {type: 'presence', name: 'description', message: "Description is required"}
            ]
        });

        resetJournalFormPanel();

        journalsPanel = new Ext.Panel({
            fullscreen: (Ext.is.iOS) ? false : true,
            title: 'Journal',
            id: 'tab'+panelIndex.note+1,
            cls: 'card'+(panelIndex.note+1) + ' journals_panel',
            iconCls: 'bookmarks',
            layout: 'card',
            // scroll: false,
            // badgeText: Util.getBadgeText(allEntities[1]), //note entity
            items: [ journalsListComp, journalReadPanel, journalFormPanel ],
            dockedItems: [notesNavBar, notesNextPrevBar, notesFormBar]
        });
        
        return journalsPanel;
    };
    //__JOURNALS panels layout end==================================================================================
    
    //__JOURNALS action handlers start============================================================
    
    function resetJournalFormPanel() {
        journalFormBase.note = Ext.ModelMgr.create({ id: null, title: '', description: '', posted_at: new Date(), type: null,
                                        note_id: null, created_at: new Date(), cl_state: 'insert', client_uid: Api.randomString(), action: 'new'}, 'Note');
        journalFormPanel.load(journalFormBase.note);
    };
    
	function onMoreAddJournalBtnTap() {
        Util.logger('In onMoreAddJournalBtnTap()');
		Ext.Msg.alert('Photo Diary', 'This feature has been temporarily disabled', Ext.emptyFn);			
	};

    function onAddJournalBtnTap() {
        Util.logger('In onAddJournalBtnTap()');
        
        if(journalFormBase.note.get('action') == 'edit') {
            Util.logger('In edit');
            notesNavBar.setTitle('Edit Journal');
            
            notesDeleteBtn.show();
            
            Ext.apply(journalFormPanel, { showAnimation: 'slide', direction: 'left' });
            
        } else {
            Util.logger('In new');
            FlurryPlugin.logEvent('journals_main_add');
            FlurryPlugin.countPageView();
            
            notesNavBar.setTitle('New Journal');
            
            resetJournalFormPanel();
            // journalFormPanel.items.items[0].items.items[1].setValue(new Date());
            
            notesDeleteBtn.hide();
            
            Ext.apply(journalFormPanel, { showAnimation: { type : 'slide', direction: 'up'} });
            
            if(Ext.is.Android)
                document.removeEventListener("backbutton", Ext.emptyFn, false);

            // journalFormBase.note = Journals.initializeNoteModel();
            // journalFormPanel.load(journalFormBase.note);
        }
        
        if(Ext.is.Android) {
            // document.removeEventListener("menubutton", onMenuKeyDown, false);
            document.addEventListener("menubutton", onJournalMenuKeyDown, false);
            
            // document.removeEventListener("backbutton", Ext.emptyFn, false);
            document.addEventListener("backbutton", onCancelJournalBtnTap, false);
        }
        
        notesCancelBtn.show();
        notesDoneBtn.show();
        notesAddBtn.hide();
		// notesMoreAddBtn.hide();
        notesBackBtn.hide();
        notesEditBtn.hide();
        
        journalsListComp.hide();
        journalReadPanel.hide();
        journalFormPanel.show();
        
        notesNextPrevBar.hide();
		notesFormBar.show();
        BottomTabsInline.getTabBar().hide();
        
    };
    
    function onBackJournalBtnTap() {
        Util.logger('In onBackJournalBtnTap()');
        
        FlurryPlugin.logEvent('journals_read_back');
        
        Ext.apply(journalReadPanel, { showAnimation: 'slide', direction: 'right' });
        
        showFreshJournalsListPanel();

        if(Ext.is.Android) {
            document.removeEventListener("backbutton", onBackJournalBtnTap, false);
            document.addEventListener("backbutton", Ext.emptyFn, false);
        }
        
    };
    
    function onCancelJournalBtnTap() {
        Util.logger('In onCancelJournalBtnTap()');
        
        // hide keyboard
        if(Ext.is.iOS) {
            var noteTitleField = Ext.get('journal_title_field');
            noteTitleField.down('input').dom.focus();
            noteTitleField.down('input').dom.blur();
        }        
        if(Ext.is.Android) {
            onAndroidButtonHandler();
        }
        
        if(journalFormBase.note.get('action') == 'new') {
            FlurryPlugin.logEvent('journals_addForm_cancel');
            
            Ext.apply(journalFormPanel, { showAnimation: 'fade' });
            showFreshJournalsListPanel();
        } else {
            FlurryPlugin.logEvent('journals_editForm_cancel');
            
            Ext.apply(journalFormPanel, { showAnimation: 'slide', direction: 'right' });
            showJournalReadPanel();

            if(Ext.is.Android)
                document.addEventListener("backbutton", onBackJournalBtnTap, false);

        }
    };
    
    function onEditJournalBtnTap() {
        Util.logger('In onEditJournalBtnTap()');
        FlurryPlugin.logEvent('journals_main_edit');
        FlurryPlugin.countPageView();

        journalFormPanel.load(journalFormBase.note);
        
        if(Ext.is.Android)
            document.removeEventListener("backbutton", onBackJournalBtnTap, false);
        
        onAddJournalBtnTap();
        
    };
    
    function onDoneJournalBtnTap(btn, eveObj) {
        Util.logger('In onDoneJournalBtnTap()');

        var index = Util.getItemsSize(allEntities[1]);
        var current_state = 'select';
        var model = Ext.ModelMgr.create(journalFormPanel.getValues(), 'Note');
        var message = "", errors = model.validate();
        
        // hide keyboard
        if(Ext.is.iOS) {
            var noteTitleField = Ext.get('journal_title_field');
            noteTitleField.down('input').dom.focus();
            noteTitleField.down('input').dom.blur();
        } else if(Ext.is.Android)
            window.KeyBoard.hideKeyBoard();
        
        if(errors.isValid()) {
           if(journalFormBase.note) {
                journalFormPanel.updateRecord(journalFormBase.note, true);

                Util.logger('description retrieved is: ', journalFormBase.note.get('description'));
            
                if(Ext.is.Android) {
                    // document.removeEventListener("menubutton", onJournalMenuKeyDown, false);
                    // document.addEventListener("menubutton", onMenuKeyDown, false);

                    document.removeEventListener("backbutton", onCancelJournalBtnTap, false);
                    document.addEventListener("backbutton", onBackJournalBtnTap, false);
                }
                
                if(journalFormBase.note.get('action') == 'edit') {
                    FlurryPlugin.logEvent('journals_editForm_done');
                    FlurryPlugin.countPageView();
                    
                    index = journalFormBase.note.get('note_id')-1;
                    current_state = journalFormBase.note.get('cl_state');

                } else {
                    FlurryPlugin.logEvent('journals_addForm_done');
                    FlurryPlugin.countPageView();
                }
                // Journals.saveNote(journalFormBase.note.get('id'), journalFormBase.note.get('title'), journalFormBase.note.get('description'),
                //                 index, current_state, journalFormBase.note.get('action'), showFreshJournalsListPanel, refreshJournalBadgeTextCB);
                var newNoteObj = Journals.copyToNoteObject(journalFormBase.note);
                saveAllData(allEntities[1], newNoteObj, index, current_state, journalFormBase.note.get('action'));
            } else {
                Util.logger('[INFO]:: onDoneJournalBtnTap(): journalFormBase.note is null');
            }
            
        } else {
            Ext.each(errors.items, function(rec, i) {
                message += '<p class="loginErrorMsg">'+rec.message+'</p>';
            });
            Ext.Msg.alert("Oops!", message, Ext.emptyFn);
        }
        return false;

        // showFreshJournalsListPanel();
        
    };
    
    function onDeleteJournalBtnTap(btn) {
        Util.logger('In onDeleteJournalBtnTap()');
        
        if(btn == 'yes') {
            FlurryPlugin.logEvent('journals_editForm_delete');
            
            if(journalFormBase.note) {
                journalFormPanel.updateRecord(journalFormBase.note, true);
                
                index = journalFormBase.note.get('note_id')-1;
                
                // Journals.saveNote(journalFormBase.note.get('id'), journalFormBase.note.get('title'), journalFormBase.note.get('description'), 
                //                 index, journalFormBase.note.get('cl_state'), 'delete', showFreshJournalsListPanel, refreshJournalBadgeTextCB);
                var newNoteObj = Journals.copyToNoteObject(journalFormBase.note);
                saveAllData(allEntities[1], newNoteObj, index, journalFormBase.note.get('cl_state'), 'delete');
            } else {
                Util.logger('[INFO]:: onDeleteJournalBtnTap(): journalFormBase.note is null');
            }

            if(Ext.is.Android) {
                document.removeEventListener("menubutton", onJournalMenuKeyDown, false);
                document.addEventListener("menubutton", onMenuKeyDown, false);

                document.removeEventListener("backbutton", onCancelJournalBtnTap, false);
                document.addEventListener("backbutton", Ext.emptyFn, false);
            }
            // showFreshJournalsListPanel();
            
        }
    };
    
    function onNextJournalBtnTap(btn, eveObj) {
        Util.logger('Journals.onNextJournalBtnTap called');
        
        var otherRecord;
        var index = journalsListComp.getStore().findExact('note_id', journalFormBase.note.get('note_id'));

        if(btn.text == '>' || btn.initialConfig.cls == 'note_next') {
            //load below journal post if any
			otherRecord = journalsListComp.getRecord(journalsListComp.getNode(index+1));
        } else if(btn.text == '<' || btn.initialConfig.cls == 'note_prev') {
            //load above journal post if any
			otherRecord = journalsListComp.getRecord(journalsListComp.getNode(index-1));
        }

        Util.logger('selected item index in list is::', index);
        Util.logger('otherRecord is::', otherRecord);

        updateJournalReadPanel(otherRecord);
        
    };
    
	function onFormBarJournalBtnTap(btn, eveObj) {
		Util.logger('In onFormBarJournalBtnTap()');
		Ext.Msg.alert('Photo Diary', 'Yay! Soon you will be able to take and add pictures from your mobile phone. We will notify you when it is out. Your Diary.com Team', Ext.emptyFn);
		if(journalFormBase.note.get('action') == 'edit')
			FlurryPlugin.logEvent('journals_editForm_cam');
		else
			FlurryPlugin.logEvent('journals_addForm_cam');
			
	};
	
    // function onJournalsItemDisclosureCB(record, btn, index) {
    function onJournalItemtapCB(dataview, index, item, eve) {
        Util.logger('In onJournalItemtapCB()');
        var record = dataview.store.getAt(index);
        var prevRecordObj = new Object();
        var prevRecord;
        // var note = record.data;
        
        Util.logger('title is: ' + record.get('title')+', note_id is:'+record.get('note_id')+', id is: '+record.get('id')
            +', description: '+record.get('description')+', posted_at: '+record.get('posted_at'));
            
        //last record of Load More journals is pressed
        if(record.get('id') == -1) {
            FlurryPlugin.logEvent('journals_main_loadMore');
            
            //picking up the last server saved journal record
            prevRecordObj.id = 0;
            while(index >= 0 && prevRecordObj.id <= 0) {
                prevRecord = journalsListComp.getRecord(journalsListComp.getNode(--index));
                Util.logger('prevRecord.id is::', prevRecord.get('id'));
                prevRecordObj.id = (prevRecord.get('id') > 0) ? prevRecord.get('id') : 0;
            }
            
            if(prevRecordObj.id > 0)
                Util.syncListOfItems(allEntities[1], prevRecordObj, refreshDashAndListPanelsCB, requestFailedCB);
        } 
        else {
            FlurryPlugin.logEvent('journals_read_show');
            FlurryPlugin.countPageView();
            
			//get a reference to the User model class
			// var newNote = Ext.ModelMgr.getModel('Note');
			
            journalFormBase.note = Ext.ModelMgr.create({
                id: parseInt(record.get('id')),
                title: record.get('title'),
                description: record.get('description'),
                posted_at: record.get('posted_at'),
                note_id: parseInt(record.get('note_id')),
                cl_state: record.get('cl_state'),
                client_uid: record.get('client_uid'),
                action: 'edit'},
                'Note');
                
            var noteItem = copyToNoteObject(journalFormBase.note);
            journalReadPanel.update(noteItem);
            
            showJournalReadPanel();

            if(Ext.is.Android) {
                document.removeEventListener("backbutton", Ext.emptyFn, false);
                document.addEventListener("backbutton", onBackJournalBtnTap, false);
            }
            // journalFormPanel.load(journalFormBase.note);
            
            // onAddJournalBtnTap();
        }
    };
    
    function onJournalSwipeCB(eve, ele, item) {
        Util.logger('In onJournalSwipeCB()');
        Util.logger('event is::', eve);
        Util.logger('ele is::', ele);
        Util.logger('item is::', item);
        Util.logger('item.scope.data is::', item.scope.data);

        var otherRecord;
        var index = journalsListComp.getStore().findExact('note_id', journalFormBase.note.get('note_id'));
        //item.scope.data.note_id
        Util.logger('selected item index in list is::', index);

        if(eve.direction == 'left') {
            //load below journal post if any
			otherRecord = journalsListComp.getRecord(journalsListComp.getNode(index+1));
        } else if(eve.direction == 'right') {
            //load above journal post if any
			otherRecord = journalsListComp.getRecord(journalsListComp.getNode(index-1));
        }
        
        updateJournalReadPanel(otherRecord);
    };
    
    function updateNextPrevBtns() {
        var index = journalsListComp.getStore().findExact('note_id', journalFormBase.note.get('note_id'));
        var nextRecord = journalsListComp.getStore().getAt(index+1);
        var prevRecord = journalsListComp.getStore().getAt(index-1);
    
        if(Ext.isEmpty(nextRecord) || nextRecord.get('id') == -1) {
            notesNextBtn.disable();
        } else {
            notesNextBtn.enable();
        }
        
        if(Ext.isEmpty(prevRecord)) {
            notesPrevBtn.disable();
        } else {
            notesPrevBtn.enable();
        }
        
    };
    
    function updateJournalReadPanel(record) {
        if(!Ext.isEmpty(record) && record.get('id') > 0) {
            journalFormBase.note = Ext.ModelMgr.create({
                id: parseInt(record.get('id')),
                title: record.get('title'),
                description: record.get('description'),
                posted_at: record.get('posted_at'),
                note_id: parseInt(record.get('note_id')),
                cl_state: record.get('cl_state'),
                client_uid: record.get('client_uid'),
                action: 'edit'},
                'Note');
            
            updateNextPrevBtns();    
            
            var noteItem = copyToNoteObject(journalFormBase.note);
            journalReadPanel.update(noteItem);
            
        }
    };
    
    function showJournalReadPanel(noteItem) {
        Util.logger('In showJournalReadPanel()');
        FlurryPlugin.countPageView();

        if(!Ext.isEmpty(noteItem)) {
            //need to do this as it comes back from the callBack of remoteSyncItem with server exchangeable format
            noteItem.posted_at = Api.parseFromUTCDate(noteItem.posted_at);
            journalReadPanel.update(noteItem);
        }
            
		Util.logger('journalFormBase.note is::', journalFormBase.note);

        refreshJournalsListPanel('');
        notesNavBar.setTitle('Journal');
            
        Ext.apply(journalReadPanel, { showAnimation: { type : 'slide', direction: 'left'} });
            
        notesCancelBtn.hide();
        notesDoneBtn.hide();
        notesAddBtn.hide();
		// notesMoreAddBtn.hide();
        // notesDeleteBtn.hide();
        
        notesBackBtn.show();
        notesEditBtn.show();
        
        journalFormPanel.hide();
        journalsListComp.hide();

        journalReadPanel.show();
        
        updateNextPrevBtns();
        notesNextPrevBar.show();
		notesFormBar.hide();
        BottomTabsInline.getTabBar().hide();
        
    };
    
    function showFreshJournalsListPanel() {
        Util.logger('In showFreshJournalsListPanel()');
        FlurryPlugin.countPageView();
        
        refreshJournalsListPanel('');
        resetJournalFormPanel();

        // notesDeleteBtn.hide();
        notesCancelBtn.hide();
        notesDoneBtn.hide();
        notesBackBtn.hide();
        notesEditBtn.hide();
        
        notesAddBtn.show();
		// notesMoreAddBtn.show();
        
        notesNavBar.setTitle('Journal');
        journalFormPanel.hide();
        journalReadPanel.hide();
        journalsListComp.show();
        
        notesNextPrevBar.hide();
		notesFormBar.hide();
        BottomTabsInline.getTabBar().show();
        
    };
    
    function refreshJournalsListPanel(timeDelay) {
        Util.logger('In refreshJournalsListPanel()');
        
        var notes = [];
        notes = refreshJournalsListData();
        if(notes.length >= 20) {//to avoid putting this item for very few notes
            var loadMoreNote = {id: -1, description: 'Load more Journal posts...'};
            notes.push(loadMoreNote);
        }
        
		//in case data is synced with server and requires update
		if(journalFormBase.note.get('id') == 0) {
			Ext.each(notes, function(item, index, allItems) {
				
				if(item.client_uid == journalFormBase.note.get('client_uid') && item.id != 0) {
					journalFormBase.note = Ext.ModelMgr.create({
					    id: item.id,
					    title: item.title,
					    description: item.description,
					    posted_at: item.posted_at,
						created_at: item.created_at,
					    note_id: item.note_id,
					    cl_state: item.cl_state,
					    client_uid: item.client_uid,
					    action: 'edit'},
					    'Note');
				}				
	        });
			// for(var i=notes.length-1; n=notes[i], i>=0; i--) {
			// }
		}
		
        journalsListComp.getStore().loadData(notes, false);
        // journalsListComp.bindStore(getNotesListStore(notes));
        if(Ext.isEmpty(timeDelay)) {
            // refreshJournalBadgeTextCB();
        } else {
            setTimeout("Util.logger(\'journalsListComp & tabBadge refreshing\'); journalsListComp.refresh();", 1600);
            // refreshJournalBadgeTextCB();
            // setTimeout("Journals.refreshJournalBadgeTextCB()", 1900);
        }
        
        //refreshing for next usage
        // journalFormBase.note = Journals.initializeNoteModel();
    };
    
    function refreshJournalBadgeTextCB() {
        Util.logger('In refreshJournalBadgeTextCB()');
        // BottomTabsInline.getTabBar().items.items[panelIndex.note].setBadge(Util.getBadgeText(allEntities[1])); //note entity
        /*temp code: remove*/// setTimeout(BottomTabsInline.getTabBar().items.items[panelIndex.note].setBadge(Util.getBadgeText(allEntities[1])), 2200);
    };
    
    function refreshJournalsListData() {
        var user_id = Api.getLocalStorageProp('user_id');
        var notes = [], itemKey, value;
        var noteKey = allEntities[1]+'_'+user_id;
        
        for(var i = 0, losLength = localStorage.length; i < losLength; i++) {
            itemKey = localStorage.key(i);
            if(itemKey.indexOf(noteKey) != -1) {
                // Util.logger('after key is: ', itemKey);
                value = Ext.decode(localStorage[itemKey]);
                if(value.cl_state != 'delete') {
                    value.posted_at = Api.parseFromUTCDate(value.posted_at);
                    value.updated_at = Api.parseFromUTCDate(value.updated_at);
                    value.created_at = Api.parseFromUTCDate(value.created_at);
                    notes.push(value);
                }
                // Util.logger('after note['+i+'].id is: '+value.id+'\nnote['+i+'].title is: '+value.title);
            }
        }
        
        return notes;
    };
    
    function onJournalMenuKeyDown() {
        onAndroidButtonHandler();
        onMenuKeyDown();
    };
    
    function onAndroidButtonHandler() {
        Ext.getCmp('journal_postedAt_field').getDatePicker().hide();
        
        Ext.Msg.hide();
        window.KeyBoard.hideKeyBoard();
        
        document.removeEventListener("backbutton", onCancelJournalBtnTap, false);
        document.addEventListener("backbutton", Ext.emptyFn, false);
    };
    
    //__JOURNALS action handlers end============================================================
    
    
}();