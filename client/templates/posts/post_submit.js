Template.postSubmit.events({
	'submit form': function(e) {
		e.preventDefault();

		var post = {
			url: $(e.target).find('[name=url]').val(),
			title: $(e.target).find('[name=title]').val(),
			sport: $(e.target).find('[name=sport]').val()
		};
		
		var errors = validatePost(post);
		if (errors.title || errors.url)
			return Session.set('postSubmitErrors', errors);

		Meteor.call('postInsert', post, function(error, result) {
			// display the error to the user and abort
			if (error) {
				return throwError(error.reason);
				Router.go('postsPage', {_id: result._id});
			}
			
			// show this result but route anyway
			if (result.postURLExists) {
				throwError('This link has already been posted');
			}
			
			// show this result but route anyway
			if (result.postTitleExists) {
				throwError('This title has already been posted');
			}
		});
		
		Router.go('postsList');
	}
});

Template.postSubmit.onCreated(function() {
	Session.set('postSubmitErrors', {});
});

Template.postSubmit.helpers({
	errorMessage: function(field) {
		return Session.get('postSubmitErrors')[field];
	},
	errorClass: function(field) {
		return !!Session.get('postSubmitErrors')[field] ? 'has-error' : '';
	}
});