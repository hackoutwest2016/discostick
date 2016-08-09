Template.game.helpers({
	gameId(){
		return FlowRouter.getParam("name");
	},

	players() {
		const name = FlowRouter.getParam("name");
		const game = Games.findOne({name: name});

		if (game) {
			return game.users;
		}
	}
});

