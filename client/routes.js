const render = template => {
  BlazeLayout.render('layout', {content: template});
};

FlowRouter.route('/', {
  name: 'home',
  action() {
    render('home');
  }
});

FlowRouter.route('/:name', {
  name: 'game',
  action() {
    render('game');
  }
});
