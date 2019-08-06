/*
The beforeunload event is fired when the window, the document and its resources are about to be unloaded. 
The document is still visible and the event is still cancelable at this point.
*/
window.addEventListener("beforeunload", function (e) {
    alert("Call");
    // Cancel the event as stated by the standard.
    e.preventDefault();
    // Chrome requires returnValue to be set.
    e.returnValue = "";
});

var divChanges = [];

const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [0, 4, 8]
];


const endgame = document.querySelector(".endgame");
const text = document.querySelector(".text");
const restart = document
    .querySelector("#restart");
//   .addEventListener("click", playAgain);

var count = parseInt(localStorage.count);
console.log(count);

var player1 = [];
var player2 = [];

const gameboard = () => Array.from(document.querySelectorAll(".col"));

gameboard().forEach(col => col.addEventListener("click", printValue));

var socket = io.connect("http://953a3da6.ngrok.io");
socket.on("print", (data) => {
    if (localStorage.count) {
        console.log(data.Id);
        if (data.Id == -1) {
            playAgain();
        } else {
            if (data.Count % 2 == 0) {
                document.getElementById(parseInt(data.Id)).innerText = "X";
                player1.push(parseInt(parseInt(data.Id)));
                document.getElementById(parseInt(data.Id)).removeEventListener("click", printValue);
            } else {
                document.getElementById(parseInt(data.Id)).innerText = "O";
                player2.push(parseInt(data.Id));
                document.getElementById(parseInt(data.Id)).removeEventListener("click", printValue);
            }
            divChanges.push({
                Sid: data.Id,
                Scount: data.Count
            });
            localStorage.changes = JSON.stringify(divChanges);
            console.log(player1, player2);
            data.Count++;
            localStorage.setItem('count', data.Count);
            console.log(localStorage);
            winLogic();
        }
    } else {
        localStorage.count = 0;
    }
});

function printValue(e) {
    var did = e.target.id;

    socket.emit("id", {
        Id: did,
        Count: localStorage.count
    });
}

socket.on("changes", (number) => {
    console.log(number.proxy);
    number.proxy = 0;
    var changes;
    if (localStorage) {
        if (localStorage.changes) {
            changes = JSON.parse(localStorage.changes);

            for (let i = 0; i < changes.length; i++) {
                socket.emit("id", {
                    Id: changes[i].Sid,
                    Count: changes[i].Scount
                });
            }
        }
    } else {
        console.log("error");
    }
});


function winLogic() {
    for (let i = 0; i < winningCombos.length; i++) {
        if (winningCombos[i].every(val => player1.includes(val))) {
            console.log("player1 wins");
            gameboard().forEach(col =>
                col.removeEventListener("click", printValue)
            );
            var comboMatched = winningCombos[i];
            console.log(comboMatched);
            for (let j = 0; j < 3; j++) {
                document.getElementById(comboMatched[j]).style.background = "green";
            }
            endgame.style.display = "block";
            text.innerText = "Player1 WINS";
        } else if (winningCombos[i].every(val => player2.includes(val))) {
            console.log("player2 wins");
            gameboard().forEach(col =>
                col.removeEventListener("click", printValue)
            );
            var comboMatched = winningCombos[i];
            console.log(comboMatched);
            for (let j = 0; j < 3; j++) {
                document.getElementById(comboMatched[j]).style.background = "green";
            }
            endgame.style.display = "block";
            text.innerText = "Player2 WINS";
        }
    }
}

function playAgain() {
    window.localStorage.clear();
    divChanges.length = 0;
    localStorage.setItem('count', 0);
    gameboard().forEach(col => (col.innerText = ""));
    gameboard().forEach(col => col.addEventListener("click", printValue));
    endgame.style.display = "none";
    player1 = [];
    player2 = [];
    gameboard().forEach(col => (col.style.background = "white"));
}

restart.onclick = function () {
    socket.emit('id', {
        Id: -1
    })
};

window.addEventListener("load", () => {
    socket.emit("saved", {
        proxy: 1
    });

});

/* to check if one array is subset of another array
PlayerTwo.every(val => PlayerOne.includes(val)); */

/*This is possible with window.localStorage or window.sessionStorage.
The difference is that sessionStorage lasts for as long as the browser stays open, localStorage survives past browser restarts. 
The persistence applies to the entire web site not just a single page of it.*/