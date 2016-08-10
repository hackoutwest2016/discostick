Template.home.onRendered(function() {
  $('body').addClass('body-home');
});

Template.home.helpers({
  games() {
    return Games.find();
  },

  joinedUsers() {
    return Meteor.users.find({_id: {$in: this.users}});
  }
});

Template.home.events({
  'click [data-clean]': function(evt) {
    evt.preventDefault();
    Meteor.call('removeAllGames');
  }
});

Template.home.onDestroyed(function() {
  $('body').removeClass('body-home');
});
