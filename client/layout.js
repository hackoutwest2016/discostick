Template.layout.events({
  'click [data-new-game]': function(evt) {
    evt.preventDefault();

    Session.set('isHost', true);

    const gameId = Games.insert({
      name: Random.id(4),
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

Template.layout.helpers({
  started() {
    return Meteor.userId() || Session.get('isHost');
  },

  isHost() {
    return Session.get('isHost');
  }
});
