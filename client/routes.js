const render = template => {
  BlazeLayout.render('layout', {content: template});
};

FlowRouter.route('/', {
  action() {
    render('home');
  }
});
