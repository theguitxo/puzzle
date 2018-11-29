import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

// this service is inspired by another obtained from an article of Denys Vuika in medium.com
// https://medium.com/@DenysVuika/simple-i18n-support-for-your-angular-apps-6138a47eb2a9

/**
 * TrasnlateService
 * Service for translate the strings of the app
 */
@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  // object for store the texts translations
  private data: any = {};

  // a subject to broadcast when the load of a language translations was finished
  private subject = new Subject<void>();

  /**
   * constructor
   * @param http objecto for http requests 
   */
  constructor(private http: HttpClient) { }

  /**
   * use
   * loads a set of language translations
   * @param lang the language from which translations are to be loaded
   * @returns a promise that loads the translations
   */
  use(lang: string): Promise<{}> {

    return new Promise<{}>((resolve, reject) => {

      const langPath = `assets/i18n/${lang || 'en'}.json`;

      this.http.get<{}>(langPath).subscribe(
        
        (translation) => {
          this.data = Object.assign({}, translation || {});
          resolve(this.data);
        },
        (error) => {
          reject(error);
        },
        () => {
          this.subject.next();
        }

      );

    });
  }

  /**
   * getValue
   * gets the translation of a text through his key
   * @param key the key of the object that contains the string to get
   * @returns the text translated
   */
  getValue(key: string): string {

    return this.data[key] !== undefined ? this.data[key] : '';

  }

  /**
   * getLanguageChanged
   * returns the Subject that controls when the language change
   * @returns {Observable} a Subject transformed as a Observable
   */
  getLanguageChanged(): Observable<any> {

    return this.subject.asObservable();

  }

}
