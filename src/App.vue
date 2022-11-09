<template>
    <div id="app" v-bind:class="{'ended': ended}">
        <Header title="Jouez au bingo+"/>
        <main class="container">
            <div class="row">
                <div class="col-12 board-wrapper">
                    <div class="overflow-auto">
                        <div class="scoreboard board" v-bind:class="gameset.name">
                            <div class="board-letters">
                                <div class="board-tile letter lighten" v-for="(letter, index) in gameset.letters" v-bind:key="index">
                                    {{ letter }}
                                </div>
                            </div>
                            <div class="board-numbers">
                                <span class="board-tile number" v-for="(numberObjs, index) in gameset.numbers" v-bind:key="index" v-bind:class="{'lighten': numberObjs.pulled}">
                                    {{ numberObjs.number }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="settings-box">
                        <div class="settings">
                            <template v-if="!ended">
                                <div class="setting">
                                    <div class="input-group input-group-sm w-auto">
                                        <select class="custom-select text-uppercase" id="inputGroupSelect02" v-model="version" v-on:change="setversion()">
                                            <option v-for="(bingo, index) in bingos" v-bind:key="index" v-bind:value="index">{{ bingo.name }}</option>
                                        </select>
                                        <div class="input-group-append">
                                            <label class="input-group-text" for="inputGroupSelect02">Version</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="setting">
                                    <div class="btn-group btn-group-sm input-group-sm" role="group" aria-label="Gestion des joueurs">
                                        <div class="input-group-append">
                                            <label class="input-group-text rounded-left" style="border-top-right-radius:0;border-bottom-right-radius:0;">Nombre de joueurs</label>
                                            <label class="input-group-text rounded-0 font-weight-bold justify-content-center" style="width:2.5rem;">{{ players }}</label>
                                        </div>
                                        <button v-on:click="players++" v-bind:disabled="players >= 20" class="btn btn-sm btn-outline-secondary bgwhite" style="border:1px solid #ced4da;width:2.5rem;" aria-label="Ajouter un joueur">+</button>
                                        <button v-on:click="players--" v-bind:disabled="players <= 1" class="btn btn-sm btn-outline-secondary bgwhite" style="border:1px solid #ced4da;width:2.5rem;" aria-label="Retirer un joueur">-</button>
                                    </div>
                                </div>
                                <div class="setting">
                                    <button v-on:click="auto = !auto" v-bind:class="[auto ? 'on' : 'off']" class="btn btn-sm btn-outline-secondary bgwhite left btn-auto" style="border:1px solid #ced4da;">
                                        Tirage automatique
                                        <span class="btn-auto-icons">
                                            <i class="btn-auto-icon btn-auto-icon__on"><font-awesome-icon icon="fa-solid fa-check" /></i>
                                            <i class="btn-auto-icon btn-auto-icon__off"><font-awesome-icon icon="fa-solid fa-xmark" /></i>
                                        </span>
                                    </button>
                                    <button v-on:click="pull" v-bind:disabled="auto" class="btn btn-sm btn-outline-secondary bgwhite left" style="border:1px solid #ced4da;">Tirer un numéro</button>
                                </div>
                            </template>
                            <h2 class="ended" v-if="ended">Partie terminée</h2>
                            <template v-if="ended">
                                <button v-on:click="restart" class="btn btn-outline-secondary bgwhite" style="border:1px solid #ced4da;">Recommencer</button>
                            </template>
                        </div>
                        <span v-bind:class="{'auto-on': auto}" class="pulled board lighten" v-if="(auto || pulled) && !ended">{{ pulled }}</span>
                    </div>
                    <div class="winners-wrapper">
                        <div class="winners" v-if="winners.length > 0">
                            <div class="winners-positions winners-col">
                                <span class="winners-position tile title">Positions</span>
                                <span class="winners-position tile" v-for="(winnerArr, index) in winners" v-bind:key="index">{{ winnerArr[0] }}<sup>{{ (winnerArr[0] == 1) ? 'er' : 'e' }}</sup></span>
                            </div>
                            <div class="winners-names winners-col">
                                <span class="winners-position tile title">Noms</span>
                                <span class="winners-name tile" v-for="(winnerArr, index) in winners" v-bind:key="index">
                                    <span v-for="(winner, index) in winnerArr[1]" v-bind:key="index">{{ getSeperator(index) }} joueur {{ winner }}</span>
                                 </span>
                            </div>
                        </div>
                    </div>
                    <div class="cards-wrapper">
                            <component v-for="(player, index) in players" v-bind:is="componentcard" v-bind:initcards="initcards" v-bind:ended="ended" v-bind:gameset="gameset" v-bind:index="index" v-bind:key="index" v-on:declarewinner="declarWinner($event)"></component>
                            <!--Card v-bind:gameset="gameset"/-->
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
import Bingo from './js/bingo.js'
import Header from './components/Header.vue'
import Card from './components/Card.vue'

export default {
    name: 'App',
    components: {
        Header,
        Card
    },
    data: function(){
        return {
            bingos: Bingo,
            version: "bingo",
            //version: "bingoplus",
            auto: false,
            interval: null,
            abacus: [],
            ended: false,
            init: true,
            initcards: 0,
            players: 4,
            pulled: "",
            compare: "",
            winners: [], // data ex: [ [1, [3]], [2, [7,9,13]], [5, [19]] ]
            winnerstotal: 0,
            componentcard: "Card"
        }
    },
    computed: {
        gameset: function(){
            return Bingo[this.version]
        }
    },
    watch: {
        auto: function(){
            if(this.auto) {
                this.interval = setInterval(() => {
                    (this.ended) ? clearInterval(this.interval) : this.pull();
                }, 2000);
            } else {
                clearInterval(this.interval);
            }
        }
    },
    methods: {
        setAbacus: function(){
            for(let i = 0; i < this.gameset.numbers.length; i++) {
                this.abacus.push(this.gameset.numbers[i].number);
            }
        },
        pull: function(){
            const pulled = this.abacus.splice(Math.floor(Math.random() * this.abacus.length), 1);
            this.gameset.numbers[pulled-1].pulled = true;
            this.showPulled(this.gameset.numbers[pulled-1]);
            if(this.abacus.length <= 0) {
                this.endGame();
            }
        },
        endGame: function() {
            this.init = false;
            this.ended = true;
        },
        showPulled: function(nb){
            this.pulled = `${this.gameset.letters[nb.letter]}${nb.number}`;
        },
        declarWinner: function(player){
            this.winnerstotal++;
            if(this.compare != this.pulled) {
                this.winners.push([this.winnerstotal, [player]]);
            } else {
                this.winners[this.winners.length-1][1].push(player);
            }
            this.compare = this.pulled;
            if(this.winnerstotal >= this.players) this.endGame();
        },
        getSeperator: function(ind){
            let sep;
            (ind >= 1) ? sep = ", " : sep = "";
            return sep;
        },
        restart: function(){
            this.initcards++;
            this.init = true;
            this.ended = false;
            this.abacus = [];
            this.pulled = "";
            this.compare = "";
            this.winners = [];
            this.winnerstotal = 0;
            this.gameset.numbers.forEach(function(value, index, array){
                array[index].pulled = false;
            });
            this.setAbacus();
        },
        setversion: function(){
            let reinitGame = new Promise((resolve) => {
                this.endGame();
                this.initcards++;
                resolve();
            })
            reinitGame.then(
                () => {
                    this.restart();
                }
            );
        }
    },
    mounted: function(){
        document.title = 'Jouez au Bingo+ | Projet fait avec Vue.js 2 CLI'
        console.log('App Ready!');
        this.setAbacus();
    }
}
</script>

<style>
.bgwhite {
    background: white;
}

body {
    color: #2e2e2e;
    background-color: #f3f3f3;
}
button {
    margin: 0 4px;
}
button[disabled="disabled"] {
    cursor: default;
}
.btn-group button {
    margin: 0;
}
.board-wrapper {
    text-align: center;
}
.board {
    background-color: #2e2e2e;
    border-radius: 12px;
}
header.board {
    border-radius: 0 0 12px 12px;
}
.scoreboard {
    display: flex;
    width: 502px;
    flex-wrap: nowrap;
    flex-direction: row;
    font-weight: bold;
    padding: 10px;
    margin: 2rem auto;
    border-radius: 12px;
}
.board-numbers {
    display: flex;
    flex-wrap: wrap;
}
.board-numbers .number {
    flex: 1 0 calc(6.666%);
}
.bingoplus.scoreboard {
    width: 872px;
}
.bingoplus .board-numbers .number {
    flex: 1 0 calc(3.866%);
}
.board-tile {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;    
    color: #4a4a4a;
    transition: all 0.6s;
}
.board-tile.number:nth-child(even) {
    background-color: rgba(0,0,0,0.1);
}
.board-letters {
    background-color: rgba(0,0,0,0.1);
    margin-right: 8px;
    width: 40px;
}
.letter {
    font-size: 20px;
}
.lighten {
    color: #efd9b9;
    text-shadow: 0px 0px 5px #efd9b9;
    text-transform: uppercase;
}
.pulled {
    width: 100px;
    height: 100px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    margin: 1rem auto 0;
    letter-spacing: 0.1rem;
}
.pulled.auto-on:after {
    content: "";
    height: 1px;
    width: 0;
    background-color: #efd9b9;
    box-shadow: 0px 0px 5px 0.8px rgba(239,217,185,0.75);
    -webkit-box-shadow: 0px 0px 5px 0.8px rgba(239,217,185,0.75);
    -moz-box-shadow: 0px 0px 5px 0.8px rgba(239,217,185,0.75);
    position: absolute;
    left: 0;
    bottom: 9px;
    animation-name: progressPulled;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}
@keyframes progressPulled {
  from {width: 0;}
  to {width: 100%;}
}
.ended {
    margin: 1rem;
}
.cards-wrapper {
    padding: 1rem 2rem;
}
.winners {
    display: inline-flex;
    border-top: 1px solid rgba(0,0,0,.125);
    border-left: 1px solid rgba(0,0,0,.125);
    margin: 2rem 1rem 0;
    font-size: .9rem;
}
.winners-positions {
    
}
.winners-names {
    
}
.winners-position {

}
.winners-name {
}
.winners-col {
    display: flex;
    flex-direction: column;
}
.winners-wrapper .tile {
    color: #4a4a4a;
    border-bottom: 1px solid rgba(0,0,0,.125);
    border-right: 1px solid rgba(0,0,0,.125);
    padding: 0.5rem .8rem;
    text-transform: capitalize;
    background-color: #ffffff;
}
.winners-wrapper .title.tile {
    padding:  0.3rem .8rem;
    font-weight: 500;
    background-color: #e5e5e5;
}
.btn-auto {
    overflow: hidden;
    position: relative;
    padding-right: 30px;
}
.btn-auto-icons {
    content: "";
    display: block;
    width: 20px;
    height: 200%;
    position: absolute;
    top: 0;
    right: 0;
    transition: top 0.4s;
}
.btn-auto-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 50%;
    color: #6c757d;
}
.btn-auto-icon__on {
    background-color: rgba(194,237,194,1);
}
.btn-auto-icon__off {
    background-color: rgba(251,215,215,1);
}
.on .btn-auto-icons {
    top: 0;
}
.off .btn-auto-icons {
    top: -100%;
}

.setting {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;
}
.setting button.left {
    margin: 0 8px 0 0;
}
@media screen and (min-width: 640px){
    .settings-box {
        width: 502px;
        margin: auto;
        display: flex;
        justify-content: space-between;
    }
    #app.ended .settings-box {
        justify-content: center;
    }
    .settings {

    }
    .setting {
        justify-content: left;
    }
    .pulled {
        margin: 0;
    }
    .cards-wrapper {
        padding: 1rem 0;
    }
}
</style>
