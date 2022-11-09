<template>
    <div class="card">
        <p class="player-title">Joueur {{ index+1 }}</p>
        <div class="cardboard">
            <div class="card-letters">
                <div class="card-tile card-letter" v-for="(letter, index) in gameset.letters" v-bind:key="index">
                    {{letter}}
                </div>
            </div>
            <div class="card-numbers">
                <div class="card-col" v-for="(letter, index) in gameset.letters" v-bind:key="index">
                    <div class="card-tile card-letter" v-for="(number, indexi) in numbers[index]" v-bind:key="indexi" v-bind:data-pulled="getPulled(number)">
                        {{ getNumber(number, indexi+index*gameset.letters.length) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Card',
    props: {
        gameset: Object,
        index: Number,
        initcards: Number,
        ended: Boolean
    },
    data: function(){
        return {
            numbers: [],
            grid: [],
            won: false
        }
    },
    computed: {
        middlecase: function(){
            return Math.floor(Math.pow(this.gameset.letters.length, 2) / 2)
        },
        middlecolumn: function(){
            return Math.floor(this.gameset.letters.length / 2)
        }
    },
    methods: {
        generateNumbers: function(){
            let comb = [];
            for(let k = 0; k < this.gameset.letters.length; k++) { // for each letters (cols)
                let combrow = [];
                let combUnique = [];
                let colHasfree = (k == this.middlecolumn) ? 1 : 0; // if middle col, "N" in normal bingo
                for(let j = 0; j < this.gameset.mod; j++) combUnique.push(j + (k * this.gameset.mod)); // set an array with all possible numbers for that letter
                for(let i = 0; i < this.gameset.letters.length - colHasfree; i++) { // for each tile
                    let unique = combUnique.splice(Math.floor(Math.random() * combUnique.length), 1); // set a unique number
                    combrow.push(unique[0]);
                    this.grid.push(this.gameset.numbers[1].pulled);
                }
                comb.push(combrow.sort((a, b) => a - b)); // push the col array and sort it
            }
            comb[this.middlecolumn].splice(this.middlecolumn, 0, "free"); // add free tile
            this.grid.splice(this.middlecase, 0, true); // add free tile
            this.numbers = comb;
        },
        getPulled: function(number){ // return boolean if whethher or not the tile number has been pulled
            if(number == "free"){
                return true;
            } else {
                return this.gameset.numbers[number].pulled;
            }
        },
        getNumber: function(number, index){ // return the tile number (integer) unless it's a free tile
            if(index == this.middlecase) {
                return "free";
            } else {
                return this.gameset.numbers[number].number;
            }
        },
        checkBingo: function() {
            const base = this.numbers.length;
            let combdiag = { diag1: [], diag2: [] };
            for(let i = 0; i < base; i++) {
                let comb = { col: [], row: [] };
                for(let k = 0; k < base; k++) {
                    comb.row.push(this.getPulled(this.numbers[k][i]));
                    comb.col.push(this.getPulled(this.numbers[i][k]));
                }
                // checks for rows and cols
                if (this.testBingo(comb.row)) { // if comb is true, a line is complete
                    this.declareWinner('row', i+1);
                    return
                }
                if (this.testBingo(comb.col)) { // if comb is true, a line is complete
                    this.declareWinner('column', i+1);
                    return
                }
                combdiag.diag1.push(this.getPulled(this.numbers[i][((i * base) + i) % base]));
                combdiag.diag2.push(this.getPulled(this.numbers[i][((((i * base) + base) - i) - 1) % base]));
                if(i == base-1) { // check only at the last iteration for a full line for each diagonal
                    if (this.testBingo(combdiag.diag1)) { // if combdiag is true, a diagonal line is complete
                        this.declareWinner('diagonal', "top left to bottom right");
                        return
                    }
                    if (this.testBingo(combdiag.diag2)) { // if combdiag is true, a diagonal line is complete
                        this.declareWinner('diagonal', "bottom left to top right");
                        return
                    }
                }
            }
        },
        testBingo: function(comb) {
            return comb.every( (val) => val === true ); // check all tile in a line are pulled (true)
        },
        declareWinner: function() { // (type, i)
            //console.log(`we have a winner, ${type} ${i}`);
            if(!this.won){
                this.$emit('declarewinner', this.$props.index+1);
                this.won = true;
            }
        },
        restart: function(){
            this.numbers = [];
            this.grid = [];
            this.won = false;
            this.generateNumbers();
        }
    },
    watch: {
        gameset: {
            handler: function(){
                if(!this.ended)this.checkBingo();
            },
            deep: true
        },
        initcards: function(){
                this.restart();
                console.log('restart');
        }
    },
    mounted: function(){
        this.generateNumbers();
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
    text-align: center;
    display: inline-flex;
    border: none 0;
    border: 0;
    margin: 1rem 1rem 0;
    padding: 0 10px 10px;
    border-radius: 10px;
}
.player-title {
    margin-bottom: 0;
    padding: .3rem 0;
}
.cardboard {
    border-radius: 0;
    border: none 0;
    border-top: 1px solid #cbcbcb;
    border-left: 1px solid #cbcbcb;
    margin: 0;
}
.card-letters {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    font-weight: bold;
    background-color: #e5e5e5;
}
.card-tile {
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #cbcbcb;
    border-right: 1px solid #cbcbcb;
    position: relative;
}
.card-col {
    display: inline-flex;
    flex-direction: column;
}
[data-pulled="true"]:before {
    content: "";
    position: absolute;
    top: 10%;
    left: 10%;
    width: 80%;
    height: 80%;
    border-radius: 100px;
    background-color: rgba(52, 197, 52, 0.3);
}
</style>
