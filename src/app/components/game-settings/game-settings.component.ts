import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Scores } from '../../interfaces/scores';
import { ImagesService } from '../../services/images.service';
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';

declare var $: any;

@Component({
  selector: 'app-game-settings',
  templateUrl: './game-settings.component.html',
  styleUrls: ['../../common.styles.scss', './game-settings.component.scss']
})
export class GameSettingsComponent implements OnInit, OnDestroy, OnChanges {

  /**
   * Inputs of the component:
   *   - gamesStarted: for control if the player has started or not a game
   *   - movesToMix: moves that will use the app to mix the puzzle
   *   - disableReset: boolean for control if the reset button must be showed disabled or not
   *   - scores: list of scores loaded from the local storage
   *   - language: language used by the app
   */
  @Input('gameStarted') gameStarted: boolean;
  @Input('movesToMix') movesToMix: number;  
  @Input('disableReset') disableReset: boolean;
  @Input('scores') scores: Array<Scores>;
  @Input('language') language: string;

  /**
   * Outputs of the component
   *   - updateMovesToMix: fires when the player changes the value for moves to mix the puzzle
   *   - startGame: fires when the player pres the start button, to indicate to the app that must start a new game
   *   - resetGame: fires when the player pres the reset button, to indicate to the app that must reset the game
   *   - changeLanguage: fires when the player changes the language of the app, using their buttons
   */
  @Output('updateMovesToMix') updateMovesToMix: EventEmitter<number> = new EventEmitter<number>();
  @Output('startGame') startGame: EventEmitter<void> = new EventEmitter<void>();
  @Output('resetGame') resetGame: EventEmitter<void> = new EventEmitter<void>();
  @Output('changeLanguage') emitChangeLanguage: EventEmitter<string> = new EventEmitter<string>();

  // icons for order the list of scores
  icons: any = {
    'sortUp': faAngleUp,
    'sortDown': faAngleDown
  }

  /**
   * values for the pagination of scores
   *   - page: the page of scores to show
   *   - perPage: number of scores to show per page
   *   - numPages: number of pages
   */
  page: number = 1;
  perPage: number = 5;
  numPages: number = 0;

  constructor(private _imagesService: ImagesService) {}

  /**
   * ngOnInit
   * actions to do when the component starts
   */
  ngOnInit(): void {
    
    // establishes the actions to do when the collapsibles showing
    $('#gameSettings').on('show.bs.collapse', function () {
      $('#scoresBoard').collapse('hide');
      $('#gameHelp').collapse('hide');
    });

    $('#scoresBoard').on('show.bs.collapse', function () {
      $('#gameSettings').collapse('hide');
      $('#gameHelp').collapse('hide');
    });

    $('#gameHelp').on('show.bs.collapse', function () {
      $('#scoresBoard').collapse('hide');
      $('#gameSettings').collapse('hide');
    });

    // order data of the scores and calculate the number of pages
    this.orderData();    
    this.calculateNumberPages();

  }

  /**
   * ngOnChanges
   * orders the list of scores and calculate 
   * the number of pages when the list of scores is updated
   */
  ngOnChanges(changes:SimpleChanges): void {

    if(this.scores.length > 0) {
      this.orderData();
      this.calculateNumberPages();
    } else {
      $('#scoresBoard').collapse('hide');
    }

  }

  /**
   * ngOnDestroy
   * actions to do when the component is destroyed
   */
  ngOnDestroy(): void {
    // eliminate all collapsibles
    $('#gameSettings').collapse('dispose');
    $('#scoresBoard').collapse('dispose');
    $('#gameHelp').collapse('dispose');
  }

  /**
   * orderData
   * orders the data shown in a list according a field and a type of ordering
   * @param field the field by that the data will be ordered
   * @param type the way that the data will be ordered, can be ascending or descending
   */
  orderData(field: string = 'time', type: string = 'ASC'): void {

    type = type.toUpperCase();
    
    let order = type === 'ASC' ? 1 : -1;

    this.scores.sort((a, b) => {
      if(a[field] < b[field]) {
        return order * -1;
      } else if(a[field] > b[field]) {
        return order;
      }
      return 0;
    });

    this.page = 1;
    
  }
  
  getScoresList(): Array<Scores> {

    let start = (this.page - 1) * this.perPage;
    let end = start + this.perPage;

    return this.scores.slice(start, end);
    
  }

  goToPage(page: number): void {
            
    if(page > 0 && page <= this.numPages) {
      this.page = page;
    }  

  }

  getPagesToShow(): Array<number> {

    let value: Array<number>;

    if(this.page === 1) {
      value = [this.page, this.page + 1, this.page + 2];
    } else if(this.page >= this.numPages) {
      value = [this.page - 2, this.page - 1, this.page];
    } else {
      value = [this.page -1, this.page, this.page + 1];
    }
    
    return value.filter((item) => {
      return item <= this.numPages && item > 0;
    });

  }

  /**
   * calculateNumberPages
   * calculate the number of pages has the list of scores, 
   * according the number of scores and how much must show by page
   */
  calculateNumberPages(): void {
    this.numPages = Math.floor(this.scores.length / this.perPage);
    if(this.scores.length % this.perPage !== 0) this.numPages++;
  }

  /**
   * buttonAction
   * executes an action fired by one of the buttons of the component
   * @param action a string that helps to know what is the action to do
   */
  buttonAction(action: string): void {
  
    switch(action) {

      case 'start':
        this.startGame.emit();
      break;

      case 'reset':
        this.resetGame.emit();
      break;

    }

  }

  /**
   * updateMoves
   * emits a message that indicates the value for moves to mix was changed
   */
  updateMoves(): void {
    this.updateMovesToMix.emit(this.movesToMix);
  }

  /**
   * getBoard
   * @param album 
   * @param board 
   */
  getBoard(album: string, board: number): string {
    return this._imagesService.getImageFromAlbum(album, board);
  }

  /**
   * getTime
   * formats a time value to show it in the scores list
   * @param time the value for time
   * @returns a string with the value formatted
   */
  getTime(time: number): string {

    let minutes = ('00' + Math.floor(time / 60)).substr(-2);
    let seconds = ('00' + (time % 60)).substr(-2);

    return minutes + ':' + seconds;

  }

  /**
   * changeLanguage
   * emits a event to indicate to the app that the language was changed, 
   * also, hides the collapsable of settings
   * @param lang the language choosed
   */
  changeLanguage(lang: string): void {
    this.emitChangeLanguage.emit(lang);
    $('#gameSettings').collapse('hide');

  }

}