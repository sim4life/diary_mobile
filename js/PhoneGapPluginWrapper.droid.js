var FlurryPlugin = {
    countPageView: function() {
        if(window.plugins) {
            window.plugins.flurry.countPageView();
        } else {
            console.log("[PhoneGapPlugin] PhoneGap environment not available for Flurry");
        }
    },
    
    logEvent: function(eventName) {
        if(window.plugins) {
            window.plugins.flurry.logEvent(eventName);
        } else {
            console.log("[PhoneGapPlugin] PhoneGap environment not available for Flurry");
        }
    },
    
    setUserID: function(userID) {
        if(window.plugins) {
            // window.plugins.flurry.setUserID(userID);
        } else {
            console.log("[PhoneGapPlugin] PhoneGap environment not available for Flurry");
        }
    },
    
    logTimedEvent: function(eventName) {
        if(window.plugins) {
            // window.plugins.flurry.logTimedEvent(eventName);
        } else {
            console.log("[PhoneGapPlugin] PhoneGap environment not available for Flurry");
        }
    },
    
    endTimedEvent: function(eventName) {
        if(window.plugins) {
            // window.plugins.flurry.endTimedEvent(eventName);
        } else {
            console.log("[PhoneGapPlugin] PhoneGap environment not available for Flurry");
        }
    }
}

var LocalNotificationPlugin = {
    setBadge: function(num) {
        if(window.plugins) {
            // window.plugins.badge.set(num);
        } else {
            console.log("[PhoneGapPlugin] PhoneGap environment not available for LocalNotifications");
        }
    },
    
    add: function(datetime, msg, badge, id) {
        if(window.plugins) {
/*
            window.plugins.localNotification.add({
                date: datetime, // '02/08/2011 4:32 PM' => MM/DD/YYYY TIME
                message: msg,
                badge: badge,
                id: id
            });
*/
        } else {
            console.log("[PhoneGapPlugin] PhoneGap environment not available for LocalNotifications");
        }
    },
    
    cancel: function(id) {
        if(window.plugins) {
            // window.plugins.localNotification.cancel(id);
        } else {
            console.log("[PhoneGapPlugin] PhoneGap environment not available for LocalNotifications");
        }
    },
    
    cancelAll: function() {
        if(window.plugins) {
            // window.plugins.localNotification.cancelAll();
        } else {
            console.log("[PhoneGapPlugin] PhoneGap environment not available for LocalNotifications");
        }
    }
}