Template.registerHelper('getUser', id => {
  return Meteor.users.findOne(id);
});

Template.registerHelper('displayName', id => {
  const user = Meteor.users.findOne(id);

  if (user) {
    return user.profile.id;
  }
});
