Meteor.methods({
  updateRound(gameId, round) {
    return Games.update({
			_id: gameId,
			'rounds.id': round.id
		}, {
			$set: {
				'rounds.$': round
			}
		});
    console.log(Games.findOne(gameId))
  }
});
