import { Component, OnInit, Input, Output, EventEmitter, Renderer2, Inject, HostListener, ViewChild, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ImagesService } from '../../services/images.service';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { TranslateService } from '../../services/translate.service';
import { Subscription } from 'rxjs';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

declare var $: any;

@Component({
  selector: 'app-board-selector',
  templateUrl: './board-selector.component.html',
  styleUrls: ['../../common.styles.scss', './board-selector.component.scss']
})
export class BoardSelectorComponent implements OnInit, OnDestroy, OnChanges {

  @HostListener('window:focus', ['$event']) onfocus(event) { 
    
    let timeOutWindowFocus = setTimeout(() => {
    
      if(this.imageChangedEvent === null) {
        this.loadingImage = false;
      }

      clearInterval(timeOutWindowFocus);
      timeOutWindowFocus = null;

    }, 100);

  }

  @Input('boards') boards: Array<string> = [];
  @Input('optionsDisabled') optionsDisabled: boolean;
  @Input('albumSelected') albumSelected: string;

  @Output('changeBoard') changeBoard: EventEmitter<number> = new EventEmitter<number>();
  @Output('addBoard') addBoard: EventEmitter<string> = new EventEmitter<string>();
  @Output('imageNotValid') imageNotValid: EventEmitter<string> = new EventEmitter<string>();
  @Output('changeAlbum') changeAlbum: EventEmitter<any> = new EventEmitter<any>();
  @Output('deleteBoard') eventDeleteBoard: EventEmitter<number> = new EventEmitter<number>();

  showImageLoader: boolean = false;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  loadingImage: boolean = false;
  
  showBoards: boolean = false;
  showHideButtonText: string = '';

  albumList: Array<any> = [];

  dateForImagesRequests: number;

  languageStrings: any = {};
  languageSubscription: Subscription;
  
  public carouselTile: NguCarouselConfig = {
    grid: { 
      xs: 3, 
      sm: 3, 
      md: 3, 
      lg: 3, 
      all: 0
    },
    slide: 2,
    speed: 250,
    point: {
      visible: false
    },
    load: 3,
    velocity: 0,
    touch: true,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    loop: false
  };

  @ViewChild('carousel') carousel: NguCarousel;
  
  // icons
  icons: any = {
    'close': faTimesCircle
  }

  constructor(@Inject(DOCUMENT) document,
              private renderer: Renderer2,
              private _imagesService: ImagesService,
              private _translate: TranslateService) {
    
    this.languageSubscription = this._translate.getLanguageChanged().subscribe(() => {
      this.setLanguageStrings();
      this.setShowHideButtonText();
    })

  }

  /**
   * @name ngOnInit
   */
  ngOnInit(): void {

    this.albumList = this._imagesService.getAlbums();
    this.setLanguageStrings();
    this.setShowHideButtonText();
    
  }
  
  /**
   * ngOnChanges
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges): void {

    if(changes['albumSelected'] !== undefined &&
      (changes['albumSelected']['currentValue'] === this._imagesService.getPersonalAlbumKey() ||
      changes['albumSelected']['currentValue'] === this._imagesService.getDefaultAlbumKey())) {        
        this.albumList = this._imagesService.getAlbums();          
        this.showBoards = false;
        this.setShowHideButtonText();
    }

    if(changes['optionsDisabled'] !== undefined &&
      changes['optionsDisabled']['currentValue'] === true) {

      this.optionsDisabled = !this.optionsDisabled;
      
      this.showBoards = false;
      this.setShowHideButtonText();
      $('#availableBoards').collapse('hide');

      this.optionsDisabled = !this.optionsDisabled;

    } 
         
  }

  /**
   * @name ngOnDestroy
   */
  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }

  /**
   * @name setLanguageStrings
   */
  setLanguageStrings(): void {

    this.languageStrings = {
      'hide.images': this._translate.getValue('btn.hide.images'),
      'show.images': this._translate.getValue('btn.show.images')
    };

  }

  /**
   * showCarouselButtons
   */
  showCarouselButtons(): boolean {
    return (this.boards.length > 3);
  }

  /**
   * resetCarousel
   */
  resetCarousel(): void {
    this.carousel.reset(false);
  }

  /**
   * @name includeAlbum
   * @param album 
   */
  includeAlbum(album: string): boolean {
    return !((!this.albumSelected && album === 'default') || this.albumSelected === album);    
  }

  /**
   * @name selectAlbum
   * @param album 
   * @param index 
   */
  selectAlbum(album: string, index: number = 0): void {    
    this.changeAlbum.emit({ album, index });
    this.resetCarousel();
    if(this.showBoards) {
      this.showHideBoards();
    }
  }

  /**
   * @name setShowHideButtonText
   */
  setShowHideButtonText(): void {
    this.showHideButtonText = this.showBoards ? this.languageStrings['hide.images'] : this.languageStrings['show.images'];
  }

  /**
   * @name showHideBoards
   */
  showHideBoards(): void {
    this.showBoards = !this.showBoards;
    this.setShowHideButtonText();    
  }

  /**
   * selectBoard
   * @param idx 
   */
  selectBoard(idx: number): void {
    this.changeBoard.emit(idx);
    this.showHideBoards();
    $('#availableBoards').collapse('hide');
  }

  /**
   * deleteBoard
   * @param idx 
   */
  deleteBoard(idx: number): void {
    this.eventDeleteBoard.emit(idx);
  }

  /**
   * openImageLoader
   */
  openImageLoader(): void {
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showImageLoader = true;
  }

  /**
   * closeImageLoader
   */
  closeImageLoader(): void {
    this.renderer.setStyle(document.body, 'overflow', 'visible');
    this.showImageLoader = false;
  }

  /**
   * selectImage
   */
  selectImage(): void {
    this.addBoard.emit(this.croppedImage);
    this._imagesService.addImagePersonalAlbum(this.croppedImage);
    this.imageChangedEvent = null;
    this.croppedImage = '';    
    this.selectAlbum(
      this._imagesService.personalAlbumKey, 
      this._imagesService.getSizeAlbum(this._imagesService.personalAlbumKey) - 1);
    this.showBoards = false;
    this.setShowHideButtonText();    
    this.closeImageLoader();  
  }
  
  /**
   * fileChangeEvent
   * @param event 
   */
  fileChangeEvent(event: any): void {   

    if (this.isValidImageLoaded(event)) {
      
      this.imageChangedEvent = event;  

    } else {

      this.imageChangedEvent = null;
      this.loadingImage = false;
      
      this.imageNotValid.emit('Image format not valid!');
      
    }
    
  }

  /**
   * imageCropped
   * @param image 
   */
  imageCropped(image: string) {
    this.croppedImage = image;
  }

  /**
   * imageLoaded
   */
  imageLoaded(): void {        
    this.loadingImage = false;
  }

  /**
   * loadImageFailed
   */
  loadImageFailed(): void {
    this.loadingImage = false;
  }

  /**
   * loadImageClick
   */
  loadImageClick(): void {
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.loadingImage = true;
  }

  /**
   * isValidImageLoaded
   * @param data 
   */
  isValidImageLoaded(data: any): boolean {
        
    let imageType: string = '';

    if(data.target !== undefined &&
      data.target.files !== undefined &&
      data.target.files[0] !== undefined) {

      imageType = data.target.files[0].type;

    }

    let [object, type] = imageType.split('/');

    return (object === 'image');
    
  }


}