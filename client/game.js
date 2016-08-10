const getGame = () => {
	const name = FlowRouter.getParam('name');
	return Games.findOne({name: name});
};

const getRound = game => {
	return _.last(game.rounds);
};

const createNewRound = (game) => {
	const users = game.users;
	const rounds = game.rounds;


	let alreadyTaken = [];

	if (rounds && rounds.length) {
		alreadyTaken = _.pluck(rounds, 'focusedUser'); // array

		if(rounds.length == alreadyTaken.length)
			alreadyTaken = [];
	}

	return {
		focusedUser: _.sample(_.difference(users, alreadyTaken)),
		tracks: []
	};
};

const newGame = () => {
	const game = getGame();

	if (game) {
		if (game.users.length === 0) {
			alert('No players here yet!');
			return;
		}

		Games.update(game._id, {
			$push: {
				rounds: createNewRound(game)
			}
		});
	}
};

Template.game.onCreated(function() {
	const game = getGame();

	if (game && !Session.get('isHost')) {
		Games.update(game._id, {
			$addToSet: {users: Meteor.userId()}
		});
	}
});

Template.game.onDestroyed(function() {
	Session.set('isHost', false);
});

Template.game.helpers({
	url() {
		return Meteor.absoluteUrl(FlowRouter.path('game', {name: FlowRouter.getParam('name')}).replace(/^\//, ''));
	},

	havePicked() {
		const game = getGame();

		if (game) {
			const currentRound = _.last(game.rounds);

			if (currentRound) {
				return game.users.length === currentRound.tracks.length;
			}
		}
	},

	isHost() {
		return Session.get('isHost');
	},

	isDisabled() {
		const game = getGame();
		return game && game.users.length === 0;
	},

	pickedSong() {
		const game = getGame();

		if (game) {
			const round = getRound(game);

			if (round) {
				const track = _.findWhere(round.tracks, {adder: Meteor.userId()});
				return track && track.name;
			}
		}
	},

	getFocusedUser() {
		const game = getGame();
		const round = getRound(game);
		return Meteor.users.findOne(round.focusedUser);
	},

	hasBegun(){
		const game = getGame();

		if (game) {
			return game.rounds.length > 0;
		}
	},

	round() {
		const game = getGame();
		return getRound(game);
	},

	players() {
		const name = FlowRouter.getParam("name");
		const game = Games.findOne({name: name});

		if (game) {
			return Meteor.users.find({
				_id: {$in: game.users}
			});
		}
	}
});

Template.game.events({
	'click [data-start-game]': function(evt) {
		evt.preventDefault();
		newGame();
	},

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
	}
});

Template.songPickView.onCreated(function() {
	const tmpl = this;

	this.songs = new Mongo.Collection(null);
});

const addTrack = function(evt, tmpl) {
	evt.preventDefault();

	const game = getGame();
	const currentRound = tmpl.data;
	const track = this;

	currentRound.tracks = currentRound.tracks || [];

	const song = {
		adder: Meteor.userId(),
		trackId: track.id,
		name: track.name
	};

	currentRound.tracks.push(song);

	Meteor.call('updateRound', game._id, currentRound);
};

Template.songPickView.events({
	'click li': addTrack,

	'touchstart li': addTrack,

	'input [data-search]': _.debounce(function(evt, tmpl) {
		if (!evt.target.value) {
			tmpl.songs.remove({});
			return;
		}

		Meteor.call('search', evt.target.value, (err, res) => {
			if (err) {
				console.error(err);
				return;
			}

			if (res) {
				tmpl.songs.remove({});
				res.forEach(song => {
					tmpl.songs.upsert({id: song.id}, song);
				});
			}
		});
	}, 200)
});

Template.songPickView.helpers({
	artist() {
		return this.artists[0].name;
	},

	cover() {
		if (this.album && this.album.images && this.album.images.length) {
			const cover = _.findWhere(this.album.images, {height: 300});
			return cover && cover.url;
		}
	},

	songs() {
		const Songs = Template.instance().songs;
		return Songs.find({}, {sort: {popularity: -1}});
	}
});
