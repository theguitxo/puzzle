import { Component, HostListener, ViewChild, Input, ElementRef, OnInit, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { ImagesService } from './services/images.service';
import { ScoresService } from './services/scores.service';
import { Scores } from './interfaces/scores';
import { TranslateService } from './services/translate.service';
import { Subscription } from 'rxjs';
import { BoardService } from './services/board.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    BoardService,
    ScoresService
  ]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  // LISTENERS
  /**
   * This listener is used for redraw the pieces of puzzle when change the size of the window
   */
  @HostListener('window:resize', ['$event']) onresize() {
    this.boardSize = this.gameBoard.nativeElement.clientWidth;
    this.setStylesOfPieces();
  }

  /**
   * This listener is used for check that key that was pushed is a cursor key 
   * and if is possible move the piece in the direction of the cursor key
   */
  @HostListener('document:keydown', ['$event']) eventKeyDown(event: KeyboardEvent) {
    this.keyDown(event);
  }

  /**
   * This listener is used for indicates to the app that, if the user push another key, will be execute the movement
   */
  @HostListener('document:keyup', ['$event']) eventKeyUp() {
    this.keyUp();
  }

  /**
   * VIEWS: Views of the elements of DOM that the app will be modify their properties.
   *   - jsGameBoard: div that contains the board where the pieces are placed
   *   - exampleImage: div that contains the image which the player can use as a guide to solve the puzzle
   */
  @ViewChild('jsGameBoard') gameBoard: ElementRef;  
  @ViewChild('exampleImage') exampleImage: ElementRef;
  
  // Strings with the possible moves
  moveUp: string = 'UP';
  moveDown: string = 'DOWN';
  moveLeft: string = 'LEFT';
  moveRight: string = 'RIGHT';

  // the information of the pieces, to send to component that will paint the board
  piecesBoard: Array<Array<any>> = [];

  // to control if a piece it's moving
  moving: boolean = false;

  // number of moves that will do the app to mix the puzzle
  movesToMix: number = 30;

  // to control that the game has started
  gameStarted: boolean;
  
  /**
   * Properties for the images used for the puzzle
   *   - boardsAlbum: identification of the album used to play
   *   - boards: list of albums of boards, it will send to the component that paint them and manage
   *   - boardSelected: identification of the image used to play
   */
  boardsAlbum: string = '';
  boards: Array<string> = [];
  boardSelected: number = 0;

  // the duration of the animation to move the pieces
  delayMoveAnimation: number = 250;

  // the size of the game board (in pixels)
  boardSize: number;
  
  // controls if the player has pulsed any key
  isKeyDown: boolean;

  /**
   * Properties for the scores of game
   *  - playedMoves: number of movements used to solve the puzzle
   *  - secondsPlayed: time used to solve the puzzle
   *  - intervalSecondsPlayer: interval used to control the chronometer that count the time of the game
   *  - scoresBoard: contains the information of the scores of previous games
   */
  playedMoves: number;
  secondsPlayed: number;
  intervalSecondsPlayer: any = null;
  scoresBoard: Array<Scores>;
  scoresSubscription: Subscription;
  
  /**
   * Properties for the language of the app
   */
  language: string = 'es';
  languageStrings: any = {};
  languageSubscription: Subscription;

  /**
   * Properties for the popup
   */
  showPopUp: boolean;
  titlePopUp: string;
  messagePopUp: string;
  confirmAction: any;
  typePopUp: string;

  /**
   * constructor
   * @param _imagesService 
   * @param _scoresService 
   * @param _translateService 
   */
  constructor(private renderer: Renderer2,              
              private _imagesService: ImagesService,
              private _scoresService: ScoresService,
              private _translateService: TranslateService,
              private _boardService: BoardService) { 

    // init values of the game
    this.gameStarted = false;
    this.playedMoves = 0;    
    this.isKeyDown = false;
    this.showPopUp = false;

    // loads the values stored for scores
    this._scoresService.loadScores();
    this.scoresBoard = this._scoresService.getScores();
    
    // subscription to control changes in the language used in the game
    this.languageSubscription = this._translateService.getLanguageChanged().subscribe(() => {
      this.setLanguageStrings();      
    });

    // subscription to control when the scores board changes
    this.scoresSubscription = this._scoresService.getScoresSaved().subscribe(() => {
      console.log('cambio en socores')
      this._scoresService.loadScores();
      this.scoresBoard = this._scoresService.getScores();
    });

  }
  
  // APP LIFE CYCLE METHODS
  /**
   * ngOnInit
   * init the next values:
   *   - the strings used in the app through the translate service
   *   - the boards of the default album
   *   - the information of the pieces of the board
   */
  ngOnInit(): void {
    
    this.setLanguageStrings();
    this.boards = this._imagesService.getAlbum();
    this._boardService.setLevel(4);
    this.makeBoard(); 
    
  }

  /**
   * ngAfterViewInit
   * gets the size of the board game and draws the pieces of the board according of the board size
   */
  ngAfterViewInit(): void {

    this.boardSize = this.gameBoard.nativeElement.clientWidth;
    this.setStylesOfPieces();

  }

  /**
   * ngOnDestroy
   * destroy the subscription to the translate service
   */
  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
    this.scoresSubscription.unsubscribe();
  }

  // LANGUAGE METHODS
  /**
   * languageStrings
   * set the values of the strings that use the app
   */
  setLanguageStrings(): void {

    this.languageStrings = {
      'games.rules.title': this._translateService.getValue('games.rules.title'),
      'games.rules.text': this._translateService.getValue('games.rules.text'),
      'game.finished.title': this._translateService.getValue('game.finished.title'),
      'game.finished.text': this._translateService.getValue('game.finished.text'),
      'game.reset.title': this._translateService.getValue('game.reset.title'),
      'game.reset.text': this._translateService.getValue('game.reset.text'),
      'game.rules.title': this._translateService.getValue('game.rules.title'),
      'game.rules.moves.text': this._translateService.getValue('game.rules.moves.text'),
      'game.start.title': this._translateService.getValue('game.start.title'),
      'game.few.moves.text.1': this._translateService.getValue('game.few.moves.text.1'),
      'game.few.moves.text.2': this._translateService.getValue('game.few.moves.text.2'),
      'btn.load.image': this._translateService.getValue('btn.load.image'),
      'board.delete.title': this._translateService.getValue('board.delete.title'),
      'board.delete.text': this._translateService.getValue('board.delete.text')
    }

  }

  /**
   * changeLanguage
   * change the language of the app using the translate service
   * @param lang 
   */
  changeLanguage(lang: string): void {

    this.language = lang;
    this._translateService.use(this.language);

  }

  // POPUP METHODS
  /**
   * openPopUp
   * open a popup to show information or make a question
   * @param title title of the pop up
   * @param message message to show on the popup
   * @param type the type of popup, can be: alert (for messages) or confirm (for questions to player)
   */
  private openPopUp(title: string, message: string, type: string): void {
    this.titlePopUp = title;
    this.messagePopUp = message;
    this.typePopUp = type;
    this.showPopUp = true;
  }

  /**
  * closePopUp
  * closes the popup (only hides the component)
  */
  closePopUp(): void {
    this.showPopUp = false;
  }

  // METHODS TO MANAGE THE BOARDS OF THE GAME
  /**
   * changeBoard
   * Change the image that is used for play to the puzzle
   * @param idx index of the array of images that contains the image will be used to play 
   */
  changeBoard(idx: number): void {

    if(this.gameStarted) {

      // The game is started, isn't possible to change the image, it's be inform the player
      this.openPopUp(this.languageStrings['games.rules.title'], this.languageStrings['games.rules.text'], 'alert');

    } else {

      // No game was started.The id of the image selected by the player is the new image selected
      // and it's must to draw the board.
      this.boardSelected = idx;
      this.setStylesOfPieces();

    }

  }

  /**
   * addBoard
   * Add a new image into the user's album
   * @param event the information of the image to add to the album
   */
  addBoard(event:string): void {
    this.boards.push(event);
    if(!this.gameStarted) {
      this.changeBoard(this.boards.length - 1);
    }
  }

  /**
   * deleteBoard
   * @param event 
   */
  deleteBoard(event: number): void {

    // sets the function to execute when the popup is confirmed
    this.confirmAction = () => {
      
      // deleting scores that was obtained using the board to delete
      this._scoresService.deleteByBoard(event);
      this._imagesService.deleteImagePersonalAlbum(event);
            
      this.changeImageAlbum({
        album: this._imagesService.getDefaultAlbumKey(),
        index: 0
      });

      this.showPopUp = false;

    };

    // open the popup for querying to the player
    this.openPopUp(this.languageStrings['board.delete.title'], this.languageStrings['board.delete.text'], 'confirm');

  }

  /**
  * imageNotValid
  * opens a popup that informs that the file selected to use as an image isn't valid
  * @param event the message to show in the popup 
  */
  imageNotValid(event): void {
    this.openPopUp(this.languageStrings['btn.load.image'], event, 'alert');
  }

  /**
   * changeImageAlbum
   * change the album for choose images to play
   * @param data information of the album selected
   */
  changeImageAlbum(data: any): void {
    // empties the list of boards
    this.boards = [];
    // this setTimeout is used for synchronize correctly the information of boards with the carousel of images
    setTimeout(() => {
      // loads the information of the album selected
      this.boards = this._imagesService.getAlbum(data.album);
      // updates the album and board selected
      this.boardsAlbum = data.album;
      this.boardSelected = data.index;
      // paint the game board with the new values
      this.setStylesOfPieces();
    }, 0);
  }

  /**
   * makeBoard
   * init the information of the game board and paint it
   */
  makeBoard(): void {
            
    this.piecesBoard = this._boardService.makeBoard();
    this.setStylesOfPieces();

  }

  /**
   * setStylesOfPieces
   * update the styles of the pieces
   */
  private setStylesOfPieces(): void {
  
    this.piecesBoard = this._boardService.setStyleOfPieces(this.boards[this.boardSelected], this.boardSize);

    if(this.exampleImage !== undefined) {
      this.renderer.setStyle(this.exampleImage.nativeElement, 'width', `${this.boardSize}px`);
    }
    
  }

  // METHODS TO MOVE THE PIECES OF THE BOARD
  /**
   * movePiece
   * move the piece that the player has pressed
   * @param row row where is the piece
   * @param column columna where is the piece
   */
  movePiece(row: number, column: number): void {
  
    // check if the game is started and that no piece is moving now
    if(this.gameStarted && !this.moving) {
      
      // updates the property for control that a piece is moving and querying what movement is available
      this.moving = true;
      let movement = this._boardService.whatMoveIsAvailable(row, column);

      if (movement != null) {

        // a movement is possible, move the piece
        this.animeMovement(row, column, movement);

      } else {

        // no movement is possible for this piece, return the move control to false
        this.moving = false;

      }

    }
    
  }

  /**
   * animeMovement
   * moves the choosed piece to its new position
   * @param row the row where is the piece to move
   * @param column the column where is the piece to move
   * @param movement the movement to apply to the piece
   */
  private animeMovement(row: number, column: number, movement: string): void {

    // sets the CSS rules for the movement
    this._boardService.setMovementAnimation(movement, row, column, this.boardSize, this.delayMoveAnimation);

    // inits a timeout for execute the code when the animation is finished
    let timeOutMove = setTimeout(() => {

      /**
       * increases the moves counter
       * swap the position of the piece with the free position of the board
       * update the style information with the new values
       * checks the board for if the game is finished
       */
      this.playedMoves++;
      this._boardService.swapPieces(row, column);
      this.setStylesOfPieces();
      this.checkBoard();

      // to avoid problems, clears the timeout
      clearTimeout(timeOutMove);
      timeOutMove = null;

      // now, no piece is moving
      this.moving = false;

    }, this.delayMoveAnimation);

  }

  /**
   * checkBoard
   * checks if the pieces of the board are in their correct position
   */
  private checkBoard(): void {
    
    if(this._boardService.checkBoard()) {
      
      // stops the counter of time played
      this.stopTimeCounter();

      // set that the game isn't started      
      this.gameStarted = false;

      // show the piece that works as free position
      this._boardService.showFreePiece();

      // opens a popup to inform that game is finished
      this.openPopUp(this.languageStrings['game.finished.title'], this.languageStrings['game.finished.text'], 'alert');
      
      // saves the score of the game into the local storage
      this._scoresService.saveScoreGame(
        (this.boardsAlbum ? this.boardsAlbum : this._imagesService.defaultAlbumKey), 
        (this.boardSelected + 1), 
        this.playedMoves, 
        this.secondsPlayed,
        this.movesToMix
      );

      // loads and updates the new values of scores
      this._scoresService.loadScores();
      this.scoresBoard = this._scoresService.getScores();

    }

  }

  // METHODS TO START AND RESET THE GAME
  /**
   * resetGame
   * resets a game, if the player want do it
   */
  resetGame(): void {

    // sets the function to execute when the popup is confirmed
    // stops the time counter, finish the game and returns the board to his origin state
    this.confirmAction = () => {  
      
      this.stopTimeCounter();

      this.showPopUp = false;
      this.gameStarted = false;
      this.playedMoves = 0;
      this.makeBoard();      
    };

    // open the popup for querying to the player
    this.openPopUp(this.languageStrings['game.reset.title'], this.languageStrings['game.reset.text'], 'confirm');
    
  }

  /**
   * startGame
   * starts a new game
   */
  startGame(): void {
    
    if (this.movesToMix === undefined ||
      this.movesToMix === null ||
      this.movesToMix < 1) {
      
      // if no value of moves to mix is defined or is lower than 1, shows a pop up to inform the player
      this.openPopUp(this.languageStrings['game.rules.title'], this.languageStrings['game.rules.moves.text'], 'alert');

    } else {

      // if moves to mix is lower than 25, question to the player if is correct
      if (this.movesToMix < 25) {
        
        // define the function to execute is player confirms
        this.confirmAction = () => {
          this.showPopUp = false;
          this.initGame();
        };

        // shows the popup
        this.openPopUp(
          this.languageStrings['game.start.title'],
          `${this.languageStrings['game.few.moves.text.1']} ${this.movesToMix} ${this.languageStrings['game.few.moves.text.2']}`,
          'confirm');
        
      } else {
        // all is correct, init the game
        this.initGame();
      }
    
    }

  }

  /**
   * initGame
   * run the actions for init a game
   */
  initGame(): void {

    // check if the game didn't was started
    if(!this.gameStarted) {
      
      // move the scroll to the position of the board and sets that the game has started
      this.gameBoard.nativeElement.scrollIntoView({ behavior: 'smooth' });      
      this.gameStarted = true;
      
      // hide the piece that occupies the free position
      this._boardService.hideFreePiece();
      this.piecesBoard = this._boardService.getPiecesBoard();      

      // init the counters of moves and time played
      this.playedMoves = 0;
      this.secondsPlayed = 0; 

      /**
       * init values for control de moves to disorder the puzzle
       *   - possibleMoves: list of possible moves to execute when the app is mixin the puzzle. This list is updated each time that a piece is moved
       *   - moveCounter: counter to control the number of moves executed while the app is mixing the puzzle
       *   - newMove: the move that can execute to mix the puzzle
       *   - indexLastMove: for control if the type of movement choosed to mix the puzzle is in the list of last moves
       *   - lastTwoMoves: the last two moves executed by the app when is mixing the puzzle. Is used to no repeat a movement inmediatly while mixing
       */
      //
      let moveCounter = 0;
      let possibleMoves: Array<string> = [];      
      let newMove: string = '';
      let indexLastMove = -1;      
      let lastTwoMoves: Array<string> = ['', ''];

      // interval to repeat the action of move a piece each 100 milliseconds
      let moves = setInterval(() => {

        // get the possibles moves
        possibleMoves = this._boardService.possiblesMoves();

        // remove from the possible moves the 2 last used, 
        // when the number of possible moves is greater than 1
        lastTwoMoves.map((item) => {
          indexLastMove = possibleMoves.indexOf(item);
          if (indexLastMove !== -1 && possibleMoves.length > 1) {
            possibleMoves.splice(indexLastMove, 1);
          }
        });

        // choosing the move by chance from the possibles
        newMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        
        // remove the last move of the two last used and put the new
        lastTwoMoves.pop();
        lastTwoMoves.unshift(this.swapMovement(newMove));
        
        // swapping the pieces according the movement choosed
        this._boardService.swapPiecesToMove(newMove);

        // relocate the pieces on the board
        this.setStylesOfPieces();

        // update the counter of moves and checks if has finished to mix, if so, init the time counter
        moveCounter++;
        if (moveCounter >= this.movesToMix) {
          clearInterval(moves);  
          this.initTimeCounter();     
        }

      }, 100);
      
    }

  }

  /**
   * swapMovement
   * return the opposite movement received as a parameter
   * @param movement the movement to swap
   * @returns a string with the new value
   */
  swapMovement(movement: string): string {

    let value: string = '';

    switch (movement) {
      case this.moveUp:
        value = this.moveDown;
        break;
      case this.moveDown:
        value = this.moveUp;
        break;
      case this.moveLeft:
        value = this.moveRight;
        break;
      case this.moveRight:
        value = this.moveLeft;
        break;
    }

    return value;

  }

  // METHODS TO CONTROL THE PLAYED TIME
  /**
   * initTimeCounter
   * init the time counter of the game
   */
  private initTimeCounter(): void {

    this.intervalSecondsPlayer = setInterval(() => {
      this.secondsPlayed++;
    }, 1000);

  }
  
  /**
   * stopTimeCounter
   * clears the interval for the time counter of the game
   */
  private stopTimeCounter(): void {

    clearInterval(this.intervalSecondsPlayer);
    this.intervalSecondsPlayer = null;
    
  }

  // METHODS TO CONTROL THE PULSATIONS ON THE KEYBOARD
  /**
   * keyDown
   * move the pieces of the puzzle when the player press a key
   * @param event the key that is has pressed
   */
  keyDown(event): void {

    if(this.gameStarted && !this.moving && !this.isKeyDown) {
      
      event.preventDefault();

      this.isKeyDown = true;

      switch(event.keyCode) {

        case 37: // left

          if(this.piecesBoard[this._boardService.getFreeRow()] !== undefined &&
            this.piecesBoard[this._boardService.getFreeRow()][this._boardService.getFreeColumn() + 1] !== undefined) {
            this.animeMovement(this._boardService.getFreeRow(), this._boardService.getFreeColumn() + 1, this.moveLeft);
          }
          
        break;
        case 38: // up

          if (this.piecesBoard[this._boardService.getFreeRow() + 1] !== undefined &&
            this.piecesBoard[this._boardService.getFreeRow() + 1][this._boardService.getFreeColumn()] !== undefined) {
            this.animeMovement(this._boardService.getFreeRow() + 1, this._boardService.getFreeColumn(), this.moveUp);
          }

        break;
        case 39: // right;
        
          if(this.piecesBoard[this._boardService.getFreeRow()] !== undefined &&
            this.piecesBoard[this._boardService.getFreeRow()][this._boardService.getFreeColumn() - 1] !== undefined) {
            this.animeMovement(this._boardService.getFreeRow(), this._boardService.getFreeColumn() - 1, this.moveRight);
          }

        break;
        case 40: // down;

          if (this.piecesBoard[this._boardService.getFreeRow() - 1] !== undefined &&
            this.piecesBoard[this._boardService.getFreeRow() - 1][this._boardService.getFreeColumn()] !== undefined) {
            this.animeMovement(this._boardService.getFreeRow() - 1, this._boardService.getFreeColumn(), this.moveDown);
          }

        break;

      }

    }

  }

  /**
   * keyUp
   * starts a timeout and, when timeout finish, sets the control of key pressed to false
   */
  keyUp(): void {
    let timeOut = setTimeout(() => {
      this.isKeyDown = false;
      clearTimeout(timeOut);
    }, 500);
  }
  
}