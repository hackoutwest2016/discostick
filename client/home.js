Template.home.events({
  'click [data-new-game]': function(evt) {
    evt.preventDefault();

    const gameId = Games.insert({
      name: Random.id(4),
      host: Meteor.userId(),
      users: [],
      rounds: [
        /*
        {
          focusedUser
          tracks []
            adder
            uri
        }
        */
      ]
    });

    const game = Games.findOne(gameId);

    FlowRouter.go('game', {name: game.name});
  }
});

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

Template.home.onDestroyed(function() {
  $('body').removeClass('body-home');
});
