Ext.setup({
    
    // KL - Icon setup - has not effect in Phonegap, does if you add to Home Screen as a bookmark
    tabletStartupScreen: 'rsc/phone_startup.svg',
    phoneStartupScreen: 'rsc/phone_startup.svg',
    icon: 'rsc/icon.png',
    glossOnIcon: false,
    
    onReady: function() {
    
        FlurryPlugin.countPageView();
        FlurryPlugin.logEvent("app_started");
        
        var form, loginFormBase;
        BottomTabsInline = '';
        
		/* http://shazronatnitobi.wordpress.com/2011/09/
		// After the deviceready call following if PhoneGap.plist attribute 
		// AutoHideSplashScreen is false
		setTimeout(function() {
		    navigator.splashscreen.hide();
		}, 2000);
		*/
        if(Ext.is.Android)
            document.addEventListener("deviceready", onDeviceReady, false);
        
        // Api.clearLocalStorage();

        Init.initState();
        
        // Ext.EventManager.onWindowResize = function() {};
        
        loginHandlerCB = function(ele, eve) {
            Util.logger('Login button handler called!');
            
            handleLoginSignup(Ext.emptyFn, User.login);
        };
        
        signupHandlerCB = function(ele, eve) {
            Util.logger('Signup button handler called!');
            
            handleLoginSignup(errorsHandlerCB, User.signup);
        };
        
        handleLoginSignup = function(errorsHandlerCB, userCB) {
            Api.clearLocalStorage();
            Init.initState();
            
            var displayPanelCB,
                model = Ext.ModelMgr.create(form.getValues(), 'User'),
                message = "", errors = model.validate();
            
            if(Ext.isEmpty(BottomTabsInline)) {
                displayPanelCB = renderAllWithDataCB;
            } else {
                displayPanelCB = updatePanelWithDataCB;
            }
        
            if(Ext.is.iOS) {
                passwordField2 = Ext.get('loginPasswordField');
                passwordField2.down('input').dom.focus();
                passwordField2.down('input').dom.blur();
            }
                    
            errors = (errorsHandlerCB != Ext.emptyFn) ? errorsHandlerCB(model, errors) : errors;
            /*
            if(model.get('password') != model.get('password2')) {
                var error = {field: 'password2', message: 'Passwords mismatch'};
                errors.add("password2", error);
            }
            */
            if(errors.isValid()) {
                
                if(loginFormBase.user) {
                    form.updateRecord(loginFormBase.user, true);
                }
                Util.logger('username is:', loginFormBase.user.get('username'));
                userCB(loginFormBase.user.get('username'), loginFormBase.user.get('password'), form, displayPanelCB, formFailedCB);
                
                //SIM - forces the soft keyboard to hide for Android devices using Phonegap mechanism 
                //http://wiki.phonegap.com/w/page/27915465/How-to-show-and-hide-soft-keyboard-in-Android
                if(Ext.is.Android)
                    window.KeyBoard.hideKeyBoard();
                
                form.hide();
            } else {
                Ext.each(errors.items, function(rec, i) {
                    message += '<p class="loginErrorMsg">'+rec.message+'</p>';
                });
                Ext.Msg.alert("Oops!", message, Ext.emptyFn);
            }
            return false;
        };
        
        errorsHandlerCB = function(model, errors) {
            if(model.get('password') != model.get('password2')) {
                var error = {field: 'password2', message: 'Passwords mismatch'};
                errors.add("password2", error);
            }
            return errors;
        };
        
        // KL - http://www.sencha.com/forum/showthread.php?112719-Best-practice-for-form-validation&highlight=textfield
        Ext.regModel('User', { 
            fields: [
                {name: 'username', type: 'string'},
                {name: 'password', type: 'string'},
                {name: 'password2', type: 'string'}
            ],
            validations: [
                {type: 'presence', name: 'username', message: "Email is required"},
                {type: 'presence', name: 'password', message: "Password is required"},
                {type: 'format',   name: 'username', matcher: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message:"Wrong Email Format"}
            ]
        });

        registerLoginHandler = function() {
            loginFormBase = User.getLoginFormBase(loginHandlerCB, signupHandlerCB);

            loginFormBase.user = Ext.ModelMgr.create({ username: '', password: ''}, 'User');
        };
        
        requestFailedCB = function(alert, msg) {
            Ext.Msg.alert(alert, msg, Ext.emptyFn);
            // return false;
        };
        
        formFailedCB = function(form, alert, msg) {
            Ext.Msg.alert(alert, msg, Ext.emptyFn);
            form.show();
            return false;
        };
        
        
        // Util.logger('first is:', loginFormBase.user.get('username'));
        // form.loadRecord(loginFormBase.user);

        renderAllComp = function() {
            Util.logger('renderAllComp() called');
            
            var dashboardPanel;
            
            panelIndex = {dash: 0, event: 1, note: 2, todo: 3, settings: 4};
            events = [], tasks = [];
            
            Ext.apply(Ext.util.Format, {
            	defaultDateFormat: 'j-M-Y'
            });
            /*
            http://www.sencha.com/forum/showthread.php?123526-Localization-in-Sench-Touch&highlight=date+day+picker
            if(Ext.util.Format){
                Ext.util.Format.defaultDateFormat = 'm/d/Y'; }
            */
            //__DASHBOARD panels layout start==================================================================================
            var itemsCount = Util.getUnsyncedItemsCount('');
            var syncButtonText = (itemsCount > 0) ? 'Sync ('+itemsCount+')' : 'Sync';
            
            dashboardSyncCompBtn = new Ext.Button(Api.getButtonBase(syncButtonText, false, 'sync_button', performMasterSyncCB));
            dashboardLockCompBtn = new Ext.Button(Api.getButtonBase('Lock', false, 'lock_button', showVerifyPinCB));
            
            if(Ext.isEmpty(Api.getLocalStorageProp('pin_code'))) {
                dashboardLockCompBtn.disable();
            }
            
            dashboardNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'Dashboard',
                items: [dashboardSyncCompBtn, {xtype: 'spacer'}, dashboardLockCompBtn]
            });
            
            dashboardMainPanel = Dashboard.createDashboardMainPanel(onAddEventDashBtnTapCB, onAddJournalDashBtnTapCB, onAddTaskDashBtnTapCB,
                                                                    onEventDashFieldTapCB, onJournalDashFieldTapCB, onTaskDashFieldTapCB);
            
            dashboardPanel = new Ext.Panel({
                title: 'Dashboard',
                id: 'tab'+panelIndex.dash+1,
                cls: 'card' + (panelIndex.dash+1) + ' dashboard_panel',
                iconCls: 'info',
                // layout: 'card',
                items: [ dashboardMainPanel ],
                dockedItems: [ dashboardNavBar ]
            });
            
            //__DASHBOARD panels layout end==================================================================================

            tasksPanel = Tasks.renderTasksPanel();
            
            journalsPanel = Journals.renderJournalsPanel();

            eventsPanel = Events.renderEventsPanel();

            //__SETTINGS panels layout start==================================================================================
            marked_tasks_mover_options = [
                {text: 'Immediate', value: null},
                {text: '1 day',  value: 24+''},
                {text: '2 days', value: 2*24+''},
                {text: '3 days', value: 3*24+''},
                {text: '4 days', value: 4*24+''},
                {text: '5 days', value: 5*24+''}
			];
            
			/*
            settingsTempBtn = new Ext.Button(Api.getButtonBase('NewPage', false, 'settings_button', function() {
				Util.logger('NewPage button tapped');
				Util.logger('window.location is::');
				Util.logger(window.location);
				Util.logger(window.location.href);
				Util.logger(window.location.pathname);
				
				var loc = window.location.href;
				var newLoc = loc.replace("index.html", "index2.html");
				window.location = newLoc;

				/*
				Ext.Ajax.request({
					url: 'html/index2.html',
					method: 'GET',
					callback: function(options, success, response) {
						Util.logger(response.responseText);
					}
				});
				*//*
			}));
			*/
            settingsNavBtn = new Ext.Button(Api.getButtonBase('Back', true, 'settings_button', this.onSettingsBtnTap));
            settingsLogoutBtn = new Ext.Button(Api.getButtonBase('Logout', false, 'logout_button', function() {
                if(Api.isSyncNeeded('')) {
                    Ext.Msg.confirm("Confirmation", "There are unsaved changed that will be lost. Are you sure you want to logout?", function(btn) {
                        if(btn == 'yes') {
                            performMasterSyncCB();
                            onSettingsLogoutBtnTap();
                        }
                    });
                } else {
                    onSettingsLogoutBtnTap();
                }
            }));
            
            settingsNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'Settings',
                items: [settingsNavBtn, /*settingsTempBtn, */{ xtype: 'spacer' }, settingsLogoutBtn]
            });
            
            pinCodeCancelNavBtn = new Ext.Button(Api.getButtonBase('Cancel', false, 'pinCancel_button', this.onPinCancelBtnTap));
            pinCodeResetNavBtn = new Ext.Button(Api.getButtonBase('Forgot?', false, 'pinReset_button', function() { 
                var isSyncNeeded = Api.isSyncNeeded(''),
                    msg = (isSyncNeeded) ? "There are unsaved changed that will be lost. Are you sure you want to login again?" : 
                                            "Are you sure you want to login again?";
                Ext.Msg.confirm("Confirmation", msg, function(btn) {
                    if(btn == 'yes') {
                        if(isSyncNeeded)
                            performMasterSyncCB();
                            
                        onPinResetBtnTap();
                    }
                });
            }));
                        
            verifyPincodeNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'Diary Locked',
                items: [pinCodeResetNavBtn]
            });

            setupPincodeNavBar = new Ext.Toolbar({
                ui: 'dark',
                dock: 'top',
                title: 'Setup Pincode',
                items: [pinCodeCancelNavBtn]
            });

			// Util.logger('\n\nGood uptill here\n\n');
			//List starts
	        Ext.regModel('Feeds', {
	            fields: ['id', 'title', 'is_selected', 'created_at', 'feed_id', 'cl_state', 'client_uid']
	        });
			// var feedsTpl = new Ext.XTemplate('<div class="feed">{title}</div>');
			feeds = Settings.refreshFeedsListData();
			// Util.logger('\n\nStill good uptill here\n\n');
			var listFeeds = Settings.refreshFeedsListData();
			feedsListComp = new Ext.List(Ext.apply(Settings.getFeedsListBase(listFeeds, /*onFeedSelectionChangeCB,*/ onFeedItemtapCB)));

	        //List ends
	        
            var pinCodeTpl 			= Settings.getPincodeTemplate();
            
            verifyPincodePanel 		= Settings.createPincodePanel(pinCodeTpl, onVerifyPinHandlerCB, verifyPincodeNavBar);
            setupPincodePanel 		= Settings.createPincodePanel(pinCodeTpl, onSetupPinHandlerCB, setupPincodeNavBar);
            
            settingsMainPanel 		= Settings.createSettingsMainPanel(marked_tasks_mover_options, showSetupPinCB, onFeedsBtnTap, onHelpBtnTap, 
                                                onAboutBtnTap, onTermsBtnTap, onPrivacyBtnTap, Tasks.refreshTasksTabListPanel);
            settingsFeedsPanel 		= Settings.createSettingsFeedsPanel(feedsListComp);
            settingsHelpPanel 		= Settings.createSettingsHelpPanel();
            settingsAboutPanel 		= Settings.createSettingsAboutPanel();
            settingsTermsPanel 		= Settings.createSettingsTermsPanel();
            settingsPrivacyPanel 	= Settings.createSettingsPrivacyPanel();
            
            settingsPanel = new Ext.Panel({
                title: 'Settings',
                id: 'tab'+panelIndex.settings+1,
                cls: 'card'+(panelIndex.settings+1) + ' settings_panel',
                iconCls: 'settings',
                // layout: 'card',
                // fullscreen: true,
                items: [ settingsFeedsPanel, settingsHelpPanel, settingsMainPanel, settingsAboutPanel, settingsTermsPanel, settingsPrivacyPanel ],
                dockedItems: [settingsNavBar]
            });
            
            //__SETTINGS panels layout end==================================================================================
            
            
            BottomTabsInline = new Ext.TabPanel({
                tabBar: {
                    dock: 'bottom',
                    layout: {
                        pack: 'center'
                    },
                    listeners: {
                        hide: function(comp) {
                            this.up("tabpanel").componentLayout.childrenChanged = true;
                            this.up("tabpanel").doComponentLayout();
                        },
                        show: function(comp) {
                            this.up("tabpanel").componentLayout.childrenChanged = true;
                            this.up("tabpanel").doComponentLayout();
                        },
                        
                    }
                },
                fullscreen: true,
                ui: 'light',
                cardSwitchAnimation: null,

                defaults: {
                    scroll: 'vertical'
                },
                items: [ dashboardPanel, eventsPanel, journalsPanel, tasksPanel, settingsPanel],
                listeners: {
                    cardswitch : function(cont, newCard, oldCard, index, isAnimated) {
                        //change: function(tabBar, tab, card) may also be used
                        // Util.logger("newCard is::", newCard);
                        
                        var newCardTitle = (newCard.title == 'Journal') ? 'journals' : newCard.title.toLowerCase();
                        Util.logger('cardswitch! index is: ', index);
                        FlurryPlugin.logEvent(newCardTitle+'_main_show');
                        FlurryPlugin.countPageView();
                        
                        if(index == panelIndex.dash)
                            refreshDashAndListPanelsCB('', '');
                        else if(index == panelIndex.event)
                            Events.showFreshEventsListPanel();
                        else if(index == panelIndex.note)
                            Journals.showFreshJournalsListPanel();
                        else if(index == panelIndex.todo)
                            Tasks.showFreshTasksListPanel();
                        else if(index == panelIndex.settings) {
                            // bugfix if the user scrolls the static privacy pages and presses the settings button the panel goes blank
                            // this at least navigating back resets this page.
                            // settingsPanel.doLayout();
                            // settingsPanel.doComponentLayout();
                        }
                    }
                }
            });

            Util.logger('>>>>>>>>>>>>>>>>>>>>Finished rendering!<<<<<<<<<<<<<<<<<<<<<<<<<<<');
            BottomTabsInline.show();
            
        }; // renderAllComp
        
        renderAllWithDataCB = function() {
            Util.logger('>>>>>>>>>>>>>>>>>>>>renderAllWithDataCB called!<<<<<<<<<<<<<<<<<<<<<<<<<<<');
            //In case of a fresh login
            if(localStorage['auto_sync_'+Api.getLocalStorageProp('user_id')] === undefined) {
                Init.initState();
                Init.migrateKeys();
				// feeds = Settings.refreshFeedsListData();
            }
            
            renderAllComp();
            
            processPinReset();
            
            performMasterSyncCB();
/*            
			if(Api.getLocalStorageProp('is_msg_displayed') == '0') {
	            Ext.Msg.alert('Welcome to Diary Mobile', 
	                'Access your Diary anywhere,<br/>use your phone or visit www.diary.com<br/>'+
	                'All your sync\'d data is safe<br/>and backed up.<br/>');
				Api.setLocalStorageProp('is_msg_displayed', '1');
			}
*/          
        };
        
        updatePanelWithDataCB = function() {
            Util.logger('>>>>>>>>>>>>>>>>>>>>updatePanelWithDataCB called!<<<<<<<<<<<<<<<<<<<<<<<<<');
            // var user_id = Api.getLocalStorageProp('user_id');
			// Util.logger('user_id is::', user_id);
			// Util.logger('isEmpty is::', Ext.isEmpty(Api.getLocalStorageProp('feed_'+user_id+'[0]')));
			
            Init.initState();
			
            //in case the logout action occurred
            BottomTabsInline.show();
            
            refreshSettingsPanel();

            processPinReset();
            
            performMasterSyncCB();
            
        };

        performMasterSyncCB = function() {
            FlurryPlugin.logEvent('dashboard_main_masterSync');
			syncIndex = 0;
			localIndex = 0;
			syncStart = (new Date()).getTime();
			lastSyncStart = syncStart;
			lastIndexStart = syncStart;
            Util.syncListOfItems(allEntities[0], '', refreshDashAndListPanelsCB, requestFailedCB);
            Util.syncListOfItems(allEntities[1], '', refreshDashAndListPanelsCB, requestFailedCB);
			Util.syncListOfItems('event_all', '', refreshDashAndListPanelsCB, requestFailedCB);
/*
            Util.syncListOfItems(allEntities[2], '', refreshDashAndListPanelsCB, requestFailedCB);
            Util.syncListOfItems(allEntities[3], '', refreshDashAndListPanelsCB, requestFailedCB);
            Util.syncListOfItems(allEntities[4], '', refreshDashAndListPanelsCB, requestFailedCB);
*/

            // Use one of the following line
            // Ext.each(allEntities, function(entity, i, allItems) { Util.syncListOfItems(entity, '', refreshDashAndListPanelsCB, requestFailedCB); });
            // Ext.each(allEntities, function() { Util.syncListOfItems(this, '', refreshDashAndListPanelsCB, requestFailedCB); });
            
        };
        
        processPinReset = function() {
            Util.logger('processPinReset called');
            //If the value set for the user's tmp_pin_code was its own user_id then it needs to work on reseting pin
            if(!Ext.isEmpty(Api.getLocalStorageProp('tmp_pin_code')) && 
                Api.getLocalStorageProp('tmp_pin_code') == Api.getLocalStorageProp('user_id')) {
                FlurryPlugin.logEvent('setupPin_main_show');
                FlurryPlugin.countPageView();

                Api.setLocalStorageProp('tmp_pin_code', '');
                
                BottomTabsInline.setActiveItem(settingsPanel);
                
                showSetupPinCB(Ext.getCmp('pinCodeField').getValue());
                // showSetupPinCB(1);
            }
            
        };
        
        showVerifyPinCB = function() {
            Util.logger('Verify Pin code button tapped');
            FlurryPlugin.logEvent('verifyPin_main_show');
            FlurryPlugin.countPageView();

            if(!Ext.isEmpty(Api.getLocalStorageProp('pin_code')) && !Ext.isEmpty(Api.getLocalStorageProp('account_key'))) {

                if(Ext.is.Android) {
                    Util.logger('Updating the menubutton handler');
                    
                    // document.removeEventListener("backbutton", Ext.emptyFn, false);
                    // document.addEventListener("backbutton", Ext.emptyFn, false);
                    document.removeEventListener("menubutton", onMenuKeyDown, false);
                    document.addEventListener("menubutton", Ext.emptyFn, false);
                }

                var pinItem = new Object();
                pinItem.mainMsg = "Enter Your Pincode";
                // pinItem.dotClass1 = "empty";
                pinItem = Util.getEmptyPinDots(pinItem, true);
            
                // pinItem.loginVal = "Login";
                pinItem.loginVal = "";
                
                verifyPincodePanel.update(pinItem);
                
                BottomTabsInline.hide();
                verifyPincodePanel.show();
            }
        };
        
        showSetupPinCB = function(newVal) {
            Util.logger('Setup Pin code button tapped');
            FlurryPlugin.logEvent('setupPin_main_show');
            FlurryPlugin.countPageView();
            
            var pinItem = new Object();
            
            if(Ext.is.Android) {
                document.removeEventListener("backbutton", Ext.emptyFn, false);
                document.addEventListener("backbutton", onPinCancelBtnTap, false);
                document.removeEventListener("menubutton", onMenuKeyDown, false);
                document.addEventListener("menubutton", onPinCancelBtnTap, false);
            }
            
            pinItem.mainMsg = "Set Your Pincode";
            // pinItem.dotClass1 = "empty";
            pinItem = Util.getEmptyPinDots(pinItem, true);
            
            pinItem.loginVal = "";
            
            if(newVal == 0) {
                Api.setLocalStorageProp('pin_code', '');
                dashboardLockCompBtn.disable();
            } else {
                setupPincodePanel.update(pinItem);
                pinCodeCancelNavBtn.show();
            
                BottomTabsInline.hide();
                setupPincodePanel.show();
            }
        };

        /*
        Android.backButtonHandler = function() {
            // Check whether our internal view stack is on main screen
             if( Application.ViewStack.stack.length == 1) {
                 // Exit the application
                 // BackButton.exitApp();
                 device.exitApp();
             } else {
                 // Navigate back to the previous view
                 Application.ViewStack.pop();
             }
         };
         */
         
         // Call onDeviceReady when PhoneGap is loaded.
         //
         // At this point, the document has loaded but phonegap.js has not.
         // When PhoneGap is loaded and talking with the native device,
         // it will call the event `deviceready`.
         // 
         // PhoneGap is loaded and it is now safe to make calls PhoneGap methods
         //
         function onDeviceReady() {
             Util.logger('\n\n=========>>>>>>>>>>>>onDeviceReady called<<<<<<<<<<===========\n\n');
            // Register the event listener
            if(Ext.is.Android) {
                // document.addEventListener("backbutton", onBackKeyDown, false);
                document.addEventListener("menubutton", onMenuKeyDown, false);
                // document.addEventListener("homebutton", onHomeKeyDown, false);
                document.addEventListener("backbutton", Ext.emptyFn, false);
            }
            /*
            document.addEventListener('appActive', function () { 
                console.log('=========>>>>>>>>>>>>app is now active<<<<<<<<<<===========\n\n\n\n\n\n'); 
            }, false);
            */
            // document.addEventListener("resume", onResume, false);
             
         };

         appActive = function() {
             Util.logger('\n\n=========>>>>>>>>>>>>app is now active in function<<<<<<<<<<===========\n\n'); 
             showVerifyPinCB();
         };
         
         /*
         function onResume() {
             Util.logger('=========>>>>>>>>>>>>app is now active in function onResume<<<<<<<<<<===========\n\n\n');
         };
         */
         function onMenuKeyDown() {
             Util.logger('Menu key pressed');

             BottomTabsInline.setActiveItem(settingsPanel);
             BottomTabsInline.getTabBar().show();
         };
         
        //__DASHBOARD action handlers start============================================================
        
        onAddEventDashBtnTapCB = function() {
            Util.logger('In onAddEventDashBtnTapCB()');
            FlurryPlugin.logEvent('dashboard_main_addEvent');

            BottomTabsInline.setActiveItem(eventsPanel);
            Events.onAddEventBtnTap();

        };
        
        onAddJournalDashBtnTapCB = function() {
            Util.logger('In onAddJournalDashBtnTapCB()');
            FlurryPlugin.logEvent('dashboard_main_addNote');
            
            BottomTabsInline.setActiveItem(journalsPanel);
            Journals.onAddJournalBtnTap();
            
        };
        
        onAddTaskDashBtnTapCB = function() {
            Util.logger('In onAddTaskDashBtnTapCB()');
            FlurryPlugin.logEvent('dashboard_main_addTodo');
            
            BottomTabsInline.setActiveItem(tasksPanel);
            Tasks.onAddTaskBtnTap();
            
        };
        
        onEventDashFieldTapCB = function() {
            Util.logger('In onEventDashFieldTapCB()');
            FlurryPlugin.logEvent('dashboard_main_eventsList');
            
            BottomTabsInline.setActiveItem(eventsPanel);
            Events.showFreshEventsListPanel();
        };
        
        onJournalDashFieldTapCB = function() {
            Util.logger('In onJournalDashFieldTapCB()');
            FlurryPlugin.logEvent('dashboard_main_notesList');
            
            BottomTabsInline.setActiveItem(journalsPanel);
            Journals.showFreshJournalsListPanel();
        };
        
        onTaskDashFieldTapCB = function() {
            Util.logger('In onTaskDashFieldTapCB()');
            FlurryPlugin.logEvent('dashboard_main_todosList');
            
            BottomTabsInline.setActiveItem(tasksPanel);
            Tasks.showFreshTasksListPanel();            
        };
        
        refreshDashAndListPanelsCB = function(entity, timeDelay) {
            Util.logger('In refreshDashAndListPanelsCB()');
            Util.logger('entity is: ', entity);
            Util.logger('TimeDelay is: ', timeDelay);
            
            refreshDashboardPanel(timeDelay);
            
            if(entity == allEntities[0])
                tasks = Tasks.refreshTasksTabListPanel(timeDelay);
            else if(entity == allEntities[1])
                Journals.refreshJournalsListPanel(timeDelay);
            else if(eventsEntities.indexOf(entity) != -1 || entity == 'event_all')
                events = Events.refreshEventsListPanel(timeDelay);
            else {
                tasks = Tasks.refreshTasksTabListPanel(timeDelay);
                Journals.refreshJournalsListPanel(timeDelay);
                events = Events.refreshEventsListPanel(timeDelay);
            }
            
            if(entity != allEntities[1]) {
                setupReminderLocalNotifications(events, tasks);
            }
			indexStop = (new Date()).getTime();
			Util.logger('\n\n\n====>The '+(++localIndex)+'th '+entity+' indexing took absolute time::'+ (indexStop-syncStart));
			Util.logger('\nThe '+(localIndex)+'th indexing took relative to last time::'+ (indexStop-lastIndexStart));
			Util.logger('\nThe '+(localIndex)+'th indexing took relative to sync time::'+ (indexStop-lastSyncStart));
			lastIndexStart = indexStop;

        };
        
/*
        refreshDashAndBadgesCB = function(entity, timeDelay) {
            Util.logger('In refreshDashAndBadgesCB()');
            Util.logger('entity is: ', entity);
            Util.logger('TimeDelay is: ', timeDelay);
            
            refreshDashboardPanel(timeDelay);
            
            if(entity == allEntities[0])
                Tasks.refreshTaskBadgeTextCB(timeDelay);
            else if(entity == allEntities[1])
                Journals.refreshJournalBadgeTextCB(timeDelay);
            else if(eventsEntities.indexOf(entity) != -1)
                Events.refreshEventBadgeTextCB(timeDelay);
            else {
                Tasks.refreshTaskBadgeTextCB(timeDelay);
                Journals.refreshJournalBadgeTextCB(timeDelay);
                Events.refreshEventBadgeTextCB(timeDelay);
             }
        };
*/
        refreshDashboardPanel = function(timeDelay) {
            Util.logger('In refreshDashboardPanel()');
            Util.logger('TimeDelay is: ', timeDelay);
            
            var itemsCount = Util.getUnsyncedItemsCount('');
            var syncButtonText = (itemsCount > 0) ? 'Sync ('+itemsCount+')' : 'Sync';
            
            dashboardMainPanel.setValues({unsync_count: Util.getUnsyncedItemsCount().toString(), 
                last_sync_timestamp: Util.getLastSyncTimestamp().format('D j-M-Y H:i:s'), 
                tasks_count: Util.getItemsSize(allEntities[0]).toString(), journals_count: Util.getItemsSize(allEntities[1]).toString(), 
                events_count: Util.getItemsSize('event_all').toString()});
            
            if(!Ext.isEmpty(Api.getLocalStorageProp('pin_code'))) {
                dashboardLockCompBtn.enable();
            } else {
                dashboardLockCompBtn.disable();
            }
            
            Util.logger('SyncButton text is::', syncButtonText);
            if(Ext.isEmpty(timeDelay)) {
                dashboardSyncCompBtn.setText(syncButtonText);
                setTimeout('dashboardSyncCompBtn.doComponentLayout();', 700);
            } else {
                setTimeout('dashboardSyncCompBtn.setText(\''+syncButtonText+'\');', 1000);
                setTimeout('dashboardSyncCompBtn.doComponentLayout();', 1500);
            }
        };
        
        refreshSettingsPanel = function() {
            Util.logger('In refreshSettingsPanel()');

            if(Ext.is.Android) {
                if(!Ext.isEmpty(Api.getLocalStorageProp('tmp_pin_code')) && 
                    Api.getLocalStorageProp('tmp_pin_code') == Api.getLocalStorageProp('user_id') && 
                    Ext.isEmpty(Api.getLocalStorageProp('pin_code'))) {
                    Api.setLocalStorageProp('pin_code', 'ABCD');
                }
            }
            
            feeds = Settings.refreshFeedsListData();
			
            settingsMainPanel.setValues({tasks_mover_delay: Api.getLocalStorageProp('tasks_mover_delay'), 
                daily_notif_time: Api.getLocalStorageProp('daily_notif_time'), pin_code: (Ext.isEmpty(Api.getLocalStorageProp('pin_code')) ? 0 : 1),
                auto_sync: Api.getLocalStorageProp('auto_sync'), auto_login: Api.getLocalStorageProp('auto_login')});
            
            if(Ext.is.Android) {
                // if(Ext.isEmpty(Api.getLocalStorageProp('tmp_pin_code')) || 
                //     Api.getLocalStorageProp('tmp_pin_code') != Api.getLocalStorageProp('user_id')) {
                    setupPincodePanel.hide();
                    BottomTabsInline.show();
                // }
            }
            
            Util.logger('Finished refreshSettingsPanel()');
                // settingsMainPanel.refresh();
                // settingsPanel.doComponentLayout();
            
        };
        
        setupReminderLocalNotifications = function(events, tasks) {
            var summaryEvents = {}, summaryTasks = {}, summaryKey, prevKey = '', sortedTasksKeys, sortedEventsKeys, tasksFound = false, 
                taskDueDate, nowFormatted, overDueTasksCount = 0, pastOverDueTasksCount = 0, summaryDateCounts = [], summaryCounts = {};
            nowFormatted = new Date().format('Y-m-d');
            
            if(!Ext.isEmpty(events) && Api.isEventsCurrentWindow())
                summaryEvents = Events.setEventReminderLocalNotifications(events);
                
            Util.logger('associative array events::', summaryEvents);
            if(!Ext.isEmpty(tasks)) {
                
                tasks = tasks.sort(function(a,b) {
                    return (a.get('due_at') > b.get('due_at') ? 1 : -1)
                });
                
                Util.logger('sorted tasks array is:', tasks);
                summaryCounts = {};
                overDueTasksCount = 0;
                pastOverDueTasksCount = 0;
                overDueTasksCount = Util.getOverdueTasks(tasks, false);
                pastOverDueTasksCount = overDueTasksCount;
                for(var i = 0, maxCount = 0, ln = tasks.length; i < ln && maxCount < 5; i++) {
                    taskDueDate = tasks[i].get('due_at');
                    if(!Ext.isEmpty(taskDueDate)) {
                        summaryKey = taskDueDate.format('Y-m-d');
                        //since it is a sorted associative array
                        if(summaryKey < nowFormatted) {
                            continue;
                            // overDueTasksCount++;
                            // pastOverDueTasksCount++;
                        } else {
                            if(!Ext.isEmpty(summaryCounts[summaryKey])) {
                                summaryCounts[summaryKey].due++;
                            } else {
                                overDueTasksCount += (Ext.isEmpty(summaryCounts[prevKey])) ? 0 : summaryCounts[prevKey].due;
                                summaryCounts[summaryKey] = {overdue: overDueTasksCount, due: 1, events: 0};
                                maxCount++;
                            }
                            prevKey = summaryKey;
                        }
                    }
                }
            }

            if(!Ext.isEmpty(summaryEvents)) {
                sortedTasksKeys = Util.getArrayKeys(summaryCounts);
                sortedEventsKeys = Util.getArrayKeys(summaryEvents);
                tasksFound = false;
                sortedEventsKeys = sortedEventsKeys.sort(function(a,b) {
                    return (a > b ? 1 : -1);
                });
            
                var dateComparator = new Date(), maxCount, dateCompFormatted = dateComparator.format('Y-m-d'),
                    lastTaskKey = Ext.isEmpty(sortedTasksKeys[sortedTasksKeys.length-1]) ? dateCompFormatted : sortedTasksKeys[sortedTasksKeys.length-1],
                    lastEventKey = Ext.isEmpty(sortedEventsKeys[sortedEventsKeys.length-1]) ? dateCompFormatted : sortedEventsKeys[sortedEventsKeys.length-1];
                Util.logger('lastTaskKey is::', lastTaskKey);
                Util.logger('lastEventKey is::', lastEventKey);
                for(var i = 0, maxCount = 0, tasksFound = false, overDueTasksCount = pastOverDueTasksCount; 
                    maxCount < 5 && (dateCompFormatted <= lastEventKey || dateCompFormatted <= lastTaskKey || overDueTasksCount > 0); 
                    i++, dateComparator = dateComparator.add(Date.DAY, 1), dateCompFormatted = dateComparator.format('Y-m-d')) {
                    Util.logger('count loop is:', i);
                    Util.logger('date is::', dateCompFormatted);
                    if(!Ext.isEmpty(summaryCounts[dateCompFormatted])) {
                        if(!tasksFound)
                            overDueTasksCount = summaryCounts[dateCompFormatted].overdue + summaryCounts[dateCompFormatted].due;
                        else
                            overDueTasksCount += summaryCounts[dateCompFormatted].due;
                        tasksFound = true;
                        if(!Ext.isEmpty(summaryEvents[dateCompFormatted])) {
                            Util.logger('appending event to big thing:', dateCompFormatted);
                            summaryCounts[dateCompFormatted].events = summaryEvents[dateCompFormatted];
                        }
                        maxCount++;
                    } else {
                        if(!Ext.isEmpty(summaryEvents[dateCompFormatted])) {
                            Util.logger('adding only event to big thing:', dateCompFormatted);
                        
                            summaryCounts[dateCompFormatted] = {overdue : overDueTasksCount, due: 0, events: summaryEvents[dateCompFormatted]};
                            maxCount++;
                        } else {
                            if(overDueTasksCount > 0) {
                                Util.logger('adding only overdue to big thing:', dateCompFormatted);
                                summaryCounts[dateCompFormatted] = {overdue : overDueTasksCount, due: 0, events: 0};
                                maxCount++;
                            }
                        }
                    }
                }
            }
/*
            for(var key in summaryCounts) {
                Util.logger('summaryCounts key is::', key);
                Util.logger('value is', summaryCounts[key]);
            }
*/
            summaryCounts = Util.sortAssociativeArray(summaryCounts, function(a,b) {
                return (a > b ? 1 : -1);
            });
            
            var ind = 0, notifTitle = '', overdueCount, dueCount, eventsCount, notifDate, dailyNotifTime, totalCount;
            dailyNotifTime = Api.getLocalStorageProp('daily_notif_time').split(':');
            for(var key in summaryCounts) {
                if(ind >= 5)
                    break;
                    
                notifTitle = '';
                overdueCount = summaryCounts[key].overdue;
                dueCount = summaryCounts[key].due;
                eventsCount = summaryCounts[key].events;
                totalCount = overdueCount + dueCount + eventsCount;
                
                notifTitle = (overdueCount <= 0) ? '' : (overdueCount > 1) ? overdueCount+' overdue Tasks' : overdueCount+' overdue Task';
                notifTitle += (overdueCount > 0 && dueCount > 0) ? ', ' : '';
                notifTitle += (dueCount <= 0) ? '' : (dueCount > 1) ? dueCount+' due Tasks' : dueCount+' due Task';
                notifTitle += ((overdueCount > 0 || dueCount > 0) && eventsCount > 0) ? ', ' : '';
                notifTitle += (eventsCount <= 0) ? '' : (eventsCount > 1) ? eventsCount+' Events' : eventsCount+' Event';
                    
                notifDate = Date.parseDate(key, "Y-m-d").add(Date.HOUR, dailyNotifTime[0]).add(Date.MINUTE, dailyNotifTime[1]).format("m/d/Y h:i A");
                Util.logger('notifier date is::', notifDate);
                Util.logger('notifier title is::', notifTitle);
                Util.logger('notifier badge is::', totalCount);
                
                ind++;
                LocalNotificationPlugin.add(notifDate, notifTitle, totalCount, 'summary_reminder_'+ind);
            }
            
        };

        //__DASHBOARD action handlers end============================================================
        
        //__PINCODE action handlers start============================================================
/*
        onVerifyPinBackBtnTap = function() {
            Util.logger('onVerifyPinBackBtnTap called!');
            
        };
        
        onSetupPinBackBtnTap = function() {
            Util.logger('onSetupPinBackBtnTap called!');
            
        };
*/        
        onSetupPinHandlerCB = function(eve, ele) {
            Util.logger('<<<<<<<<>>>>>>>>>>Tapped for onSetupPinHandlerCB<<<<<<<<>>>>>>>>>>');

            Util.setupPincode(eve.target.innerText, setupPincodePanel, true);
            if(!Ext.isEmpty(Api.getLocalStorageProp('tmp_pin_code')) && 
                Api.getLocalStorageProp('tmp_pin_code') == Api.getLocalStorageProp('tmp_pin_code2')) {

                setTimeout(function() {
                    setupPincodePanel.hide();
                    BottomTabsInline.show();
                }, 500);

                // Api.setLocalStorageProp('ver_pin_code', '');
                dashboardLockCompBtn.enable();
                
                Api.setLocalStorageProp('tmp_pin_code', '');
                Api.setLocalStorageProp('tmp_pin_code2', '');

                if(Ext.is.Android) {
                    Util.logger('Updating the menubutton handler');

                    document.removeEventListener("backbutton", onPinCancelBtnTap, false);
                    document.addEventListener("backbutton", Ext.emptyFn, false);
                    document.removeEventListener("menubutton", onPinCancelBtnTap, false);
                    document.addEventListener("menubutton", onMenuKeyDown, false);
                }
            }
        };
        
        onVerifyPinHandlerCB = function(eve, ele) {
            Util.logger('<<<<<<<<>>>>>>>>>>Tapped for onVerifyPinHandlerCB<<<<<<<<>>>>>>>>>>');
            var numEntered = eve.target.innerText;

            Util.verifyPincode(numEntered, verifyPincodePanel);
            if(Api.getLocalStorageProp('pin_code') == Api.getLocalStorageProp('tmp_pin_code')) {
                Api.setLocalStorageProp('tmp_pin_code', '');
            
                setTimeout(function() {
                    verifyPincodePanel.hide();
                    BottomTabsInline.show();
                }, 500);

                if(Ext.is.Android) {
                    Util.logger('Re-adding the menubutton handler');
                    // document.removeEventListener("backbutton", Ext.emptyFn, false);
                    // document.addEventListener("backbutton", Ext.emptyFn, false);
                    document.removeEventListener("menubutton", Ext.emptyFn, false);
                    document.addEventListener("menubutton", onMenuKeyDown, false);
                }
            }
            
        };
        

        onPinCancelBtnTap = function() {
            Util.logger('onPinCancelBtnTap called');
            FlurryPlugin.logEvent('settings_main_show');
            FlurryPlugin.countPageView();
            
            if(Ext.is.Android) {
                Util.logger('Updating the menubutton handler');
                
                document.removeEventListener("backbutton", onPinCancelBtnTap, false);
                document.addEventListener("backbutton", Ext.emptyFn, false);
                document.removeEventListener("menubutton", onPinCancelBtnTap, false);
                document.addEventListener("menubutton", onMenuKeyDown, false);
            }
            
            Api.setLocalStorageProp('pin_code', '');
            Api.setLocalStorageProp('tmp_pin_code', '');
            Api.setLocalStorageProp('tmp_pin_code2', '');
            
            Ext.getCmp('pinCodeField').setValue(0);
            
            setupPincodePanel.hide();
            BottomTabsInline.show();
            
        };
        
        onPinResetBtnTap = function() {
            Util.logger('onPinResetBtnTap called!');
            FlurryPlugin.logEvent('login_form_show');
            FlurryPlugin.countPageView();
                        
            verifyPincodePanel.hide();
            Api.setLocalStorageProp('pin_code', '');
            Api.setLocalStorageProp('tmp_pin_code', Api.getLocalStorageProp('user_id'));
            Api.setLocalStorageProp('account_key', '');
            
            if(form === undefined) {
                /*
                loginFormBase = null;
                loginFormBase = User.getLoginFormBase(loginHandlerCB, signupHandlerCB);

                loginFormBase.user = Ext.ModelMgr.create({ username: '', password: ''}, 'User');
                */
                form = new Ext.form.FormPanel(loginFormBase);
            } else {
                Ext.getCmp('loginPasswordField2').hide();
                Ext.getCmp('signupButton').hide();
                Ext.getCmp('cancelButton').hide();
                Ext.getCmp('loginButton').show();
                Ext.getCmp('newuserButton').show();
            }
            form.reset();
            form.show();
            
        };
        
        //__PINCODE action handlers end============================================================

        //__SETTINGS action handlers start============================================================

 	    showSettingsScreen = function() {
			Util.logger('In showSettingsScreen');
		   	if(Ext.is.Android) {
               	document.removeEventListener("backbutton", onSettingsBtnTap, false);
               	document.addEventListener("backbutton", Ext.emptyFn, false);
               	document.removeEventListener("menubutton", onSettingsBtnTap, false);
               	document.addEventListener("menubutton", onMenuKeyDown, false);
           	}

           	settingsNavBtn.hide();
			feedsListComp.hide();
			settingsFeedsPanel.hide();
           	settingsHelpPanel.hide();
           	settingsAboutPanel.hide();
           	settingsTermsPanel.hide();
           	settingsPrivacyPanel.hide();
           	settingsMainPanel.show();

           	BottomTabsInline.getTabBar().show();
           	// BottomTabsInline.getComponent(4).scroller.scrollTo({ x: 0, y: 0 });
        
		};

        onSettingsLogoutBtnTap = function() {
            FlurryPlugin.logEvent('login_form_show');
            FlurryPlugin.countPageView();
        
            Api.setLocalStorageProp('account_key', '');
        
            BottomTabsInline.hide();
            if(form === undefined) {
                form = new Ext.form.FormPanel(loginFormBase);
            } else {
                Ext.getCmp('loginPasswordField2').hide();
                Ext.getCmp('signupButton').hide();
                Ext.getCmp('cancelButton').hide();
                Ext.getCmp('loginButton').show();
                Ext.getCmp('newuserButton').show();
            }
            form.reset();
            form.show();
        };
        
        onSettingsBtnTap = function() {
            FlurryPlugin.logEvent('settings_main_show');
            FlurryPlugin.countPageView();
			var feedKey, feedVal;

			if(!settingsFeedsPanel.isHidden()) {
				var user_id = Api.getLocalStorageProp('user_id');
				Ext.Msg.alert("Calendar Sync", "Thanks for your interest in Diary.com Calendar Sync. We will update you when its ready.", 
				// Ext.emptyFn
				function() { 
					Ext.each(feeds, function(feed, i, allItems) { 
						feedKey = 'feed_'+user_id+'['+(feed.feed_id-1)+']';
						feedVal = Ext.decode(Api.getLocalStorageProp(feedKey));
												
						if(feed.is_selected && !feedVal.is_selected)
							FlurryPlugin.logEvent('settings_feed__'+feed.title.split(' ').join('_'));
							
						feed.updated_at = Api.formatToUTCDate(new Date());
						feed.cl_state = 'update';
						Api.setLocalStorageProp(feedKey, Ext.encode(feed));
					});
						
					showSettingsScreen(); 
				});
			} else
				showSettingsScreen();
				
        };
        
		onFeedsBtnTap = function() {
            Util.logger('onFeedsBtnTap called!');
            FlurryPlugin.logEvent('settings_main_feeds');
            FlurryPlugin.countPageView();
			
			var listData = feedsListComp.store.data.items;
			Ext.each(listData, function(item, i, allItems) {
				Ext.each(feeds, function(feed, j, allFeedItems) { 
					if(item.get('feed_id') == feed.feed_id) {
/*
						if(feed.is_selected)
							feedsListComp.select(i, true, false);
						else
							feedsListComp.deselect(i, false);
*/
						if(feed.is_selected)
							feedsListComp.getSelectionModel().select(i, true, false);
						else							
							feedsListComp.deselect(i, false);
							// feedsListComp.getSelectionModel().deselect(i, false);
					}
				});
			});
				
            if(Ext.is.Android) {
                document.removeEventListener("backbutton", Ext.emptyFn, false);
                document.addEventListener("backbutton", onSettingsBtnTap, false);
                document.removeEventListener("menubutton", onMenuKeyDown, false);
                document.addEventListener("menubutton", onSettingsBtnTap, false);
            }
            
            settingsNavBtn.show();
            settingsMainPanel.hide();
            BottomTabsInline.getTabBar().hide();
            
			feedsListComp.show();
            settingsFeedsPanel.show();
		};
		
        onHelpBtnTap = function() {
            Util.logger('onHelpBtnTap called!');
            FlurryPlugin.logEvent('settings_main_help');
            FlurryPlugin.countPageView();
            
            if(Ext.is.Android) {
                document.removeEventListener("backbutton", Ext.emptyFn, false);
                document.addEventListener("backbutton", onSettingsBtnTap, false);
                document.removeEventListener("menubutton", onMenuKeyDown, false);
                document.addEventListener("menubutton", onSettingsBtnTap, false);
            }
            
            settingsNavBtn.show();
            settingsMainPanel.hide();
            BottomTabsInline.getTabBar().hide();
            
            settingsHelpPanel.show();
        };

        onAboutBtnTap = function() {
            Util.logger('onAboutBtnTap called!');
            FlurryPlugin.logEvent('settings_main_about');
            FlurryPlugin.countPageView();
            
            if(Ext.is.Android) {
                document.removeEventListener("backbutton", Ext.emptyFn, false);
                document.addEventListener("backbutton", onSettingsBtnTap, false);
                document.removeEventListener("menubutton", onMenuKeyDown, false);
                document.addEventListener("menubutton", onSettingsBtnTap, false);
            }

            settingsNavBtn.show();
            settingsMainPanel.hide();
            BottomTabsInline.getTabBar().hide();
            
            settingsAboutPanel.show();
        };
        
        onTermsBtnTap = function() {
            Util.logger('onTermsBtnTap called!');
            FlurryPlugin.logEvent('settings_main_terms');
            FlurryPlugin.countPageView();
            
            if(Ext.is.Android) {
                document.removeEventListener("backbutton", Ext.emptyFn, false);
                document.addEventListener("backbutton", onSettingsBtnTap, false);
                document.removeEventListener("menubutton", onMenuKeyDown, false);
                document.addEventListener("menubutton", onSettingsBtnTap, false);
            }

            settingsNavBtn.show();
            settingsMainPanel.hide();
            BottomTabsInline.getTabBar().hide();
            
            settingsTermsPanel.show();
        };
        
        onPrivacyBtnTap = function() {
            Util.logger('onPrivacyBtnTap called!');
            FlurryPlugin.logEvent('settings_main_privacy');
            FlurryPlugin.countPageView();
            
            if(Ext.is.Android) {
                document.removeEventListener("backbutton", Ext.emptyFn, false);
                document.addEventListener("backbutton", onSettingsBtnTap, false);
                document.removeEventListener("menubutton", onMenuKeyDown, false);
                document.addEventListener("menubutton", onSettingsBtnTap, false);
            }

            settingsNavBtn.show();
            settingsMainPanel.hide();
            BottomTabsInline.getTabBar().hide();
            
            settingsPrivacyPanel.show();
        };
/*
		onFeedSelectionChangeCB = function(selModel, records) {
		    Util.logger('In onFeedSelectionChangeCB()');
			
	        // FlurryPlugin.logEvent('feeds_read_show');
	        // FlurryPlugin.countPageView();
			Util.logger('selModel is:', selModel);
			Util.logger('records are:');
			Util.logger(records);
			
		};
*/		
		onFeedItemtapCB = function(dataview, index, item, eve) {
		    Util.logger('In onFeedItemtapCB()');
		    var record = dataview.store.getAt(index);
		    var feed_id = record.get('feed_id');
			
			Ext.each(feeds, function(feed, i, allItems) {
				if(feed.feed_id == feed_id) {
					feed.is_selected = (feed.is_selected) ? false : true;
					feed.cl_state = 'update';
					// feed.is_selected = Ext.util.Format.toggle(feed.is_selected, true, false);
				}
			});

	        FlurryPlugin.logEvent('feeds_itemtap_show');
	        // FlurryPlugin.countPageView();
       
	        if(Ext.is.Android) {
	            document.removeEventListener("backbutton", Ext.emptyFn, false);
	            document.addEventListener("backbutton", onBackJournalBtnTap, false);
	        }
	     
		};

        //__SETTINGS action handlers end============================================================
        
        //this method saves the data item first and then attempts to sync other diary items
        saveAllData = function(activeEntity, activeItem, index, current_state, action) {
            Util.logger('saveAllData called!');

            var inactiveEventsEntities = eventsEntities.slice(0);
            // events = [], tasks = [];
            //if activeEntity is one of the eventsEntities
            if(eventsEntities.indexOf(activeEntity) != -1) {
                var eventCallBack = Events.showEventReadPanel;
                if(action == 'delete')
                    eventCallBack = Events.showFreshEventsListPanel;
                
				Events.saveEvent(activeItem, index, current_state, action, eventCallBack, refreshDashAndListPanelsCB, requestFailedCB);

                // Util.syncListOfItems('todo', refreshTasksTabListPanel);
                Util.syncOnlyItems(allEntities[0], Tasks.refreshTasksTabListPanel/*refreshTaskBadgeTextCB*/, requestFailedCB);
                Util.syncOnlyItems(allEntities[1], Journals.refreshJournalBadgeTextCB, requestFailedCB);
                
                // inactiveEventsEntities.remove(activeEntity);
                // Ext.each(inactiveEventsEntities, function(item, i, allItems) { Util.syncOnlyItems(item, refreshDashAndListPanelsCB, requestFailedCB); });
            }
            else if(activeEntity == allEntities[0]) {
                Tasks.saveTodo(activeItem, index, current_state, action, Tasks.showFreshTasksListPanel, refreshDashAndListPanelsCB, requestFailedCB);

                if(action != 'toggle') {
                    Util.syncOnlyItems(allEntities[1], Journals.refreshJournalBadgeTextCB, requestFailedCB);
					Util.syncOnlyItems('event_all', Events.refreshEventBadgeTextCB, requestFailedCB);
                    // Ext.each(eventsEntities, function(item, i, allItems) { Util.syncOnlyItems(item, Events.refreshEventBadgeTextCB, requestFailedCB); });
                }
            }
            else if(activeEntity == allEntities[1]) {
                var journalCallBack = Journals.showJournalReadPanel;
                if(action == 'delete')
                    journalCallBack = Journals.showFreshJournalsListPanel;

                Journals.saveNote(activeItem, index, current_state, action, journalCallBack, refreshDashAndListPanelsCB, requestFailedCB);

                Util.syncOnlyItems(allEntities[0], Tasks.refreshTasksTabListPanel/*refreshTaskBadgeTextCB*/, requestFailedCB);
				Util.syncOnlyItems('event_all', Events.refreshEventBadgeTextCB, requestFailedCB);
                // Ext.each(eventsEntities, function(item, i, allItems) { Util.syncOnlyItems(item, Events.refreshEventBadgeTextCB, requestFailedCB); });
            }
        };
        
        registerLoginHandler();

        if(Ext.isEmpty(Api.getLocalStorageProp('account_key')) || Api.getLocalStorageProp('auto_login') == 0) {
            FlurryPlugin.logTimedEvent('login_form_show');
            FlurryPlugin.countPageView();
            
            form = new Ext.form.FormPanel(loginFormBase);
            form.show();
        } else {
				
            renderAllWithDataCB();
			showVerifyPinCB();
        }
        
    }
});
