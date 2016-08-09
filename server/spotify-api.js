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
    console.log(string);
/*
    SpotifyApi.searchTracks(string, {}, (err, res) => {
      console.log(err);
      if (err && err.statusCode === 401) {
        // Refresh
        console.log('Refreshing token...');
        SpotifyApi.refreshAndUpdateAccessToken();
      }
    });
*/

    try {
      const search = Meteor.wrapAsync(SpotifyApi.searchTracks);
      const response = search(string, {});

      if (response) {
        return response.body.tracks.items;
      }
    } catch (ex) {
      console.log(ex);
      throw ex;
    }
  }
});
