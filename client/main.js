import { Template } from 'meteor/templating';

import './main.html';

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

Template.avatar.helpers({
  url() {
    if (this.profile.images && this.profile.images[0]) {
      return this.profile.images[0].url;
    }

    return '';
  }
});
