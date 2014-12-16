if (typeof PhoneGap !== "undefined") {
    function Flurry() {
    }

    Flurry.prototype.countPageView = function(options) {
        PhoneGap.exec("Flurry.countPageView");
    };
    
    Flurry.prototype.logEvent = function(eventName) {
        PhoneGap.exec("Flurry.logEvent", eventName);
    };

    Flurry.prototype.logTimedEvent = function(eventName) {
        PhoneGap.exec("Flurry.logTimedEvent", eventName);
    };

    Flurry.prototype.endTimedEvent = function(eventName) {
        PhoneGap.exec("Flurry.endTimedEvent", eventName);
    };

    Flurry.prototype.setUserID = function(userID) {
        PhoneGap.exec("Flurry.setUserID", userID);
    };

    PhoneGap.addConstructor(function() 
    {
        if(!window.plugins)
        {
            window.plugins = {};
        }
        window.plugins.flurry = new Flurry();
    });
}
