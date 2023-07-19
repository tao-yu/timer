import { randomScrambleForEvent } from "https://cdn.cubing.net/js/cubing/scramble";

document.getElementById("scramble").innerHTML = await randomScrambleForEvent("333")

console.log(getCurrentTime())
class Timer {
    constructor(timeData) {
        this.timeData = timeData
        this.timeStr = ""
    }

    appendData(centi, time, penalty, scramble) {
        if (this.timeData == null) {
            this.timeData = new dfd.DataFrame([[centi, time, penalty, scramble]], { "columns": ["centi", "time", "penalty", "scramble"] })
        } else {
            this.timeData = this.timeData.append([centi, time, penalty, scramble], [this.timeData.length]);
            this.timeData = this.timeData.resetIndex();
        }

    }

    saveData() {
        localStorage.setItem("timeData", JSON.stringify(dfd.toJSON(this.timeData, { "format": "row" })))
    }

    resetData() {
        localStorage.setItem("timeData", null)
        this.timeData = null
    }
}

let timeDataJSON = JSON.parse(localStorage.getItem("timeData"))
let timeData = timeDataJSON == null ? null : new dfd.DataFrame(timeDataJSON)
let timer = new Timer(timeData);
updateRoundResults();
document.querySelectorAll('.keypad-button').forEach(item => {
    item.addEventListener('click', async (event) => {
        // append the key number to the input field
        let key = event.target.innerText;

        if (key == "Backspace") {
            timer.timeStr = timer.timeStr.slice(0, timer.timeStr.length - 1)
        }
        else if (key == "Submit") {
            let newTimeStr = formatUserTime(timer.timeStr);
            let centi = getTimeCenti(newTimeStr);
            let time = getCurrentTime();
            let scramble = document.getElementById("scramble").innerHTML;
            let penalty = 0;
            timer.appendData(centi, time, penalty, scramble)
            timer.timeStr = ""
            document.getElementById("scramble").innerHTML = await randomScrambleForEvent("333")
            updateRoundResults();
        }
        else if (timer.timeStr.length < 6) {
            timer.timeStr += key;
        }
        let newTimeStr = formatUserTime(timer.timeStr);
        document.getElementById("time-entry").innerHTML = newTimeStr == "" ? "&nbsp;" : newTimeStr;
        let centiseconds = getTimeCenti(newTimeStr)

    })
})


const leftPopUpButton = document.getElementById("left-popup-button");
const rightPopUpButton = document.getElementById("right-popup-button");
leftPopUpButton.addEventListener("click", function () {

    const leftPopUp = document.getElementById("left-popup");
    const rightPopUp = document.getElementById("right-popup");
    if (leftPopUp.style.display == "block") {
        leftPopUp.style.display = "none";
    }
    else {
        leftPopUp.style.display = "block";
        rightPopUp.style.display = "none";
    }
});

rightPopUpButton.addEventListener("click", function () {

    const leftPopUp = document.getElementById("left-popup");
    const rightPopUp = document.getElementById("right-popup");
    if (rightPopUp.style.display == "block") {
        rightPopUp.style.display = "none";
    }
    else {
        rightPopUp.style.display = "block";
        leftPopUp.style.display = "none";
        rightPopUp.innerHTML = timer.timeData.toString()//.replace(/\n/g, '<br>')
    }
});

document.getElementById("reset-times").addEventListener("click", function () {
    timer.resetData();
})

let timeout1, timeout2, timeout3;
let inspectionArea = document.getElementById("inspection-area")
inspectionArea.addEventListener("click", function () {
    if (["inspection1", "inspection2", "inspection3"].some(item => this.classList.contains(item))) {
        this.classList = [];
        clearTimeout(timeout1)
        clearTimeout(timeout2)
        clearTimeout(timeout3)
    }
    else {
        this.classList.add("inspection1")
        timeout1 = setTimeout(() => {
            this.classList.remove('inspection1');
            this.classList.add('inspection2');

            timeout2 = setTimeout(() => {
                this.classList.remove('inspection2');
                this.classList.add('inspection3');

                timeout3 = setTimeout(() => {
                    this.classList.remove('inspection3');
                }, 3000); // 3 seconds (red to green)
            }, 4000); // 4 seconds (yellow to red)
        }, 8000); // 8 seconds (green to yellow)
    }

})


function formatUserTime(oldTimeStr) {
    if (oldTimeStr == "") {
        return ""
    }

    let newTimeStr = oldTimeStr;
    if (oldTimeStr.length == 1) {
        return "0.0" + oldTimeStr;
    }
    if (oldTimeStr.length == 2) {
        return "0." + oldTimeStr
    }
    if (oldTimeStr.length >= 3) {
        newTimeStr = oldTimeStr.slice(0, oldTimeStr.length - 2) + "." + oldTimeStr.slice(oldTimeStr.length - 2);
    }
    if (oldTimeStr.length >= 5) {
        newTimeStr = newTimeStr.slice(0, newTimeStr.length - 5) + ":" + newTimeStr.slice(newTimeStr.length - 5);
    }

    return newTimeStr;
}

function getTimeCenti(timeStr) {
    if (timeStr == "") {
        return 0
    }
    /* Note that this function assumes a clean input */
    if (timeStr.includes(":")) {
        let parts = timeStr.split(":");
        let minutes = parseFloat(parts[0]);
        let seconds = parseFloat(parts[1]);
        return Math.round(minutes * 6000 + seconds * 100);
    }
    else {
        return Math.round(parseFloat(timeStr) * 100);
    }
}

function formatCenti(centiseconds) {
    let minutes = Math.floor(centiseconds / 6000);
    let remainingCentiseconds = centiseconds % 6000;
    let seconds = Math.floor(remainingCentiseconds / 100);
    let finalCentiseconds = remainingCentiseconds % 100;

    let timeString = '';
    if (minutes > 0) {
        timeString += minutes + ':';
        // pad with a leading zero if seconds is less than 10
        timeString += (seconds < 10 ? '0' : '') + seconds.toFixed(0);
    } else {
        timeString += seconds.toFixed(0);
    }
    // always show centiseconds, padded with a leading zero if necessary
    timeString += '.' + (finalCentiseconds < 10 ? '0' : '') + finalCentiseconds.toFixed(0);
    return timeString;
}

window.addEventListener('beforeunload', function (event) {
    timer.saveData();
});


function getCurrentTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };

    const currentTime = now.toLocaleString('en-US', options).replace(',', '');
    return currentTime;
}

function updateRoundResults() {
    if (timer.timeData == null) {
        return
    }
    let tableHTML = '<table>'
    let solvesPerRound = 5;
    let numRows = timer.timeData.shape[0];
    let lastIndex = numRows - 1
    let lastFinal = lastIndex - lastIndex % solvesPerRound;
    let numRowsTable = 3;
    let startIndex = lastFinal - (numRowsTable - 1) * solvesPerRound;

    for (let i = 0; i < numRowsTable; i++) {

        let a = startIndex + solvesPerRound * i;
        let b = Math.min(a + solvesPerRound, numRows);
        if (a < 0) {
            continue;
        }
        let round;

        if (a != b) {
            round = timer.timeData.iloc({ "rows": [`${a}:${b}`] })
        } else {
            round = timer.timeData.iloc({ "rows": [a] })
        }

        let roundJSON = dfd.toJSON(round, { "format": "column" })

        tableHTML += '<tr class="table-row">';

        for (let j = 0; j < solvesPerRound + 1; j++) {
            if (j == solvesPerRound) {
                tableHTML += '<td class="table-cell">' + calculateAvg(round) + '</td>';

            }
            else {
                try {
                    tableHTML += '<td class="table-cell">' + formatCenti(roundJSON[j]['centi']) + '</td>';
                } catch (err) {
                    tableHTML += '<td class="table-cell"></td>';
                }
            }
        }

        tableHTML += '</tr>';
    }

    tableHTML += '</table>';
    document.getElementById("times-tables").innerHTML = tableHTML;
}

function calculateAvg(dfRound) {
    let centiList = dfd.toJSON(dfRound, { "format": "row" })['centi']
    if (centiList.length == 5) {
        return formatCenti(Math.round((centiList.reduce((a, b) => a + b, 0) - Math.max.apply(Math, centiList) - Math.min.apply(Math, centiList)) / 3));
    }
    else {
        return ""
    }
}


