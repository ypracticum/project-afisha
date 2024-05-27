import './scss/styles.scss';
import { API_URL, CDN_URL, SETTINGS } from './utils/constants';
import { FilmAPI } from './components/model/FilmApi';
import { AppStateModel } from './components/model/AppState';
import { AppStateEmitter } from '@/components/model/AppStateEmitter';
import { MainController } from '@/components/controller/Main';
import { MainScreen } from '@/components/view/screen/Main';
import {
	AppStateChanges,
} from '@/types/components/model/AppState';

const api = new FilmAPI(CDN_URL, API_URL);
const app = new AppStateEmitter(api, SETTINGS.appState, AppStateModel);
const main = new MainScreen(new MainController(app.model));
const modal = {};

app.on(AppStateChanges.movies, () => {
	main.items = Array.from(app.model.movies.values());
});

app.on(AppStateChanges.selectedMovie, () => {
	main.selected = app.model.selectedMovie;
});

app.model
	.loadMovies()
	.then(() => {
		app.model.restoreState();
		app.model.selectMovie(Array.from(app.model.movies.values())[0].id);
	})
	.catch((err: string) => console.log(`Error: `, err));
