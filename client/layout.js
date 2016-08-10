const getGame = () => {
	const name = FlowRouter.getParam('name');
	return Games.findOne({name: name});
};

const getRound = game => {
	return _.last(game.rounds);
};

Template.layout.events({
  'click [data-leave]': function(evt) {
		evt.preventDefault();

		const game = getGame();

		if (game) {
			Games.update(game._id, {
				$pull: {
					users: Meteor.userId()
				}
			});

			if (Session.get('isHost')) {
				Games.remove(game._id);
				Session.set('isHost', false);
			}
		}

		FlowRouter.go('home'); // you're drunk
	},

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
  inGame() {
    return FlowRouter.getParam('name');
  },

  isHost() {
    return Session.get('isHost');
  }
});
