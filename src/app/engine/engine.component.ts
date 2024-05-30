import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { EngineService } from './engine.service';

@Component({
  selector: 'app-engine',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService) {
  }

  public ngOnInit(): void {
    this.engServ.createScene(this.rendererCanvas);
    this.engServ.loadModel();
    this.engServ.animate();
    
  }

}



/*
+-------------------+                                                                                                     
|                   |                                                                                                     
|  EngineComponent  |                                                                                                     
|                   |                                                                                                     
+---------^---------+                                                                                                     
          |                                                                                                               
          |                                                                                               
          |                                                                                                               
+---------+---------------------------------+                                                                        
|                                           |                                                                        
|  ngOnInit                                 |
|   -Pass HTML canvas element from template.|
|   -To engine service → create scene       |
|   -Calls engine service → load model      |
|   -Calls engine service → animate         |
|                                           |
|                                           |                                                                       
+---------+---------------------------------+                                                                         
          |                                                                                                               
          |                                                                                               
          |                   
+-------------------------------------------+                                                                                                     
|                                           |                                                                                                     
|  Template HTML                            |
|   -  canvas element displayed with id     |
|                                           |                                                                                                     
|                                           |                                                                                                     
+-------------------------------------------+




*/