import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { PersonalImage } from '../interfaces/personal-image';

/**
 * ImagesService
 * this services manage the images and albums that contains them
 */
@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  stringFile: string = 'image';  
  personalAlbumKey: string = 'pa';
  personalAlbum: Array<PersonalImage> = [];
  personalAlbumSize: number;
  defaultAlbumKey: string = 'default';

  imagesSets: any = {
    'default': {
      'title': 'album.various',
      'images': 6,
      'personal': false
    },
    'barcelona': {
      'title': 'album.barcelona',
      'images': 6,
      'personal': false
    },
    'tarragona': {
      'title': 'album.tarragona',
      'images': 6,
      'personal': false
    }
  };
  
  /**
   * constructor
   * @param _localStorage service for manage the local storage
   */
  constructor(private _localStorage: StorageService) { 

    this.getPersonalAlbum();
    this.personalAlbumSize = this.getPersonalAlbumSize();
    
    this.imagesSets[this.personalAlbumKey] = {
      'title': 'album.user',
      'images': this.personalAlbumSize,
      'personal': true
    };

  }

  /**
   * getDefaultAlbumKey
   */
  getDefaultAlbumKey(): string {
    return this.defaultAlbumKey;
  }

  /**
   * getPersonalAlbumKey
   */
  getPersonalAlbumKey(): string {
    return this.personalAlbumKey;
  }

  /**
   * getPersonalAlbumImageId
   * @param index 
   */
  getPersonalAlbumImageId(index: number): number {
    return this.personalAlbum[index].id;
  }

  /**
   * getAlbum
   * get the content of an images album
   * @param album the name of the album to obtain
   * @returns a list with the urls of the images contained into the album
   */
  getAlbum(album: string = 'default'): Array<string> {

    let list: Array<string> = [];    

    let init: number = album === this.personalAlbumKey ? 0 : 1;
    let end: number = album === this.personalAlbumKey ? this.personalAlbumSize : this.imagesSets[album].images + 1;

    for(let i = init; i < end; i++) {
      list.push(this.getImageFromAlbum(album, album === this.personalAlbumKey ? this.personalAlbum[i].id : i));
    }

    return list;

  }

  /**
   * getImageFromAlbum
   * @param album the album that contains the image to get
   * @param board the index of the image inside the album
   * @returns a string that is the path of the image
   */
  getImageFromAlbum(album: string, board: number): string {
    
    let idx: number = board;
    
    let file: string = '';
    let path: string = `${environment.imageBasePath}${album}/`;

    if (this.imagesSets[album].personal) {
      idx = this.personalAlbum.findIndex((item) => {
        return item.id === board;
      });  
      if(idx !== -1) {    
        file = this.personalAlbum[idx].data;
      }
    } else {
      file = `${path}${this.stringFile}${idx.toString()}.jpg`;
    }

    return file;

  }

  /**
   * getAlbums
   * queries the list of image albums of the app
   * @returns a list of object, where each object contains information of an images album
   */
  getAlbums(): Array<any> {
  
    let keys: Array<string> = Object.keys(this.imagesSets);

    let list: Array<any> = [];

    keys.map((element) => {
      if(this.imagesSets[element].images > 0) {
        list.push ({
          'value': element,
          'title': this.imagesSets[element].title
        });
      }
    });

    return list;

  }

  /**
   * personalAlbumExists
   * checks if the album of user images exists on the local storage
   * @returns true or false, if exists or not, or null on error
   */
  personalAlbumExists(): boolean | null {
    return this._localStorage.keyExists('LOCAL', this.personalAlbumKey);
  }

  /**
   * getPersonalAlbum
   * loads the information of the personal album from the local storage to this service
   */
  getPersonalAlbum(): void {  
    if(this.personalAlbumExists()) {      
      this.personalAlbum = this._localStorage.getJSONValue('LOCAL', this.personalAlbumKey);    
    }
  }

  /**
   * getPersonalAlbum
   * get the number of images stored in the personal album
   * @returns a number with the size of the personal album
   */
  getPersonalAlbumSize(): number {

    if(this.personalAlbum === undefined || this.personalAlbum === null) {
      return 0;
    } else {
      return this.personalAlbum.length;
    }

  }

  /**
   * addImagePersonalAlbum
   * adds a image into the personal album
   * @param image the image to add
   * @returns true if the image that added successfully, false if not
   */
  addImagePersonalAlbum(image: string): boolean {

    let tempAlbum: Array<PersonalImage> = this.personalAlbum;  
    let newImage: PersonalImage = {
      data: image,
      id: (new Date().getTime())
    }
    tempAlbum.push(newImage);
    return this.savePersonalAlbum(tempAlbum);

  }

  /**
   * deleteImagePersonalAlbum
   * @param id 
   */
  deleteImagePersonalAlbum(id: number): boolean {

    this.personalAlbum.splice(id, 1);
    let deleteImage: boolean = this.savePersonalAlbum(this.personalAlbum);
    return deleteImage;

  }

  /**
   * savePersonalAlbum
   * @param tempAlbum 
   */
  private savePersonalAlbum(tempAlbum: Array<PersonalImage>): boolean {

    let saveAlbum = this._localStorage.setJSONValue('LOCAL', this.personalAlbumKey, tempAlbum);

    if (saveAlbum) {
      this.personalAlbum = tempAlbum;
      this.personalAlbumSize = this.getPersonalAlbumSize();
      this.imagesSets[this.personalAlbumKey]['images'] = this.personalAlbumSize;
    }

    return saveAlbum;

  }

  /**
   * getSizeAlbum
   * gets the size of a images album
   * @param album the album to get his size
   * @returns a number as the size of the album
   */
  getSizeAlbum(album: string): number {
    return this.imagesSets[album].images;
  }

  /**
   * getNameAlbum
   * gets the name of an images album
   * @param album el indice del albúm del que se quiere obtener el nombre
   * @returns a string that contains the name of the album
   */
  getNameAlbum(album: string): string {
    return this.imagesSets[album].name;    
  }

}