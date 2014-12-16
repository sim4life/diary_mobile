if (typeof PhoneGap !== "undefined") {
    function Flurry() {
    };

    Flurry.prototype.countPageView = function(options) {
        PhoneGap.exec(null, null, "flurry", "logPageView", []);
    };
    
    Flurry.prototype.logEvent = function(eventName) {
        PhoneGap.exec(null, null, "flurry", "logEvent", [eventName]);
    };

    Flurry.prototype.logTimedEvent = function(eventName) {
        PhoneGap.exec(null, null, "flurry", "logTimedEvent", [eventName]);
    };

    Flurry.prototype.endTimedEvent = function(eventName) {
        PhoneGap.exec(null, null, "flurry", "endTimedEvent", [eventName]);
    };

    Flurry.prototype.setUserID = function(userID) {
        PhoneGap.exec(null, null, "flurry","setUserID", [userID]);
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