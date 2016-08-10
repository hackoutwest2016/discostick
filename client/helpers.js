Template.registerHelper('getUser', id => {
  return Meteor.users.findOne(id);
});

Template.registerHelper('displayName', id => {
  const user = Meteor.users.findOne(id);

 if (user) {
    return user.profile.id;
  }
});

Template.layout.events({
  'click [data-logout]': function(evt) {
    evt.preventDefault();
    Meteor.logout();
    FlowRouter.go('home');
  }
});

Template.avatar.helpers({
  url() {
    if (this.profile && this.profile.images && this.profile.images[0]) {
      return this.profile.images[0].url;
    }

    return 'http://placekitten.com/100/100';
  }
});
