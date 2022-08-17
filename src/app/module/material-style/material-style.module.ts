import { NgModule } from '@angular/core';
import {SharedModule} from "../../shared/shared.module";
import {MaterialVideoStyleBytedanceComponent} from './components/material-video-style-bytedance/material-video-style-bytedance.component';
import {MaterialVideoStyleComponent} from "./components/material-video-style/material-video-style.component";
import {MaterialVideoPlayerComponent} from "./components/material-video-player/material-video-player.component";
import {MaterialImageStyleComponent} from './components/material-image-style/material-image-style.component';

@NgModule({
  imports: [
    SharedModule
  ],
  exports: [MaterialVideoStyleBytedanceComponent, MaterialVideoStyleComponent, MaterialVideoPlayerComponent,MaterialImageStyleComponent],
  declarations: [MaterialVideoStyleBytedanceComponent, MaterialVideoStyleComponent, MaterialVideoPlayerComponent,MaterialImageStyleComponent],
})
export class MaterialStyleModule { }
