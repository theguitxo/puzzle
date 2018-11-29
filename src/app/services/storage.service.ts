import { Injectable } from '@angular/core';

/**
 * StorageService
 * class for manage the local storage of the browser
 */
@Injectable()
export class StorageService {

  private session: string = 'SESSION';
  private local: string = 'LOCAL';

  /**
   * constructor
   */
  constructor() { }

  /**
   * store
   * this function permits choose a storage by type
   * @param tipo a string that indicates the type of storage to use
   *             SESSION = session storage, LOCAL = local storage
   * @returns null if the type of storage isn't indicted, otherwise, the storage
   */
  private store(tipo: string): any | null {

    if(tipo.toUpperCase() === this.session) {
      return sessionStorage;
    } else if(tipo.toLocaleUpperCase() === this.local) {
      return localStorage
    }

    return null;

  }

  /**
   * setValue
   * saves a value into the storage
   * @param type the type of storage to use
   * @param key name of the key to save the value
   * @param value the value that be saved
   * @returns true if the value was saved correctly, otherwise, false
   */
  setValue(type: string, key: string, value: string): boolean {

    try{
      this.store(type).setItem(key.toUpperCase(), value);
      return true;
    }catch(e) {
      return false;
    }

  }

  /**
   * getValue
   * get a value of the storage
   * @param type the type of storage where get the value
   * @param key the key that contains the value to get
   * @returns the value, if it exists into the storage, otherwise, null
   */
  getValue(type: string, key: string): null | string {

    try {
      return this.store(type).getItem(key.toUpperCase());
    }catch(e) {
      return null;
    }

  }

  /**
   * keyExists
   * checks if a key exists into the local storage
   * @param type the type of storage where check the key
   * @param key the key to check
   * @returns true if exists, false if not, null in case of error
   */
  keyExists(type: string, key: string): null | boolean {

    try {
      return this.store(type).hasOwnProperty(key.toUpperCase());
    } catch(e) {
      return null;
    }

  }

  /**
   * deleteValue
   * delete a value of the local storage
   * @param type the type of storage where is the value to delete
   * @param key the key that contains the value to delete
   */
  deleteValue(type: string, key: string): boolean | null {

    try {
      this.store(type).removeItem(key.toUpperCase());
    } catch(e) {
      return null;
    }

  }
  
  /**
   * getJSONValue
   * return a value of the storage as a JSON data
   * @param type the type of storage where get the value
   * @param key the key that contains the value to get
   * @returns the value, if it exists into the storage, otherwise, null
   */
  getJSONValue(type: string, key: string): any | null {

    let valueString = this.getValue(type, key);

    let result: any;

    if(valueString !== null) {
      
      try {
        result = JSON.parse(valueString);
      } catch(e) {
        result = null;
      }

    } else {
      return result = null;
    }

    return result;

  }

  /**
   * setJSONValue
   * saves a values into the storage as a JSON data
   * @param type the type of storage to use
   * @param key name of the key to save the value
   * @param value the value that be saved
   * @returns true if the value was saved correctly, otherwise, false
   */
  setJSONValue(type: string, key: string, value: any): boolean {

    let valueString: string = '';

    try {
      valueString = JSON.stringify(value);
    } catch(e) {
      return false;
    }

    return this.setValue(type, key, valueString);
    
  }

}
