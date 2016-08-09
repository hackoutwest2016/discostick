const getGame = () => {
	const name = FlowRouter.getParam('name');
	return Games.findOne({name: name});
};

const getRound = game => {
	return _.last(game.rounds);
};

Template.player.helpers({
  user() {
    const game = getGame();
    return getRound(game).focusedUser;
  },

  tracks() {
    const game = getGame();
    return _.pluck(getRound(game).tracks, 'trackId');
  }
});
