const getGame = () => {
	const name = FlowRouter.getParam('name');
	return Games.findOne({name: name});
};

const getCurrentRound = () => {
	const game = getGame();
		if (game) {
			const currentRound = _.last(game.rounds);
			if(currentRound) {
				return currentRound;
			}
		}
}

const allUsersHavePicked = () => {
	const currentRound = getCurrentRound();
	const game = getGame();

	if (currentRound && game) {
		return game.users.length === currentRound.tracks.length;
	}
}

const getRound = game => {
	return _.last(game.rounds);
};

const createNewRound = (game) => {
	const users = game.users;
	const rounds = game.rounds;
	let points = [0];


	let alreadyTaken = [];

	if (rounds && rounds.length) {
		alreadyTaken = _.pluck(rounds, 'focusedUser'); // array
	}

	return {
		focusedUser: _.sample(_.difference(users, alreadyTaken)),
		points: points,
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

Template.game.onRendered(function() {
	$('body').addClass('game-body');
});

Template.game.onDestroyed(function() {
	if (Session.equals('isHost', true)) {
		const game = getGame();
		game && Games.remove(game._id);
	}

	Session.set('isHost', false);
	$('body').removeClass('game-body');
});

Template.game.helpers({
	url() {
		return Meteor.absoluteUrl(FlowRouter.path('game', {name: FlowRouter.getParam('name')}).replace(/^\//, ''));
	},

	havePicked() {
		return allUsersHavePicked();
	},

	isHost() {
		return Session.get('isHost');
	},

	isDisabled() {
		const game = getGame();
		return game && game.users.length === 0;
	},

	pickedSong() {
		const currentRound = getCurrentRound();
		if (currentRound) {
			const track = _.findWhere(currentRound.tracks, {adder: Meteor.userId()});
			return track && track.name;
		}
		
	},

	chosenSongs() {
		if(!allUsersHavePicked()) {
			return;
		}
		const game = getGame();
		if (game) {
			const round = getRound(game);
			if (round) {
				const trackContexts = round.tracks;
				return trackContexts;
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

const findIndex = (array, attr, value) => {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

Template.game.events({
	'click [data-start-game]': function(evt) {
		evt.preventDefault();
		newGame();
	},
	'click li': function(evt){
		const game = getGame();
		const currentRound = getCurrentRound();
		if(currentRound) {
			const index = findIndex(currentRound.tracks, 'name', this.name);
			currentRound.points[index] = currentRound.points[index] + 1;
			console.log(currentRound.points[index])
			Meteor.call('updateRound', game._id, currentRound);
		} 
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
