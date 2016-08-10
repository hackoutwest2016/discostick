Template.home.helpers({
  games() {
    return Games.find();
  },

  joinedUsers() {
    return Meteor.users.find({_id: {$in: this.users}});
  }
});
