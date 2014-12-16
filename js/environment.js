var Environment = {
    debug: function() {
        return false;
    },
    type: function() {
        return 'production';
    },
	version: function() {
		return '2.6';
	},
    baseApiUrl: function() {
        return "http://api.diary.com";
    },
    externalLinksHTML: function() {
        return '<p class="review_itunes"><a href="http://itunes.apple.com/gb/app/diary-mobile/id357481953?mt=8">Like Diary? Review us on iTunes</a></p>';
    }
}