if (Meteor.isClient) {
  Meteor.startup(() => {
    Meteor.call('initSpotify');
  });
}
