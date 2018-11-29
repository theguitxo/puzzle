import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TitleComponent } from './components/title/title.component';
import { BoardSelectorComponent } from './components/board-selector/board-selector.component';
import { MovesCounterComponent } from './components/moves-counter/moves-counter.component';
import { PopUpComponent } from './components/pop-up/pop-up.component';
import { GameSettingsComponent } from './components/game-settings/game-settings.component';
import { TimeCounterComponent } from './components/time-counter/time-counter.component';

import { ImageCropperModule } from 'ngx-image-cropper';
import { NguCarouselModule } from '@ngu/carousel';

import { StorageService } from './services/storage.service';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from './pipes/translate.pipe';
import { TranslateService } from './services/translate.service';

export function setupTranslateFactory(service: TranslateService): Function {
  return () => service.use('es');
}

@NgModule({
  declarations: [
    AppComponent,
    TitleComponent,
    BoardSelectorComponent,
    MovesCounterComponent,
    PopUpComponent,
    GameSettingsComponent,
    TimeCounterComponent,
    TranslatePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ImageCropperModule,
    NguCarouselModule,
    FontAwesomeModule,
    HttpClientModule
  ],
  providers: [
    StorageService,
    TranslateService,
    {
      provide: APP_INITIALIZER,
      useFactory: setupTranslateFactory,
      deps: [TranslateService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
