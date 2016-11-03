import m from 'mithril';
// import T from 's-types';
import Page from './Page.js';

function view() {
	return (
		m(Page, { active: 'photography' },
			m('.Section',
				m('img.Photo[src=/images/photos/tomato.jpg]'),
				m('img.Photo[src=/images/photos/mountains.jpg]')
			)
		)
	);
}

const Photography = {
	view
};

export default Photography;