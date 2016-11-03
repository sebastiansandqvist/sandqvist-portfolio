import m from 'mithril';
import Page from './Page.js';

function view() {
	return (
		m(Page, { active: 'web' },
			m('.Section',
				m('h1.white', 'Sparque'),
				m('p', 'Sparque is a website for saving and organizing artwork and inspiration.'),
				m('img.Web[src=/images/web/sparque.jpg]'),
				m('p.details', 'Project type: personal, work-in-progress'),
				m('p.details', 'Technology: Adobe Photoshop')
			),
			m('.Section',
				m('h1.white', 'Mithril Examples'),
				m('p',
					'Mithril.js is a front-end library for building complex web interfaces. ',
					'The Mithril Examples website demonstrates various parts of the API.'
				),
				m('img.Web[src=/images/web/mithril-examples.jpg]'),
				m('a.Button[href=https://mithril-examples.firebaseapp.com]', 'Visit Mithril Examples'),
				m('p.details', 'Project type: personal'),
				m('p.details', 'Technology: Mithril, CSS')
			),
			m('.Section',
				m('h1.white', 'Collage'),
				m('p', 'Collage.io is a social marketplace for university students.'),
				m('img.Web[src=/images/web/collage-login.png]'),
				m('img.Web[src=/images/web/collage-market.png]'),
				m('a.Button[href=https://collage.io]', 'Visit Collage.io'),
				m('p.details', 'Project type: professional'),
				m('p.details', 'Role: web designer & developer'),
				m('p.details', 'Technology: Mithril, React-Native, Node.js, Express, SASS, Canvas API, Stripe, Flow')
			),
			m('.Section',
				m('h1.white', 'UNLV Wilderness'),
				m('p', 'UNLV Wilderness is a club dedicated to exploring Nevada lands.'),
				m('img.Web[src=/images/web/wilderness.jpg]'),
				m('a.Button[href=http://unlv-wilderness.com]', 'Visit UNLV Wilderness'),
				m('p.details', 'Project type: volunteer work'),
				m('p.details', 'Role: web designer & developer, logo designer'),
				m('p.details', 'Technology: Node.js, Express, Jade, SASS')
			),
			m('.Section',
				m('h1.white', 'Ski Area Visualizer'),
				m('p',
					'The ski resort visualizer displays public information ',
					'about ski resorts across the United States.'
				),
				m('img.Web[src=/images/web/ski.jpg]'),
				m('p.details', 'Project type: personal'),
				m('p.details', 'Technology: D3.js, Node.js')
			),
			m('.Section',
				m('h1.white', 'Let\'s Join Paws'),
				m('p', 'Let\'s Join Paws is a social network bringing together dog owners and caregivers.'),
				m('img.Web[src=/images/web/letsjoinpaws.jpg]'),
				m('p.details', 'Project type: professional'),
				m('p.details', 'Role: web designer & developer'),
				m('p.details', 'Technology: Node.js, MongoDB, jQuery, Stripe, Mailchimp')
			),
			m('.Section',
				m('h1.white', 'Prynt'),
				m('p', 'Prynt is a service for remote 3d printing (built during a hackathon).'),
				m('img.Web[src=/images/web/prynt.jpg]'),
				m('p.details', 'Project type: personal'),
				m('p.details', 'Technology: Raspberry Pi, Node.js, Jade, SASS')
			),
			m('.Section',
				m('h1.white', 'CrowdHall'),
				m('p', 'CrowdHall allowed its users to create and participate in online town halls.'),
				m('img.Web[src=/images/web/crowdhall.jpg]'),
				m('img.Web[src=/images/web/crowdhall-form.jpg]'),
				m('p.details', 'Project type: professional'),
				m('p.details', 'Role: UI & UX designer'),
				m('p.details', 'Technology: Adobe Photoshop')
			),
			m('.Section',
				m('h1.white', 'Flying Aviation Expo'),
				m('p', 'The promotional website for the 2014 Flying Aviation Expo helped attendees and exhibitors find information about the event.'),
				m('img.Web[src=/images/web/aviation.jpg]'),
				m('a.Button[href=https://aviation-expo-dev.firebaseapp.com]', 'Visit Flying Aviation Expo'),
				m('p.details', 'Project type: professional'),
				m('p.details', 'Role: web designer & developer'),
				m('p.details', 'Technology: HTML, CSS, jQuery')
			),
			m('.Section',
				m('h1.white', 'Web Audio Editor'),
				m('p', 'The web audio editor helps users write and play music directly in the browser.'),
				m('img.Web[src=/images/web/audio.jpg]'),
				m('img.Web[src=/images/web/audio-instruments.jpg]'),
				m('p.details', 'Project type: personal'),
				m('p.details', 'Technology: jQuery, Web Audio API')
			),
			m('.Section',
				m('h1.white', 'Cellular Automata Visualizer'),
				m('p', 'This visualizer displays all 256 rules for cellular automata.'),
				m('img.Web[src=/images/web/cells.jpg]'),
				m('a.Button[href=https://cellular-automata-test.firebaseapp.com]', 'Visit Cell Visualizer'),
				m('p.details', 'Project type: personal'),
				m('p.details', 'Technology: Mithril')
			)
		)
	);
}

const Web = {
	view
};

export default Web;