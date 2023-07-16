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
        localStorage.setItem("timeData", JSON.stringify(dfd.toJSON(this.timeData, {"format":"row"})))
    }

    resetData(){
        localStorage.setItem("timeData", null)
        this.timeData = null
    }
}

let timeDataJSON = JSON.parse(localStorage.getItem("timeData"))
let timeData = timeDataJSON == null ? null : new dfd.DataFrame(timeDataJSON)
let timer = new Timer(timeData);

document.querySelectorAll('.keypad-button').forEach(item => {
    item.addEventListener('click', event => {
        // append the key number to the input field
        let key = event.target.innerText;

        if (key == "Backspace") {
            timer.timeStr = timer.timeStr.slice(0, timer.timeStr.length - 1)
        }
        else if (key == "Submit") {
            timer.timeStr = ""
        }
        else if (timer.timeStr.length < 6) {
            timer.timeStr += key;
        }
        let newTimeStr = formatUserTime(timer.timeStr);
        document.getElementById("time-entry").innerHTML = newTimeStr == "" ? "&nbsp;" : newTimeStr;
        let centiseconds = getTimeCenti(newTimeStr)

    })
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