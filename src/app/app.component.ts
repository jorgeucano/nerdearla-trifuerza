import { Component, HostListener, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { GameService } from './game.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [JsonPipe]
})
export class AppComponent implements OnInit {
  maze: string[][] = [];
  statusMessage: string = '';
  stepCount: number = 0;

  constructor(private gameService: GameService) {}

  showFight = false;
  user: any;
  mazes: any = [];
  gameId = '';
  om: string[][] = [];
  userCreate = {
    email: '',
    password: ''
  }


  ngOnInit() {
    // this.startNewGame();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.move('up');
        break;
      case 'ArrowDown':
        this.move('down');
        break;
      case 'ArrowLeft':
        this.move('left');
        break;
      case 'ArrowRight':
        this.move('right');
        break;
    }
  }

  startNewGame() {
    // if(!this.user) {
    //   this.statusMessage = 'Debes iniciar sesion para jugar';
    //   return;
    // }
    this.gameService.generateMaze();
    this.updateGameState();
    this.statusMessage = 'Nuevo juego iniciado. ¡Encuentra la llave y llega a la salida!';
    
  }

  move(direction: 'up' | 'down' | 'left' | 'right') {
    const result = this.gameService.movePlayer(direction);
    this.updateGameState();
    this.statusMessage = result.message;


    if (this.statusMessage === '¡Has derrotado a un monstruo!') {
      this.showFight = true;
      setTimeout(() => {
        this.showFight = false; 
      }, 300);
    }

    if (this.gameService.hasPlayerWon()) {
      this.statusMessage = '¡Felicidades! Has completado el laberinto.';
      // terminar el laberinto, agregar el mapa y cantidad de pasos
      // tambien agregar el laberinto a la lista 
      // tener una lista de laberintos
      this.addScore();
    }
  }

  private updateGameState() {
    this.maze = this.gameService.getMaze();
    this.stepCount = this.gameService.getStepCount();
  }

  getCellContent(cell: string): string {
    switch(cell) {
      case 'P': return '🧝'; // Jugador
      case 'K': return '🔑'; // Llave
      case 'E': return '🚪'; // Salida
      case 'M': return '👹'; // Monstruo
      case '#': return '🧱'; // Pared
      default: return '  '; // Espacio vacío
    }
  }

  addScore() {
    
  }

  listMaze() {
    
  }

  playMaze(game: any) {
    console.log('start to play');
    this.gameService.setMaze(game.maze);
    this.updateGameState();
    this.statusMessage = 'Nuevo juego iniciado. ¡Encuentra la llave y llega a la salida!';
  }


  createUser(){

  }

  loginUserPassword() {
    
  }

  loginWithGoogle() {
    
  }
    
}