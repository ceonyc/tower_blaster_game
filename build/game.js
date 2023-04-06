import { table } from 'table';
import promptSync from 'prompt-sync';
import chalk from 'chalk';
const prompt = promptSync();
class Brick {
    value;
    status;
    constructor(value, status) {
        this.value = value;
        this.status = status;
    }
    getValue() {
        return this.value;
    }
}
class Space {
    index;
    tower;
    brick;
    constructor(index, tower, brick) {
        this.index = index;
        this.tower = tower;
        this.brick = brick;
    }
    getBrick() {
        return this.brick.getValue();
    }
}
class Game {
    mainDeck;
    discardDeck;
    computerTower;
    playerTower;
    currentPlayerTower;
    // The game is initialized by dealing a shuffled deck of 60 bricks into the main deck, and then moving 10 bricks each from the main deck to the computer's tower and the player's tower
    constructor() {
        this.mainDeck = this.setupDeck();
        this.discardDeck = [];
        this.computerTower = this.setupTowers(this.mainDeck)[0];
        this.playerTower = this.setupTowers(this.mainDeck)[1];
        this.currentPlayerTower = this.playerTower;
    }
    // Firstly, a deck of 60 bricks is created and shuffled
    setupDeck() {
        const mainDeck = [];
        // create an array of numbers from 1 to 60
        let cards = Array.from({ length: 60 }, (_, i) => i + 1);
        // shuffle the array using the Fisher-Yates algorithm
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        // push these shuffled brick values into the main deck
        for (const card of cards) {
            mainDeck.push(new Brick(card, "main"));
        }
        return mainDeck;
    }
    // Secondly, 10 bricks are moved from the main deck to the computer tower and 10 bricks are moved from the main deck to the player tower
    setupTowers(mainDeck) {
        const computerTower = [];
        for (let i = 0; i < 10; i++) {
            computerTower.push(new Space(i, "computer", mainDeck[i]));
        }
        const playerTower = [];
        for (let i = 0; i < 10; i++) {
            playerTower.push(new Space(i, "player", mainDeck[i + 10]));
        }
        for (let i = 0; i < 20; i++) {
            mainDeck.shift();
        }
        return [computerTower, playerTower];
    }
    checkTower(tower) {
        // check if every brick in the tower is in ascending order
        const towerValues = [];
        tower.map((space) => towerValues.push(space.getBrick()));
        for (let i = 0; i < towerValues.length - 1; i++) {
            // if the tower is not ordered, return false
            if (towerValues[i] > towerValues[i + 1]) {
                return false;
            }
        }
        // if the tower is ordered, return true
        return true;
    }
    findAndReplaceBrick(index, tower, currentBrick, currentDeck, discardDeck) {
        // find the brick at the given index in the tower
        const brickToReplace = tower[index].brick;
        // replace the brick at the given index in the tower with the new brick from the deck
        tower[index].brick = currentBrick;
        discardDeck.push(brickToReplace);
        currentDeck.shift();
        // return the new tower
        return tower;
    }
    findFit(tower, brick, towerSegment, currentDeck) {
        if (towerSegment == "top") {
            // if the brick is less than 5, it can be placed in the top space if it's smaller than the existing top brick
            if ((brick.getValue() <= 5) && (brick.getValue() < tower[0].brick.getValue())) {
                const brickToReplace = tower[0].brick;
                tower[0].brick = brick;
                if (currentDeck == this.discardDeck) {
                    this.mainDeck.push(brickToReplace);
                }
                else {
                    this.discardDeck.push(brickToReplace);
                }
                currentDeck.shift();
            }
            // if the brick is greater than 55, it can be placed in the top space if it's bigger than the existing top brick
            if ((brick.getValue() >= 55) && (brick.getValue() > tower[9].brick.getValue())) {
                const brickToReplace = tower[9].brick;
                tower[9].brick = brick;
                if (currentDeck == this.discardDeck) {
                    this.mainDeck.push(brickToReplace);
                }
                else {
                    this.discardDeck.push(brickToReplace);
                }
                currentDeck.shift();
            }
            // otherwise, iterate through the array to find a suitable spot. A suitable spot is the first space where the brick is bigger than the brick to the left of it, and smaller than the brick to the right of it.
            for (let i = 1; i < 4; i++) {
                if (tower[i].brick.getValue() < brick.getValue() && tower[i + 2].brick.getValue() > brick.getValue()) {
                    this.findAndReplaceBrick(i + 1, tower, brick, currentDeck, this.discardDeck);
                }
            }
        }
        else if (towerSegment == "middle") {
            for (let i = 3; i < 6; i++) {
                if (tower[i].brick.getValue() < brick.getValue() && tower[i + 2].brick.getValue() > brick.getValue()) {
                    this.findAndReplaceBrick(i + 1, tower, brick, currentDeck, this.discardDeck);
                }
            }
        }
        else {
            for (let i = 6; i < 8; i++) {
                if (tower[i].brick.getValue() < brick.getValue() && tower[i + 2].brick.getValue() > brick.getValue()) {
                    this.findAndReplaceBrick(i + 1, tower, brick, currentDeck, this.discardDeck);
                }
            }
        }
    }
    refillMain() {
        // if the main deck is empty, refill it with the discard deck
        if (this.mainDeck.length == 0) {
            for (const brick of this.discardDeck) {
                this.mainDeck.push(brick);
            }
            this.discardDeck = [];
        }
    }
    computerGameLoop(playerTower, computerTower, mainDeck, discardDeck) {
        // Computer's turn:
        console.log(chalk.bgRed("   Computer Plays   "));
        // Flip the top brick from the discard deck
        const topBrick = discardDeck[0];
        // Check to see if this brick belongs in the top, middle, or bottom third of the board
        if (topBrick.getValue() < 21) {
            // top third
            this.findFit(computerTower, topBrick, "top", this.discardDeck);
        }
        else if (topBrick.getValue() < 41) {
            // middle third
            this.findFit(computerTower, topBrick, "middle", this.discardDeck);
        }
        else {
            // bottom third
            this.findFit(computerTower, topBrick, "bottom", this.discardDeck);
        }
        console.log(chalk.red("   Computer Made a Choice   "));
        // Check if main deck is empty
        this.refillMain();
        // Check if the computer's tower is ordered
        if (this.checkTower(computerTower)) {
            console.log(chalk.bgRed("   Computer wins!   "));
            return;
        }
    }
    gameLoop(playerTower, computerTower, mainDeck, discardDeck) {
        // Game Loop: 
        // Check if the player's tower or the computer's tower is ordered
        if (this.checkTower(playerTower)) {
            console.log(chalk.bgGreen("   You win!   "));
            return;
        }
        else if (this.checkTower(computerTower)) {
            console.log(chalk.bgRed("   Computer wins!   "));
            return;
        }
        // While the player's tower is not ordered, the player can choose a brick from the main deck or the discard deck
        console.log('\n \n');
        console.log(chalk.bgGreen("   Next brick in the Main Deck:   "));
        console.log(chalk.green("   " + mainDeck[0].getValue() + "   "));
        console.log(chalk.blue("Do you want to keep this brick?"));
        // If the player chooses a brick from the main deck, the brick is moved to the player's tower
        const playerChoice = prompt(chalk.green("Type 'y' for yes or 'n' for no: "));
        if (playerChoice === 'y') {
            console.log("Which index do you want to place the brick at?");
            const playerIndex = prompt(chalk.green("Type an index from 0 to 9: "));
            // replace selected brick in tower with new brick from deck, and display updated tower
            playerTower = this.findAndReplaceBrick(parseInt(playerIndex), playerTower, mainDeck[0], mainDeck, discardDeck);
            console.log('\n');
            console.log(chalk.bgRed("   YOUR TOWER:   "));
            console.log(table(playerTower.map((space, index) => [index, space.getBrick()])));
            // check if the player's tower is ordered
            if (this.checkTower(playerTower)) {
                console.log(chalk.bgGreen("   You win!   "));
                return;
            }
            else {
                // Check if main deck is empty
                this.refillMain();
                // computer game loop
                this.computerGameLoop(playerTower, computerTower, mainDeck, discardDeck);
                // retrigger player game loop
                this.gameLoop(playerTower, computerTower, mainDeck, discardDeck);
            }
        }
        else if (playerChoice === 'n') {
            let rejectedBrick = mainDeck[0];
            discardDeck.push(rejectedBrick);
            mainDeck.shift();
            const playerChoice2 = prompt(chalk.green("Would you like to see a card from the mystery Discard Deck? Type 'y' for yes or 'n' for no: "));
            // if player takes a look at the discard deck, player can choose to put brick in tower or ignore it
            if (playerChoice2 === 'y') {
                console.log('\n \n');
                console.log(chalk.bgYellow("   Next brick in the Discard Deck:   "));
                console.log(chalk.yellow("   " + discardDeck[0].getValue() + "   "));
                console.log(chalk.blue('\n \n'));
                const playerChoice3 = prompt(chalk.green("Would you like to keep this brick? Type 'y' for yes or 'n' for no."));
                if (playerChoice3 == 'y') {
                    console.log("Which index do you want to place the brick at?");
                    const playerIndex = prompt(chalk.green("Type an index from 0 to 9: "));
                    // replace selected brick in tower with new brick from deck, and display updated tower
                    // find the brick at the given index in the tower
                    const brickToReplace = playerTower[parseInt(playerIndex)].brick;
                    playerTower[parseInt(playerIndex)].brick = discardDeck[0];
                    mainDeck.push(brickToReplace);
                    discardDeck.shift();
                    console.log('\n');
                    console.log(chalk.bgRed("   YOUR TOWER:   "));
                    console.log(table(playerTower.map((space, index) => [index, space.getBrick()])));
                    // check if the player's tower is ordered
                    if (this.checkTower(playerTower)) {
                        console.log(chalk.bgGreen("   You win!   "));
                        return;
                    }
                    else {
                        // Check if main deck is empty
                        this.refillMain();
                        // computer game loop
                        this.computerGameLoop(playerTower, computerTower, mainDeck, discardDeck);
                        // retrigger game loop for player
                        this.gameLoop(playerTower, computerTower, mainDeck, discardDeck);
                    }
                }
                else if (playerChoice3 == 'n') {
                    // if the player chooses not to keep the brick, it is added to the main deck
                    mainDeck.push(discardDeck[0]);
                    discardDeck.shift();
                    console.log('\n');
                    console.log(chalk.bgRed("   YOUR TOWER:   "));
                    console.log(table(playerTower.map((space, index) => [index, space.getBrick()])));
                    // Check if main deck is empty
                    this.refillMain();
                    // computer game loop
                    this.computerGameLoop(playerTower, computerTower, mainDeck, discardDeck);
                    // retrigger game loop for player
                    this.gameLoop(playerTower, computerTower, mainDeck, discardDeck);
                }
            }
        }
    }
}
function main() {
    // Please reach out.
    // Set up new game
    const game = new Game();
    // Display instructions to the player
    console.log(chalk.bgBlue("   HOW TO PLAY:   "));
    console.log(chalk.red("1. The goal of the game is to build a tower of 10 bricks in ascending order."));
    console.log(chalk.yellow("2. Each turn, you can either take a visible brick from the main deck or a mystery brick from the discard deck."));
    console.log(chalk.green("3. First player to build an ordered tower of 10 bricks wins!"));
    console.log('\n \n \n');
    const choice = prompt(chalk.bgBlue(" Ready to play? (y/n) "));
    if (choice !== "y") {
        console.log(chalk.bgRed("   Thanks for playing! Goodbye!   "));
        return;
    }
    // Display the initial state of the game
    console.log('\n \n \n');
    console.log(chalk.bgBlue("   INITIAL STATE OF THE GAME:   "));
    console.log('\n');
    console.log(chalk.bgRed("   YOUR TOWER:   "));
    console.log(table(game.playerTower.map((space, index) => [index, space.getBrick()])));
    console.log(chalk.yellow("Here's your current tower! Each brick (right) has an index number (left)."));
    console.log(chalk.green("Swap new bricks from the deck into your tower until your tower is in ascending numerical order."));
    // Prompt the player to choose a brick from the main deck or the discard deck
    game.gameLoop(game.playerTower, game.computerTower, game.mainDeck, game.discardDeck);
}
main();
