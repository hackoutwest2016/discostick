const spotifyCreds = Meteor.settings.spotify;

Meteor.methods({
  initSpotify() {
    console.log('Init Spotify API...');

    SpotifyApi = new SpotifyWebApi({
      clientId : spotifyCreds.clientId,
      clientSecret : spotifyCreds.secret
    });
  },

  search(string) {
    try {
      const search = Meteor.wrapAsync(SpotifyApi.searchTracks);
      const response = search(string, {});

      if (response) {
        return response.body.tracks.items;
      }
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
