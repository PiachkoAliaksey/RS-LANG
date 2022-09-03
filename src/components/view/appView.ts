import {
  addComplexWord,
  addLearnedWord,
  changePage,
  changePlayState,
  deleteComplexWord,
  deleteLearnedWord,
  fetchWords,
  selectDifficulty,
  selectWord,
  switchDictionaryTab,
} from '../../store/reducers/dictionary/dictionaryReducer';
import { switchTab } from '../../store/reducers/app/appReducer';
import { parseID, play, playAudio, logOut } from '../../common/utils/utils';
import store from '../../store/store';
import Header from './layout/Header';
import Main from './layout/Main';
import Footer from './layout/Footer';
import AudioChallengeGame from './mini-games/audioсhallenge/Audiochallenge';
import sprintController from '../controller/sprint/SprintController';
import { mute, setGroupAndPage, showSprintStat, toggleFullscreen } from '../../store/reducers/sprint/sprintReducer';
import AuthorizationHandler from './authorization/AuthorizationHandler';

export default class AppView {
  body = document.querySelector('body') as HTMLBodyElement;

  sprint = this.body.querySelector('.sprint') as HTMLDivElement;

  listen() {
    const header = this.body.querySelector('.header') as HTMLDivElement;
    const main = this.body.querySelector('.main') as HTMLDivElement;
    const sprint = this.body.querySelector('.sprint') as HTMLDivElement;

    const headerHandler = (e: Event) => {
      const targetBtn = e.target as HTMLButtonElement;
      const targetLink = e.target as HTMLLinkElement;
      const targetImg = e.target as HTMLImageElement;

      if (targetBtn) if (store.getState().sprint.isStarted) sprintController.finishGame();
      if (targetBtn) {
        if (store.getState().sprint.isStarted) sprintController.finishGame();
      }
      if (targetBtn.closest('#login-btn')) {
        store.dispatch(switchTab('login'));
        const authorizationHandler = new AuthorizationHandler();
        authorizationHandler.start();
      }
      if (targetBtn.closest('#logout-btn')) {
        logOut();
        store.dispatch(switchTab('homepage'));
      }
      if (targetLink.id === 'homepage-link') store.dispatch(switchTab('homepage'));
      if (targetLink.id === 'dictionary-link') {
        const state = store.getState().dictionary;
        const { group, page } = state;
        store.dispatch(switchTab('dictionary'));
        store.dispatch(fetchWords({ group, page }));
      }
      //   if (targetLink.closest('.game-link')) {
      //     store.dispatch(switchTab('games'));
      //   this.body.querySelectorAll('.game-link').forEach((link) => link.addEventListener('click', gamesHandler));
      //   }
      if (targetLink.id === 'audiochallenge-link') {
        const audioGame = new AudioChallengeGame();
        audioGame.renderStartScreen();
      }

      if (targetLink.id === 'games-link') store.dispatch(switchTab('games'));
      if (targetLink.id === 'sprint-link') store.dispatch(switchTab('sprint'));
      if (targetLink.id === 'statistic-link') store.dispatch(switchTab('statistic'));
      if (targetLink.id === 'team-link') store.dispatch(switchTab('team'));
      if (targetImg.id === 'theme-btn') {
        this.body.classList.toggle('theme--light');
        this.body.classList.toggle('theme--dark');
        targetImg.classList.toggle('header__theme-switcher--active');
      }
    };

    const mainHandler = (e: Event) => {
      const targetLink = e.target as HTMLLinkElement;
      const targetBtn = e.target as HTMLButtonElement;
      const targetSpan = e.target as HTMLSpanElement;
      const targetImg = e.target as HTMLImageElement;
      const wordDiv = targetSpan.closest('.textbook__word') as HTMLDivElement;
      const audiochallengeLink = targetImg.closest('#games-audiochallenge-link');
      const sprintLink = targetImg.closest('#games-sprint-link');

      if (targetLink.id === 'link-create-account') {
        store.dispatch(switchTab('registration'));
        const authorizationHandler = new AuthorizationHandler();
        authorizationHandler.start();
      }
      if (targetLink.id === 'link-login') {
        store.dispatch(switchTab('login'));
        const authorizationHandler = new AuthorizationHandler();
        authorizationHandler.start();
      }
      if (wordDiv) store.dispatch(selectWord(wordDiv.id));
      if (targetBtn.classList.contains('textbook__difficulty-btn')) {
        const id = parseID(targetBtn.id);
        store.dispatch(changePage(0));
        store.dispatch(selectDifficulty(id));
        store.dispatch(selectWord(''));
        const state = store.getState().dictionary;
        const { group, page } = state;
        store.dispatch(fetchWords({ group, page }));
      }
      if (targetBtn.classList.contains('pagination__btn')) {
        let { page } = store.getState().dictionary;
        const { group } = store.getState().dictionary;
        if (targetBtn.classList.contains('textbook__btn-prev')) page -= 1;
        if (targetBtn.classList.contains('textbook__btn-next')) page += 1;
        store.dispatch(changePage(page));
        store.dispatch(selectWord(''));
        store.dispatch(fetchWords({ group, page }));
      }
      if (targetBtn.id === 'all-words-btn') store.dispatch(switchDictionaryTab('all'));
      if (targetBtn.id === 'complex-words-btn') store.dispatch(switchDictionaryTab('complex'));
      if (targetBtn.id === 'add-complex') {
        const selected = store.getState().dictionary.selectedWord;
        const { words } = store.getState().dictionary;
        const complex = words.find((word) => word.id === selected);
        if (complex) store.dispatch(addComplexWord(complex));
      }
      if (targetBtn.id === 'delete-complex') {
        const selected = store.getState().dictionary.selectedWord;
        const { complexWords } = store.getState().dictionary;
        const complex = complexWords.find((word) => word.id === selected);
        if (complex) store.dispatch(deleteComplexWord(complex));
      }
      if (targetBtn.id === 'add-learned') {
        const selected = store.getState().dictionary.selectedWord;
        const words =
          store.getState().dictionary.activeTab === 'all'
            ? store.getState().dictionary.words
            : store.getState().dictionary.complexWords;
        const learned = words.find((word) => word.id === selected);
        if (learned) store.dispatch(addLearnedWord(learned));
      }
      if (targetBtn.id === 'delete-learned') {
        const selected = store.getState().dictionary.selectedWord;
        const { learnedWords } = store.getState().dictionary;
        const learned = learnedWords.find((word) => word.id === selected);
        if (learned) store.dispatch(deleteLearnedWord(learned));
      }
      if (targetBtn.id === 'play-audio-btn') {
        const selected = store.getState().dictionary.selectedWord;
        const words =
          store.getState().dictionary.activeTab === 'all'
            ? store.getState().dictionary.words
            : store.getState().dictionary.complexWords;
        const word = words.find((el) => el.id === selected);
        if (word) {
          store.dispatch(changePlayState(true));
          playAudio(word.audio)
            .then(() => playAudio(word.audioMeaning))
            .then(() => playAudio(word.audioExample))
            .then(() => {
              store.dispatch(changePlayState(false));
            });
        }
      }

      if (targetBtn.id === 'audiochallenge-btn') {
        const state = store.getState().dictionary;
        const { group, page } = state;
        const audioGame = new AudioChallengeGame(group, page);
        audioGame.renderStartScreen();
      }
      if (targetBtn.id === 'sprint-btn') store.dispatch(switchTab('sprint'));
      if (targetBtn.id === 'dictionary-sprint-link') {
        const { group, page } = store.getState().dictionary;
        store.dispatch(showSprintStat(false));
        store.dispatch(setGroupAndPage({ group, page }));
        store.dispatch(switchTab('sprint'));
      }
      if (sprintLink) {
        const input = document.querySelector('.games__level-input:checked') as HTMLInputElement;
        const group = +input.value;
        const page = Math.floor(Math.random() * 31);
        store.dispatch(showSprintStat(false));
        store.dispatch(setGroupAndPage({ group, page }));
        store.dispatch(switchTab('sprint'));
      }
      if (audiochallengeLink) {
        const getLevelNumber = () =>
          +(document.querySelector('input[name="level-select"]:checked') as HTMLInputElement).value;
        const audioGame = new AudioChallengeGame(getLevelNumber());
        audioGame.renderStartScreen();
      }
    };

    // const gamesHandler = (e: Event) => {
    //   console.log(e.target);
    //   const getLevelNumber = () =>
    //     +(document.querySelector('input[name="level-select"]:checked') as HTMLInputElement).value;
    //   const targetGameLink = e.target;
    //   if ((targetGameLink as HTMLElement).closest('.games__audiochallenge-link')) {
    //     const audioGame = new AudioChallengeGame(getLevelNumber());
    //     audioGame.renderStartScreen();
    //   }
    //   if ((targetGameLink as HTMLElement).closest('.games__sprint-link')) {
    //     console.warn('GameSprint not implemented');
    //     // const input = document.querySelector('.games__level-input:checked') as HTMLInputElement;
    //     const group = getLevelNumber();
    //     const page = Math.floor(Math.random() * 31);
    //     store.dispatch(showSprintStat(false));
    //     store.dispatch(setGroupAndPage({ group, page }));
    //     store.dispatch(switchTab('sprint'));
    //   }
    // };

    const sprintHandler = (e: Event) => {
      const targetBtn = e.target as HTMLButtonElement;
      const targetTd = e.target as HTMLTableCellElement;
      if (targetBtn.id === 'sprint-new-game') sprintController.startGame();
      if (targetBtn.id === 'sprint-answer-true') sprintController.getUserAnswer(true);
      if (targetBtn.id === 'sprint-answer-false') sprintController.getUserAnswer(false);
      if (targetBtn.id === 'close-sprint-stat') store.dispatch(showSprintStat(false));
      if (targetBtn.id === 'mute') store.dispatch(mute());
      if (targetBtn.id === 'fullscreen') sprintController.toggleFullscreen(this.body);
      if (targetBtn.id === 'close-sprint-game') {
        sprintController.finishGame();
        store.dispatch(showSprintStat(false));
        if (store.getState().sprint.isFullscreen) {
          store.dispatch(toggleFullscreen());
          document.exitFullscreen();
        }
        store.dispatch(switchTab('homepage'));
      }
      if (targetBtn.id === 'back-to-games') {
        sprintController.finishGame();
        store.dispatch(showSprintStat(false));
        if (store.getState().sprint.isFullscreen) {
          store.dispatch(toggleFullscreen());
          document.exitFullscreen();
        }
        store.dispatch(switchTab('games'));
      }
      if (targetTd.id === 'finish-audio-btn') play(targetTd.lastElementChild as HTMLAudioElement);
    };

    header.addEventListener('click', headerHandler);
    main.addEventListener('click', mainHandler);
    // main.addEventListener('click', gamesHandler);
    if (sprint) sprint.addEventListener('click', sprintHandler);
  }

  renderHeader() {
    new Header().render(this.body);
  }

  renderMain() {
    new Main().render(this.body);
  }

  renderFooter() {
    new Footer().render(this.body);
  }

  renderApp() {
    this.body.innerHTML = '';
    this.renderHeader();
    this.renderMain();
    this.renderFooter();
    this.listen();
  }
}
