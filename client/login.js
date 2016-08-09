Template.login.events({
  'click button'(evt) {
    evt.preventDefault();

    const options = {
      showDialog: true,
      requestPermissions: ['user-read-email']
    };

    Meteor.loginWithSpotify(options, err => {
      if (err) {
        console.warn(err);
      } else {
        console.log('Signed in!', Meteor.user());
      }
    });
  }
});
