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
