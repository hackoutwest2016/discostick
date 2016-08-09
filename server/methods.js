Meteor.methods({
  updateRound(gameId, round) {
    return Games.update({
			_id: gameId,
			'rounds.focusedUser': round.focusedUser
		}, {
			$set: {
				'rounds.$': round
			}
		});
  }
});
