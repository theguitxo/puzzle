import { Injectable } from '@angular/core';

@Injectable()
export class BoardService {

  // a bidimensional array that contains the information of the pieces of the puzzle
  piecesBoard: Array<Array<any>> = [];

  // to inform whats is the free position of the puzzle
  freeColumn: number;
  freeRow: number;

  // strings of the possible moves for pieces
  moveUp: string = 'UP';
  moveDown: string = 'DOWN';
  moveLeft: string = 'LEFT';
  moveRight: string = 'RIGHT';

  level: number;

  /**
   * constructor
   */
  constructor() { }

  // GETTERS & SETTERS //

  /**
   * getFreeColumn
   */
  getFreeColumn(): number {
    return this.freeColumn;
  }

  /**
   * getFreeRow
   */
  getFreeRow(): number {
    return this.freeRow;
  }

  /**
   * setFreeColumn
   * @param value 
   */
  setFreeColumn(value: number): void {
    this.freeColumn = value;
  }

  /**
   * setFreeRow
   * @param value 
   */
  setFreeRow(value: number): void {
    this.freeRow = value;
  }
  
  /**
   * setLevel
   * @param value 
   */
  setLevel(value: number): void {
    this.level =  value;    
  }

  /**
   * getLevel
   */
  getLevel(): number {
    return this.level;
  }

  /**
   * getPiecesBoard
   */
  getPiecesBoard(): Array<Array<string>> {
    return this.piecesBoard;
  }

  // METHODS TO MANAGE THE GAME BOARD //
  /**
   * makeBoard
   * Fills the array with the information of the pieces for a board of the puzzle
   * @param level a number that indicate the number of pieces by side 
   */
  makeBoard(): Array<Array<any>> {

    this.piecesBoard = new Array(this.level).fill(new Array(this.level).fill({})).map((row, rowidx) => {
      row = row.map((column, columnidx) => {
        // object for store the piece information
        column = {
          'visible': true,
          'originRow': rowidx,
          'originColumn': columnidx
        };
        return column;
      });
      return row;
    });

    // set the row and column free
    this.freeColumn = this.freeRow = this.level - 1;
  
    return this.piecesBoard;

  }

  /**
   * setStyleOfPieces
   * @param bgImage 
   * @param boardSize 
   * @param level 
   */
  setStyleOfPieces(bgImage: string, boardSize: number): Array<Array<any>> {

    //let bgImage: string = this.boards[this.boardSelected];

    let piecePosition = 100 / (this.level - 1);

    this.piecesBoard = this.piecesBoard.map((row) => {
      row = row.map((column) => {
        column['style'] = {
          'width': `${(100 / this.level) - 0.6}%`,
          'margin': '0.3%',
          'opacity': 1,
          'background-position': `${column['originColumn'] * piecePosition}% ${column['originRow'] * piecePosition}%`,
          'background-image': `url("${bgImage}")`,
          'background-size': `${boardSize}px`
        }
        return column;
      });
      return row;
    });

    this.piecesBoard[this.freeRow][this.freeColumn]['style']['opacity'] = 0;

    return this.piecesBoard;

  }

  checkBoard(): boolean {
    
    return this.piecesBoard.every((row: any, idxrow: number) => {
      return row.every((piece: any, idxcolumn: number) => {
        return (idxrow === piece['originRow'] && idxcolumn === piece['originColumn']);
      });
    });

  }

  // METHODS TO MOVE THE PIECES //

  /**
  * whatMoveIsAvailable
  * check what movement is available about a piece of puzzle
  * @param row number of row where is the piece
  * @param column number of column where is the piece
  * @returns null if any movement is possible, otherwise, a string with the movement available
  */
  whatMoveIsAvailable(row: number, column: number): string | null {

    let result: string | null = null;

    // check if is possible move up
    if (this.isMoveUpAvailable(row, column)) {

      result = this.moveUp;

    }

    // check if is possible move down
    if (this.isMoveDownAvailable(row, column)) {

      result = this.moveDown;

    }

    // check if is possible move left
    if (this.isMoveLeftAvailable(row, column)) {

      result = this.moveLeft;

    }

    // check if is possible move right
    if (this.isMoveRightAvailable(row, column)) {

      result = this.moveRight;

    }

    return result;

  }

  /**
   * isPositionFree
   * check if a position of the puzzle as free (don't have any piece)
   * @param row row where is the position to check
   * @param column column where is the position to check
   * @returns true if is free, false if not
   */
  private isPositionFree(row: number, column: number): boolean {
    return (!this.piecesBoard[row][column]['visible'])
  }

  /**
   * isMoveUpAvailable
   * @param row 
   * @param column 
   */
  private isMoveUpAvailable(row: number, column: number): boolean {

    let posUp = row - 1;

    return (this.piecesBoard[posUp] !== undefined &&
      this.piecesBoard[posUp][column] !== undefined &&
      this.isPositionFree(posUp, column));

  }

  /**
   * isMoveDownAvailable
   * @param row 
   * @param column 
   */
  private isMoveDownAvailable(row: number, column: number): boolean {

    let posDown = row + 1;

    return (this.piecesBoard[posDown] !== undefined &&
      this.piecesBoard[posDown][column] !== undefined &&
      this.isPositionFree(posDown, column));

  }

  /**
   * isMoveLeftAvailable
   * @param row 
   * @param column 
   */
  private isMoveLeftAvailable(row: number, column: number): boolean {

    let posLeft = column - 1;

    return (this.piecesBoard[row][posLeft] !== undefined &&
      this.isPositionFree(row, posLeft));

  }

  /**
   * isMoveRightAvailable
   * @param row 
   * @param column 
   */
  private isMoveRightAvailable(row: number, column: number): boolean {

    let posRight = column + 1;

    return (this.piecesBoard[row][posRight] !== undefined &&
      this.isPositionFree(row, posRight));

  }

  /**
   * possiblesMoves
   */
  possiblesMoves(): Array<string> {

    let moves: Array<string> = [];

    let posUp = this.getFreeRow() - 1;
    let posDown = this.getFreeRow() + 1;
    let posLeft = this.getFreeColumn() - 1;
    let posRight = this.getFreeColumn() + 1;

    // check if is possible move up
    if (this.piecesBoard[posUp] !== undefined && this.piecesBoard[posUp][this.getFreeColumn()]) {
      moves.push(this.moveDown);
    }

    // check if is possible move down
    if (this.piecesBoard[posDown] !== undefined && this.piecesBoard[posDown][this.getFreeColumn()]) {
      moves.push(this.moveUp);
    }

    // check if is possible move left
    if (this.piecesBoard[this.getFreeRow()][posLeft] !== undefined) {
      moves.push(this.moveRight);
    }

    // check if is possible move right
    if (this.piecesBoard[this.getFreeRow()][posRight] !== undefined) {
      moves.push(this.moveLeft);
    }

    return moves;

  }

  /**
   * swapPiecesToMove
   * @param movement 
   */
  swapPiecesToMove(movement: string): void {
    
    switch (movement) {
      case this.moveUp:
        this.swapPieces(this.freeRow + 1, this.freeColumn);
        break;
      case this.moveDown:
        this.swapPieces(this.freeRow - 1, this.freeColumn);
        break;
      case this.moveLeft:
        this.swapPieces(this.freeRow, this.freeColumn + 1);
        break;
      case this.moveRight:
        this.swapPieces(this.freeRow, this.freeColumn - 1);
        break;
    }

  }

  /**
   * swapPieces
   * @param originRow 
   * @param originColumn 
   */
  swapPieces(originRow: number, originColumn: number): void {

    let pieceOnOrigin = this.piecesBoard[originRow][originColumn];

    this.piecesBoard[originRow][originColumn] = this.piecesBoard[this.freeRow][this.freeColumn];
    this.piecesBoard[this.freeRow][this.freeColumn] = pieceOnOrigin;

    this.freeRow = originRow;
    this.freeColumn = originColumn;

  }

  setMovementAnimation(movement: string, row: number, column: number, boardSize: number, delayMoveAnimation: number): void {

    switch (movement) {
      case this.moveUp:
        this.piecesBoard[row][column]['style']['transform'] = `translateY(-${boardSize / this.level}px)`;
        break;
      case this.moveDown:
        this.piecesBoard[row][column]['style']['transform'] = `translateY(+${boardSize / this.level}px)`;
        break;
      case this.moveRight:
        this.piecesBoard[row][column]['style']['transform'] = `translateX(+${boardSize / this.level}px)`;
        break;
      case this.moveLeft:
        this.piecesBoard[row][column]['style']['transform'] = `translateX(-${boardSize / this.level}px)`;
        break;
    }

    this.piecesBoard[row][column]['style']['transition'] = `transform ${(delayMoveAnimation / 1000).toString()}s linear`;

  }

  // MISCELANEOUS //
  /**
   * showFreePiece
   */
  showFreePiece(): void {
    this.piecesBoard[this.level - 1][this.level - 1]['style']['opacity'] = 1;
  }

  /**
   * showFreePiece
   */
  hideFreePiece(): void {
    this.piecesBoard[this.level - 1][this.level - 1]['visible'] = false;  
  }

}
