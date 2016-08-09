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

	const users1 = ["first", "second"];

	let alreadyTaken = [];
	let newFocusedUser = [];

	if (rounds && rounds.length) {
		//plockar ut alla som har varit focusedUser
		alreadyTaken = _.pluck(rounds, 'focusedUser'); // array
		//newFocusedUser = _.difference(users, alreadyTaken);
	}

	return {
		focusedUser: _.sample(_.difference(users, alreadyTaken), 1),
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

	if (game && game.host !== Meteor.userId()) {
		Games.update(game._id, {
			$addToSet: {users: Meteor.userId()}
		});
	}
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
		const game = getGame();
		return game && game.host === Meteor.userId();
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
		//return round.focusedUser;
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

			if (game.host === Meteor.userId()) {
				Games.remove(game._id);
			}
		}

		FlowRouter.go('home'); // you're drunk
	}
});

Template.songPickView.onCreated(function() {
	const tmpl = this;

	this.songs = new Mongo.Collection(null);

	this.addTrack = (id, name) => {
		const game = getGame();
		const currentRound = tmpl.data;

		currentRound.tracks = currentRound.tracks || [];

		const track = {
			adder: Meteor.userId(),
			trackId: id,
			name: name
		};

		currentRound.tracks.push(track);

		Meteor.call('updateRound', game._id, currentRound);
	};
});

Template.songPickView.events({
	'click li': function(evt, tmpl) {
		evt.preventDefault();
		tmpl.addTrack(this.id, this.name);
	},

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
