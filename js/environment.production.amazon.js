var Environment = {
    debug: function() {
        return false;
    },
    type: function() {
        return 'production';
    },
    baseApiUrl: function() {
        return "http://api.diary.com";
    },
	version: function() {
		return '1.2.2';
	},
    externalLinksHTML: function() {
        return '<p class="review_itunes"><a href="http://www.amazon.com/gp/mas/dl/android?p=com.diary.android">Review us on the Amazon Appstore</a></p>';
    }
}