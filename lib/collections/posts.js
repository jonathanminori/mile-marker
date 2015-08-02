Posts = new Mongo.Collection('posts');

Meteor.methods({
	postInsert: function(postAttributes) {
		check(Meteor.userId(). String);
		check(postAttributes, {
			title: String,
			url: String
		});
		
		if (Meteor.isServer) {
			postAttributes.title += "(server)";
			// wait for 5 seconds
			Meteor._sleepForMs(5000);
		} else {
			postAttributes.title += "(client)";
		}
		
		var postWithSameURL = Posts.findOne({url: postAttributes.url});
		if (postWithSameURL) {
			return {
				postExists: true,
				_id: postWithSameURL._id
			}
		}
		
		var user = Meteor.user();
		var post = _.extend(postAttributes, {
			userId: user._id,
			author: user.username,
			submitted: new Date()
		});
		
		var postId = Posts.insert(post);
		
		return {
			_id: postId
		};
	}
});