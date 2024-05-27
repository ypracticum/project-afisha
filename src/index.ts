import './scss/styles.scss';
import { API_URL, CDN_URL, SETTINGS } from './utils/constants';
import { FilmAPI } from './components/model/FilmApi';
import { AppStateModel } from './components/model/AppState';
import { AppStateEmitter } from '@/components/model/AppStateEmitter';
import { MainController } from '@/components/controller/Main';
import { MainScreen } from '@/components/view/screen/Main';
import {
	AppStateChanges,
	AppStateModals,
} from '@/types/components/model/AppState';
import { SelectSessionScreen } from '@/components/view/screen/SelectSession';
import { SessionController } from '@/components/controller/Session';
import { SelectPlacesScreen } from '@/components/view/screen/SelectPlaces';
import { PlacesController } from '@/components/controller/Places';
import { ModalChange } from '@/types/components/model/AppStateEmitter';

const api = new FilmAPI(CDN_URL, API_URL);
const app = new AppStateEmitter(api, SETTINGS.appState, AppStateModel);
const main = new MainScreen(new MainController(app.model));
const modal = {
	[AppStateModals.session]: new SelectSessionScreen(
		new SessionController(app.model)
	),
	[AppStateModals.place]: new SelectPlacesScreen(
		new PlacesController(app.model)
	),
};

app.on(AppStateChanges.movies, () => {
	main.items = Array.from(app.model.movies.values());
});

app.on(AppStateChanges.selectedMovie, () => {
	main.selected = app.model.selectedMovie;
});

app.on(AppStateChanges.modal, ({ previous, current }: ModalChange) => {
	main.page.isLocked = current !== AppStateModals.none;
	if (previous !== AppStateModals.none) {
		// @ts-ignore
		modal[previous].render({ isActive: false });
	}
});

app.on(AppStateModals.session, () => {
	modal[AppStateModals.session].render({
		film: app.model.selectedMovie,
		schedule: {
			sessions: Array.from(app.model.movieSessions.values()),
			selected: null,
		},
		isActive: true,
		isDisabled: !app.model.selectedSession,
	});
});

app.on(AppStateChanges.selectedSession, () => {
	modal[AppStateModals.session].isDisabled = !app.model.selectedSession;
});

app.on(AppStateModals.place, () => {
	modal[AppStateModals.place].render({
		header: {
			title: SETTINGS.placesModal.headerTitle,
			description: app.model.formatMovieDescription({
				title: app.model.selectedMovie.title,
				day: app.model.selectedSession.day,
				time: app.model.selectedSession.time,
			}),
		},
		places: {
			hall: {
				rows: app.model.selectedSession.rows,
				seats: app.model.selectedSession.seats,
			},
			selected: Array.from(app.model.basket.values()),
			taken: app.model.selectedSession.taken,
		},
		isActive: true,
		isDisabled: app.model.basket.size === 0,
	});
});

app.on(AppStateChanges.basket, () => {
	main.counter = app.model.basket.size;
	modal[AppStateModals.place].render({
		places: {
			selected: Array.from(app.model.basket.values()),
		},
		isDisabled: app.model.basket.size === 0,
	});
});

app.model
	.loadMovies()
	.then(() => {
		app.model.restoreState();
		app.model.selectMovie(Array.from(app.model.movies.values())[0].id);
	})
	.catch((err: string) => console.log(`Error: `, err));
