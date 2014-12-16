var Environment = {
    debug: function() {
        return false;
    },
    type: function() {
        return 'staging';
    },
	version: function() {
		return '1.2.2';
	},
    baseApiUrl: function() {
        return "http://staging.diary.com";
    },
    externalLinksHTML: function() {
        return '<p class="review_itunes"><a href="https://market.android.com/details?id=com.diary.android">See our reviews on the Android Market</a></p>';
    }
}