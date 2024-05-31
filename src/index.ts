import './scss/styles.scss';
import { API_URL, CDN_URL, DEVELOPMENT, SETTINGS } from './utils/constants';

import { FilmAPI } from './components/model/FilmApi';
import { AppStateModel } from './components/model/AppState';
import { AppStateEmitter } from '@/components/model/AppStateEmitter';
import { EventEmitter } from '@/components/base/EventEmitter';
import { AppStateEvents } from '@/types/components/model/AppStateEmitter';
import { UIActions, UIEvents } from '@/types/components/view/screen/UIEvents';
import { MainScreen } from '@/components/view/screen/Main';
import { AppStateChanges, AppStateModals } from '@/types/components/model/AppState';

// Initialize the application
const api = new FilmAPI(CDN_URL, API_URL);
const broker = new EventEmitter<AppStateEvents & UIEvents>();
const app = new AppStateEmitter(broker, api, SETTINGS.appState, AppStateModel);

// Initialize the screens
const main = new MainScreen({
	onOpenBasket: broker.trigger(UIActions.openBasket),
	onSelectFilm: broker.trigger(UIActions.selectMovie),
	onOpenFilm: broker.trigger(UIActions.openMovie),
});

// subscribe to UI events
broker.on(UIActions.selectMovie, app.model.selectMovie.bind(app.model));
broker.on(UIActions.openMovie, async (id: string) => {
	await app.model.loadSchedule(id);
	app.model.openModal(AppStateModals.session);
});
broker.on(UIActions.openBasket, app.model.openModal.bind(app.model, AppStateModals.basket));

// Subscribe to model events
broker.on(AppStateChanges.movies, () => {
	main.items = Array.from(app.model.movies.values());
});

broker.on(AppStateChanges.selectedMovie, () => {
	main.selected = app.model.selectedMovie;
});

if (DEVELOPMENT) {
	broker.onAll((event) => console.log(`Event: `, event));
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.__model = app.model;
}

app.model
	.loadMovies()
	.then(() => {
		app.model.restoreState();
		app.model.selectMovie(Array.from(app.model.movies.values())[0].id);
	})
	.catch((err: string) => console.log(`Error: `, err));