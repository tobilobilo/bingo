function genNumbers() {
  for(let diff in bingo) {
    for(let i = 0; i < (bingo[diff].letters.length * bingo[diff].mod); i++){
      let obj = {number: i+1, letter: Math.floor(i / bingo[diff].mod), pulled: false};
      bingo[diff].numbers.push(obj);
    }
  }
}

let bingo = 
  {
    bingo: {
      name: "bingo",
      letters: ["B", "I", "N", "G", "O"],
      mod: 15,
      numbers: [
          
      ]
    },
    bingoplus: {
      name: "bingoplus",
      letters: ["B", "I", "N", "G", "O", "P", "L", "U", "S"],
      mod: 25,
      numbers: [
          
      ]
    }
  }

genNumbers();

export default bingo;