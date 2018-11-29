import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Scores } from '../interfaces/scores';
import { Subject, Observable } from 'rxjs';
import { ImagesService } from './images.service';

@Injectable()
export class ScoresService {

  scores: Array<Scores> = [];
  scoresKey: string = 'scoresBoard';

  // a subject to broadcast when the load of a language translations was finished
  private subject = new Subject<void>();

  /**
   * constructor
   * @param _storageService 
   */
  constructor(private _storageService: StorageService,
              private _imagesService: ImagesService) { }

  /**
   * loadScores
   * loads the scores from the local storage
   */
  loadScores(): void {

    if(this._storageService.keyExists('LOCAL', this.scoresKey)) {
      this.scores = this._storageService.getJSONValue('LOCAL', this.scoresKey);
    }

  }

  /**
   * getScores
   * gets the scores information previously loaded with the funcion 'loadScores'
   * @returns An array of 'Scores' objects
   */
  getScores(): Array<Scores> {
    return this.scores;
  }

  /**
   * saveScoreGame
   * @param album 
   * @param board 
   * @param moves 
   * @param time 
   * @param movesMix 
   */
  saveScoreGame(album: string, board: number, moves: number, time: number, movesMix: number): void {

    let boardId = album === this._imagesService.getPersonalAlbumKey() ? this._imagesService.getPersonalAlbumImageId(board - 1) : board;

    let item: Scores = {
      'album': album,
      'board': boardId,
      'date': new Date().getTime(),
      'moves': moves,
      'time': time,
      'movesMix': movesMix
    }

    this.scores.push(item);

    this.saveScoresOnLocalStorage();

  }

  private saveScoresOnLocalStorage(): void {
    
    this._storageService.setJSONValue('LOCAL', this.scoresKey, this.scores);
    this.subject.next();

  }

  /**
   * getScoresSaved
   * returns the Subject that controls when the scores are saved
   * @returns {Observable} a Subject transformed as a Observable
   */
  getScoresSaved(): Observable<any> {

    return this.subject.asObservable();

  }

  /**
   * deleteByBoard
   * @param indexBoard 
   */
  deleteByBoard(indexBoard: number): void {
        
    let indexToDelete = null;

    while(indexToDelete !== -1) {

      indexToDelete = this.scores.findIndex((item) => {
        return  item.board === this._imagesService.getPersonalAlbumImageId(indexBoard);
      });
      
      if(indexToDelete !== -1) {
        this.scores.splice(indexToDelete, 1);
        this.saveScoresOnLocalStorage();
      }

    }

  }

}
