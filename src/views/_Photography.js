import m from 'mithril';
// import T from 's-types';
import Page from './Page.js';

function view() {
	return (
		m(Page, { active: 'photography' },
			m('.Section',
				m('img.Photo[src=/images/photos/tomato.jpg]'),
				m('img.Photo[src=/images/photos/mountains.jpg]'),
				m('img.Photo[src=/images/photos/dante.jpg]'),
				m('img.Photo[src=/images/photos/humanscape.jpg]'),
				m('img.Photo[src=/images/photos/vegas.jpg]'),
				m('img.Photo[src=/images/photos/waterlight.jpg]'),
				m('img.Photo[src=/images/photos/whitespace.jpg]'),
				m('img.Photo[src=/images/photos/winter.jpg]'),
				m('img.Photo[src=/images/photos/buddha.jpg]'),
				m('img.Photo[src=/images/photos/eyes.jpg]'),
				m('img.Photo[src=/images/photos/pattern.jpg]'),
				m('img.Photo[src=/images/photos/blue.jpg]'),
				m('img.Photo[src=/images/photos/me.jpg]'),
				m('img.Photo[src=/images/photos/dream.jpg]')
			)
		)
	);
}

const Photography = {
	view
};

export default Photography;