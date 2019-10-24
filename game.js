/*
Add your code for Game here
 */
export default class Game {

    constructor(size) {
        this.size = size;
        this.newBoard(size);
        this.score = 0;
        this.won = false;
        this.over = false;
        this.moveListeners = [];
        this.winListeners = [];
        this.loseListeners = [];
        this.listenersOn = true;
    }

    setupNewGame() {
        this.newBoard(this.size);
        this.score = 0; //this.updateScore();
        this.won = false;
        this.over = false;
        this.moveListeners = [];
        this.winListeners = [];
        this.loseListeners = [];
        this.listenersOn = true;
    } 

    newBoard(size) {
        this.board = new Array(size * size).fill(0);
        this.addNewTile();
        this.addNewTile();
    }

    twoOrFour() {
        return (Math.round(Math.random() * 10)) > 9 ? 4 : 2;
    }

    randomIndex() {
        return (Math.floor(Math.random() * (this.size * this.size)));
    }

    addNewTile() {
        let myIndex = 0;
        let foundAnEmptyTile = false;
        while(!foundAnEmptyTile) {
            myIndex = this.randomIndex();
            if (this.board[myIndex] == 0) {
                this.board[myIndex] = this.twoOrFour();
                foundAnEmptyTile = true;
            }
        }
    }

    loadGame(gameState){
        this.board = gameState.board;
        this.score = gameState.score;
        this.won = gameState.won;
        this.over = gameState.over;
        this.size = (Math.sqrt(gameState.board.length));
        this.moveListeners = [];
        this.winListeners = [];
        this.loseListeners = [];
        this.listenersOn = true;
    } 

    checkBounds(int){
        return  !((int > this.size) || (int < 0));
    }

    checkWinLose(){

        this.board.forEach(elem => {
            if (elem == 2048) {
                this.won = true;
            }
        });

        if (!this.possibleToMove()){
            this.over = true;
        }

        if (this.won) {
            this.winListeners.forEach(elem => elem(this.getGameState()));
        } 
        
        if (this.over) {
            this.loseListeners.forEach(elem => elem(this.getGameState()));
        }

        return (this.won || this.over)
    }

    possibleToMove(){
        this.listenersOn = false;

        let origonalBoard = this.board.slice(0);
        let origonalScore = this.score;

        this.move("up");
        let up = this.board.slice(0);
        this.board = origonalBoard.slice(0);
        this.move("down");
        let down = this.board.slice(0);
        this.board = origonalBoard.slice(0);
        this.move("right");
        let right = this.board.slice(0);
        this.board = origonalBoard.slice(0);
        this.move("left");
        let left = this.board.slice(0);
        this.board = origonalBoard.slice(0);
        
        for (let t = 0; t < this.board.length; t++){
            //console.log([up[t],down[t],left[t],right[t]],origonalBoard[t]);
            if (up[t] != origonalBoard[t] || down[t] != origonalBoard[t] || left[t] != origonalBoard[t] || right[t] != origonalBoard[t]){
                this.listenersOn = true;
                this.score = origonalScore;
                return true;
            }
        }
        this.listenersOn = true;
        this.score = origonalScore;
        return false;
    }

    hasChanged(board1, board2){
        let z = 0;
        while(z < board1.length){
            if (board1[z] != board2[z]){
                return true;
            }
            z++;
        }
        return false;
    }

    move(direction){
        
        let myScore = this.score;
        let origonalBoard = this.board.slice(0);

        // left == twoard the head of the array and right == twoard the tail
        let combineLeft = function(arr) {
            let lastNum = {
                seen: -1,
                idx: -1
            }
            let currentIndex = 0;
            let currentValue = -1

            while (currentIndex < arr.length) {
                currentValue = arr[currentIndex];
                if (currentValue == lastNum.seen) {
                    myScore += (lastNum.seen * 2);
                    arr[lastNum.idx] = lastNum.seen * 2;
                    arr[currentIndex] = 0;
                    lastNum.seen = -1;
                    lastNum.idx = -1
                } else if (currentValue != 0) {
                    lastNum.seen = currentValue;
                    lastNum.idx = currentIndex;
                }
                currentIndex++;
            }
            return arr;
        } 
        let combineRight = function(arr) {
            return combineLeft(arr.reverse()).reverse();
        }

        let shiftLeft = function(arr){
            let tempArr = [];
            arr.forEach(elem => {
                if (elem != 0) {
                    tempArr.push(elem);
                }
            })
            while (tempArr.length < arr.length) {
                tempArr.push(0);
            }
            return tempArr;
        }
        let shiftRight = function(arr){
            return shiftLeft(arr.reverse()).reverse();
        }

        // turn a 3d array into a 2d array assuming the array holding other arrays is the top of the 'board'
        let populateArrTop = function(arr) {
            let newBoard = [];
            let j = 0;
            while (j < arr.length) {
                arr.forEach(elem => {
                    newBoard.push(elem[j]);
                });
                j++;
            }
            return newBoard;
        }
        // assume it's the side instead
        let populateArrSide = function(arr) {
            let newBoard = [];
            arr.forEach(elem => {
                elem.forEach(elem2 => {
                    newBoard.push(elem2);
                });
            });
            return newBoard;
        }

        let myArray = [];
        let i = 0;
        for (let row = 0; row < this.size; row ++){
            for (let col = 0; col < this.size; col ++){
                myArray.push({
                    r: row,
                    c: col,
                    index: i,
                    value: this.board[i]
                });
                i++;
            }
        }
        
        let myResult = [];

        if (direction == "up" || direction == "down"){
            let currentCol = 0;
            while (currentCol < this.size) {
                //get all the elements in current column as values
                let myCol = []
                let temp = myArray.filter(x => x.c == currentCol); 
                temp.forEach(elem => myCol.push(elem.value));
                
                if (direction == "up"){
                    myCol = combineLeft(myCol);
                    myCol = shiftLeft(myCol);
                } else {
                    myCol = combineRight(myCol);
                    myCol = shiftRight(myCol);
                }
                myResult.push(myCol);
                currentCol++;
            }
            this.board = populateArrTop(myResult);
        } else if (direction == "left" || direction == "right"){
            let currentRow = 0;
            while (currentRow < this.size) {
                //get all the elements in current column as values
                let myRow = []
                let temp = myArray.filter(x => x.r == currentRow); 
                temp.forEach(elem => myRow.push(elem.value));
                
                if (direction == "left"){
                    myRow = combineLeft(myRow);
                    myRow = shiftLeft(myRow);
                } else {
                    myRow = combineRight(myRow);
                    myRow = shiftRight(myRow);
                }
                myResult.push(myRow);
                currentRow++;
            }
            this.board = populateArrSide(myResult);
        }
        if (this.hasChanged(origonalBoard, this.board)){
            this.addNewTile();
        }
        this.score = myScore;


        if (this.listenersOn){
            this.checkWinLose();
            if (this.possibleToMove()){
                this.moveListeners.forEach(elem => elem(this.getGameState()));
            }
        }
    }

    toString() {
        let myString = "";
        let i = 0;
        this.board.forEach(elem => {
            myString += ("[" + elem + "]");
            i++;
            if (i % this.size == 0) {
                myString += "\n";
            } else {
                myString+= " ";
            }
        });
        return myString;
    }

    onMove(callback) {
        this.moveListeners.push(callback);
    }

    onWin(callback) {
        this.winListeners.push(callback);
    }

    onLose(callback) {
        this.loseListeners.push(callback);
    }

    getGameState() {
        return {
            board: this.board,
            score: this.score,
            won: this.won,
            over: this.over
        };
    }
}
