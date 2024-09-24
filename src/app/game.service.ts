import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public originalMaze: string[][] = [];
  private maze: string[][] = [];
  private playerPosition = { x: 0, y: 0 };
  private keyPosition = { x: 0, y: 0 };
  private exitPosition = { x: 0, y: 0 };
  private monsters: { x: number, y: number }[] = [];
  private hasKey = false;
  private stepCount = 0;
  private mazeSize = 15;
  private canExit = false;

  constructor() {}

  generateMaze(): void {
    this.maze = Array(this.mazeSize).fill(null).map(() => Array(this.mazeSize).fill('#'));
    this.stepCount = 0;
    this.hasKey = false;
    this.monsters = [];

    this.recursiveBacktracker(1, 1);
    this.addExtraPaths();
    this.placeElementsRandom();
  }

  setMaze(maze: string) {
    this.maze = this.stringToMatriz(maze);
    this.stepCount = 0;
    this.hasKey = false;
    this.placeElements();
  }

  private recursiveBacktracker(x: number, y: number): void {
    const directions = [
      [0, 2], [2, 0], [0, -2], [-2, 0]
    ].sort(() => Math.random() - 0.5);

    this.maze[y][x] = ' ';

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < this.mazeSize - 1 && ny > 0 && ny < this.mazeSize - 1 && this.maze[ny][nx] === '#') {
        this.maze[y + dy/2][x + dx/2] = ' ';
        this.recursiveBacktracker(nx, ny);
      }
    }
  }

  private addExtraPaths(): void {
    const extraPaths = Math.floor(this.mazeSize * 0.1);
    for (let i = 0; i < extraPaths; i++) {
      let x = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
      let y = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
      if (x % 2 === 0) x = x - 1;
      if (y % 2 === 0) y = y - 1;
      if (this.maze[y][x] === '#' && this.countAdjacentWalls(y, x) >= 2) {
        this.maze[y][x] = ' ';
      }
    }
  }

  private countAdjacentWalls(y: number, x: number): number {
    let count = 0;
    if (this.maze[y-1][x] === '#') count++;
    if (this.maze[y+1][x] === '#') count++;
    if (this.maze[y][x-1] === '#') count++;
    if (this.maze[y][x+1] === '#') count++;
    return count;
  }

  private placeElements(): void {
   
    this.monsters = [];

    for (let x = 0; x < this.maze.length; x++) {
      for (let y = 0; y < this.maze[x].length; y++) {
        switch (this.maze[x][y]) {
          case 'P':
            this.playerPosition = { x, y };
            break;
          case 'K':
            this.keyPosition = { x, y };
            break;
          case 'E':
            this.exitPosition = { x, y };
            break;
          case 'M':
            this.monsters.push({ x, y });
            break;
        }
      }
    }
  }

  private placeElementsRandom(): void {
    const emptySpots = this.getEmptySpots();
    
    this.playerPosition = this.getRandomSpot(emptySpots);
    this.maze[this.playerPosition.x][this.playerPosition.y] = 'P';

    this.keyPosition = this.getRandomSpot(emptySpots);
    this.maze[this.keyPosition.x][this.keyPosition.y] = 'K';

    this.exitPosition = this.getRandomSpot(emptySpots);
    this.maze[this.exitPosition.x][this.exitPosition.y] = 'E';

    for (let i = 0; i < 3; i++) {
      const monsterPos = this.getRandomSpot(emptySpots);
      this.monsters.push(monsterPos);
      this.maze[monsterPos.x][monsterPos.y] = 'M';
    }
  }

  private getEmptySpots(): {x: number, y: number}[] {
    const emptySpots = [];
    for (let i = 0; i < this.mazeSize; i++) {
      for (let j = 0; j < this.mazeSize; j++) {
        if (this.maze[i][j] === ' ') {
          emptySpots.push({x: i, y: j});
        }
      }
    }
    return emptySpots;
  }

  private getRandomSpot(spots: {x: number, y: number}[]): {x: number, y: number} {
    const index = Math.floor(Math.random() * spots.length);
    const spot = spots[index];
    spots.splice(index, 1);
    return spot;
  }

  getMaze(): string[][] {
    return this.maze;
  }

  movePlayer(direction: 'up' | 'down' | 'left' | 'right'): { success: boolean, message: string } {
    let newX = this.playerPosition.x;
    let newY = this.playerPosition.y;

    switch (direction) {
      case 'up': newX--; break;
      case 'down': newX++; break;
      case 'left': newY--; break;
      case 'right': newY++; break;
    }

    this.stepCount++;
    
    if (this.isValidMove(newX, newY)) {
      
      this.maze[this.playerPosition.x][this.playerPosition.y] = ' ';
      this.playerPosition = { x: newX, y: newY };

      if (this.isKey(newX, newY)) {
        this.hasKey = true;
        this.maze[newX][newY] = 'P';
        return { success: true, message: '¡Has encontrado la llave!' };
      }

      if (this.isExit(newX, newY)) {
        if (this.hasKey) {
          return { success: true, message: '¡Has ganado!' };
        } else {
          this.canExit = true;
          this.maze[newX][newY] = 'E';
          return { success: true, message: 'Necesitas la llave para salir.' };
        }
      } else {
        this.maze[this.exitPosition.x][this.exitPosition.y] = 'E';
      }

      if (this.isMonster(newX, newY)) {
        this.removeMonster(newX, newY);
        this.maze[newX][newY] = 'P';
        this.stepCount++; // Cuesta un paso extra derrotar al monstruo
        return { success: true, message: '¡Has derrotado a un monstruo!' };
      }

      this.maze[newX][newY] = 'P';
      return { success: true, message: 'Te has movido.' };
    }

    return { success: false, message: 'Movimiento no válido.' };
  }

  private isValidMove(x: number, y: number): boolean {
    return x >= 0 && x < this.mazeSize && y >= 0 && y < this.mazeSize && this.maze[x][y] !== '#';
  }

  private isKey(x: number, y: number): boolean {
    return x === this.keyPosition.x && y === this.keyPosition.y;
  }

  private isExit(x: number, y: number): boolean {
    return x === this.exitPosition.x && y === this.exitPosition.y;
  }

  private isMonster(x: number, y: number): boolean {
    return this.monsters.some(m => m.x === x && m.y === y);
  }

  private removeMonster(x: number, y: number): void {
    this.monsters = this.monsters.filter(m => m.x !== x || m.y !== y);
  }

  getStepCount(): number {
    return this.stepCount;
  }

  hasPlayerWon(): boolean {
    return this.hasKey && this.isExit(this.playerPosition.x, this.playerPosition.y);
  }


  stringToMatriz(input: string): string[][] {
    // Eliminar espacios en blanco y dividir el string en un array
    const caracteres = input.replace(/\s/g, '').split(',');
    
    // Calcular el tamaño de la matriz (asumiendo que es cuadrada)
    const tamanio = Math.sqrt(caracteres.length);
    
    // Crear la matriz
    const matriz: string[][] = [];
    
    for (let i = 0; i < tamanio; i++) {
      const fila: string[] = [];
      for (let j = 0; j < tamanio; j++) {
        const indice = i * tamanio + j;
        fila.push(caracteres[indice]);
      }
      matriz.push(fila);
    }
    debugger;
    return matriz;
  };
}