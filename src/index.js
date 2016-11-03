import m from 'mithril';
import Photography from './views/_Photography.js';
import Web from './views/_Web.js';

window.__DEV__ = window.location.hostname === 'localhost';

const routes = {
	'/photography': Photography,
	'/web': Web
};

m.route.prefix('');
m.route(document.getElementById('app'), '/photography', routes);