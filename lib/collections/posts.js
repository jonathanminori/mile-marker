Posts = new Mongo.Collection('posts');

Posts.allow({
	update: function(userId, post) { return ownsDocument(userId, post); },
	remove: function(userId, post) { return ownsDocument(userId, post); },
});

Posts.deny({
	update: function(userId, post, fieldNames, modifier) {
		var errors = validatePost(modifier.$set);
		return errors.title || errors.url || errors.sport;
	}
});

validatePost = function(post) {
	var errors = {};
	if (!post.title)
		errors.title = "Please give it a title";
	if (!post.url)
		errors.url = "Please copy and paste the URL";
	if (!post.sport)
		errors.sport = "Please select a sport";
	return errors;
}

Meteor.methods({
	postInsert: function(postAttributes) {
		check(Meteor.userId(). String);
		check(postAttributes, {
			title: String,
			url: String,
			sport: String
		});
		
		if (Meteor.isServer) {
			Meteor._sleepForMs(1000);
		}
		
		var errors = validatePost(postAttributes);
		if (errors.title || errors.url || errors.sport)
			throw new Meteor.Error('invalid-post', "You must set a title, URL, and sport for your post");
		
		var postWithSameURL = Posts.findOne({url: postAttributes.url});
		if (postWithSameURL) {
			return {
				postURLExists: true,
				_id: postWithSameURL._id
			}
		}
		
		var postWithSameTitle = Posts.findOne({title: postAttributes.title});
		if (postWithSameTitle) {
			return {
				postTitleExists: true,
				_id: postWithSameTitle._id
			}
		}
		
		var user = Meteor.user();
		var post = _.extend(postAttributes, {
			userId: user._id,
			author: user.username || user.profile.name,
			slug: _.slugify(postAttributes.title),
			submitted: new Date(),
			commentsCount: 0,
			upvoters: [],
			votes: 0
		});
		
		var postId = Posts.insert(post);
		
		return {
			_id: postId
		};
	},
	upvote: function(postId) {
		check(this.userId, String);
		check(postId, String);
		
		var affected = Posts.update({
			_id: postId,
			upvoters: {$ne: this.userId}
		}, {
			$addToSet: {upvoters: this.userId},
			$inc: {votes: 1}
		});
		if (! affected)
			throw new Meteor.Error('invalid', "You weren't able to upvote that post");
	}
});