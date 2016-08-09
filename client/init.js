if (Meteor.isClient) {
  Meteor.startup(() => {
    Tracker.autorun(() => {
      if (Meteor.userId()) {
        Meteor.call('initSpotify');
      }
    });
  });
}
