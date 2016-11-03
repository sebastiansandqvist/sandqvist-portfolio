import m from 'mithril';
import Nav from './Nav.js';

function view({ attrs, children }) {
	return (
		m('div',
			m('.Header',
				m('h1.Header-text', 'Sebastian Sandqvist'),
				m('.logo.logo-left'),
				m('.logo.logo-right')
			),
			m(Nav, attrs),
			m('div', children)
		)
	);
}

const Page = {
	view
};

export default Page;