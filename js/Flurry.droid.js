var Flurry = function() {
}

Flurry.prototype.countPageView = function(param) {
    return PhoneGap.exec(function(){}, function(){}, 
        'FlurryPlugin',  //Telling PhoneGap that we want to run "Flurry" Plugin
        'countPageView',              //Telling the plugin, which action we want to perform
        [""]);
};

Flurry.prototype.logEvent = function(eventName) {
    return PhoneGap.exec(function(){}, function(){}, 
        'FlurryPlugin',  //Telling PhoneGap that we want to run "Flurry" Plugin
        'logEvent',              //Telling the plugin, which action we want to perform
        [eventName]);        //Passing a list of arguments to the plugin, in this case this is the eventName 
};

Flurry.prototype.setUserID = function(userID) {
    return PhoneGap.exec(function(){}, function(){}, 
        'FlurryPlugin',  //Telling PhoneGap that we want to run "Flurry" Plugin
        'setUserID',              //Telling the plugin, which action we want to perform
        [userID]);        //Passing a list of arguments to the plugin, in this case this is the userID 
};

PhoneGap.addConstructor(function() {
    //Register the javascript plugin with PhoneGap
    PhoneGap.addPlugin('flurry', new Flurry());

    //Register the native class of plugin with PhoneGap
    // PluginManager.addService("FlurryPlugin","com.diary.android.FlurryPlugin");
});
