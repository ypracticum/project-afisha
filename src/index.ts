import './scss/styles.scss';
import { API_URL, CDN_URL, SETTINGS } from './utils/constants';

import { FilmAPI } from './components/model/FilmApi';
import { AppStateModel } from './components/model/AppState';
import { AppStateEmitter } from '@/components/model/AppStateEmitter';
import { MainPresenter } from '@/components/presenter/Main';
import { MainScreen } from '@/components/view/screen/Main';
import { SessionPresenter } from '@/components/presenter/Session';
import { SelectSessionScreen } from '@/components/view/screen/SelectSession';
import { PlacePresenter } from '@/components/presenter/Place';
import { SelectPlacesScreen } from '@/components/view/screen/SelectPlaces';

// Initialize the application
const api = new FilmAPI(CDN_URL, API_URL);
const app = new AppStateEmitter(api, SETTINGS.appState, AppStateModel);

new MainPresenter(MainScreen, app);
new SessionPresenter(SelectSessionScreen, app);
new PlacePresenter(SelectPlacesScreen, app);

app.model
	.loadMovies()
	.then(() => {
		app.model.restoreState();
		app.model.selectMovie(Array.from(app.model.movies.values())[0].id);
	})
	.catch((err: string) => console.log(`Error: `, err));