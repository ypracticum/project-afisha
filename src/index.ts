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
import { ModalChange } from '@/types/components/model/AppStateEmitter';

const api = new FilmAPI(CDN_URL, API_URL);
const app = new AppStateEmitter(api, SETTINGS.appState, AppStateModel);
const main = new MainScreen(new MainController(app.model));
const modal = {
	[AppStateModals.session]: new SelectSessionScreen(
		new SessionController(app.model)
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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

app.model
	.loadMovies()
	.then(() => {
		app.model.restoreState();
		app.model.selectMovie(Array.from(app.model.movies.values())[0].id);
	})
	.catch((err: string) => console.log(`Error: `, err));
