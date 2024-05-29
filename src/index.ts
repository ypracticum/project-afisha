import './scss/styles.scss';
import { API_URL, CDN_URL, SETTINGS } from './utils/constants';

import { FilmAPI } from './components/model/FilmApi';
import { AppStateModel } from './components/model/AppState';
import { AppStateEmitter } from '@/components/model/AppStateEmitter';

// Initialize the application
const api = new FilmAPI(CDN_URL, API_URL);
const app = new AppStateEmitter(api, SETTINGS.appState, AppStateModel);

app.model
	.loadMovies()
	.then(() => {
		app.model.restoreState();
		app.model.selectMovie(Array.from(app.model.movies.values())[0].id);
	})
	.catch((err: string) => console.log(`Error: `, err));