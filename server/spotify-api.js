const spotifyCreds = Meteor.settings.spotify;

SpotifyApi = null;

const initSpotify = () => {
  console.log('Init Spotify API...');

  SpotifyApi = new SpotifyWebApi({
    clientId : spotifyCreds.clientId,
    clientSecret : spotifyCreds.secret
  });
};

Meteor.methods({
  initSpotify: initSpotify,

  search(string) {
    if (!SpotifyApi) {
      initSpotify();
    }

    try {
      const search = Meteor.wrapAsync(SpotifyApi.searchTracks);
      const response = search(string, {});

      return response.body.tracks.items;
    } catch (ex) {
      console.log(ex);
      if (ex.statusCode === 401) {
        console.log('Refreshing token...');
        SpotifyApi.refreshAndUpdateAccessToken();
      } else {
        throw ex;
      }
    }
  }
});
