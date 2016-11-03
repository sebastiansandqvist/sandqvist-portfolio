import m from 'mithril';
import T from 's-types';

const activeClass = (a, b) => a === b ? 'active' : '';

const navType = T({
	active: T.string
});

function view({ attrs }) {

	if (window.__DEV__) {
		navType(attrs, 'Nav');
	}

	return (
		m('nav.Nav',
			m('a.Nav-link[href=/photography]', {
				className: activeClass('photography', attrs.active),
				oncreate: m.route.link
			}, 'Photography'),
			m('a.Nav-link[href=/web]', {
				className: activeClass('web', attrs.active),
				oncreate: m.route.link
			}, 'Web design')
		)
	);
}

const Nav = {
	view
};

export default Nav;