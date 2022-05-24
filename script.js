var ApplicationState = "idle";

var RemainingTime = 0;

var TimerId;

const keyboardShortcuts = {
    "ArrowRight": function () {alterSeconds(30)},
    "ArrowLeft": function () {alterSeconds(-30)},
    "ArrowUp": function () {alterMinutes(1)},
    "ArrowDown": function () {alterMinutes(-1)},
    "PageUp": function () {alterMinutes(5)},
    "PageDown": function () {alterMinutes(-5)},
    "Home": function () {alterMinutes(10)},
    "End": function () {alterMinutes(-10)},
    "Enter": function () {start_pause_resume()},
    "Delete": function () {changeStatesTo("idle")},
    
    "d": function () {alterSeconds(30)},
    "a": function () {alterSeconds(-30)},
    "w": function () {alterMinutes(1)},
    "s": function () {alterMinutes(-1)},
    "e": function () {alterMinutes(5)},
    "q": function () {alterMinutes(-5)},
    "r": function () {alterMinutes(10)},
    "f": function () {alterMinutes(-10)},
    " ": function () {start_pause_resume()},
    "Escape": function () {changeStatesTo("idle")},
};

function changeStatesTo(state) {
    const startButton = document.getElementById("start");
    const clearButton = document.getElementById("clear");
    const display = document.getElementById("display");
    const lock_image =  document.getElementById("lock_image");

    const States = {
        "idle": function () {
            setStartButton();
            unlockDisplayForKeyboard();
            stopTimer();
            clearTimer();
            ApplicationState = "idle";
        },
        "playing": function () {
            setPauseButton();
            lockDisplayForKeyboard();
            startTimer();
            ApplicationState = "playing";
        },
        "paused": function () {
            setResumeButton();
            unlockDisplayForKeyboard();
            stopTimer();
            ApplicationState = "paused";
        }
    
    };
    States[state]();
    blurButtons();


    function startTimer(){
        TimerId = setInterval(() => {
            if(--RemainingTime < 0){
                changeStatesTo("idle");
            }
            updateDisplay();
        }, 1000);
    }
    function stopTimer(){
        clearInterval(TimerId);
    }
    function clearTimer() {
        alterSeconds(RemainingTime*-1);
    } 

    function setStartButton(){
        startButton.innerHTML = "Start";
        startButton.classList.add("btn-primary");
        startButton.classList.remove("btn-success");
        startButton.classList.remove("btn-secondary");
    }
    function setResumeButton(){
        startButton.innerHTML = "Resume";
        startButton.classList.remove("btn-primary");
        startButton.classList.add("btn-success");
        startButton.classList.remove("btn-secondary");
    }
    function setPauseButton(){
        startButton.innerHTML = "Pause";
        startButton.classList.remove("btn-primary");
        startButton.classList.remove("btn-success");
        startButton.classList.add("btn-secondary");
    }
    function blurButtons() {
        startButton.blur();
        clearButton.blur();
    }

    function unlockDisplayForKeyboard() {
        display.classList.remove("locked");
        lock_image.classList.add("hidden");
    }
    function lockDisplayForKeyboard() {
        display.classList.add("locked");
        lock_image.classList.remove("hidden");
    }
    
}

function start_pause_resume() {
    const stateChange = {
        "idle": function () {changeStatesTo("playing")},
        "playing": function () {changeStatesTo("paused")},
        "paused": function () {changeStatesTo("playing")}
    };
   stateChange[ApplicationState]();
}

function isDisplayLocked() {
    return document.getElementById("display").classList.contains("locked");
}

function recieveInput(e) {
    const key = e.key;


    try {
        keyboardShortcuts[key]();
        return;
    } catch (err) {
        recieveKeyboardInput(key);
    }
    

    function recieveKeyboardInput(key) {
        if(isDisplayLocked()){
            return;
        }
        
        let hours = document.getElementById("display_hours").innerHTML;
        let minutes = document.getElementById("display_minutes").innerHTML;
        let seconds = document.getElementById("display_seconds").innerHTML;
        
        let hoursLen = hours.length;

        let display_array = Array.from(hours+minutes+seconds);

        if(key=="Backspace"){
            removeNumber();            
        }        
        else if(!isNaN(key)){
           addNumber();
        }
        else{
            return;
        }
        
        hours = display_array.slice(0,hoursLen);
        minutes = display_array.slice(hoursLen,hoursLen+2);
        seconds = display_array.slice(hoursLen+2,hoursLen+4);
        
        hours = parseInt(hours.join(''));
        minutes = parseInt(minutes.join(''));
        seconds = parseInt(seconds.join(''));


        setRemainingTime(hours,minutes,seconds);

        function addNumber() {
    
            display_array.push(key);
            
            if (display_array[0]=="0") {
                display_array.shift();
                return;
            }

            hoursLen++;
        }
        function removeNumber() {
            display_array.unshift("0");
            display_array.pop();
        }
        function setRemainingTime(hours,minutes,seconds) {
    
            RemainingTime=(hours*3600)+(minutes*60)+seconds;
            
            updateDisplay();
        }
    }
}

function alterMinutes(value) {
    alterSeconds(value * 60);
}
function alterSeconds(value) {
    if (RemainingTime + value <= 0) {
        RemainingTime = 0;
    }
    else {
        RemainingTime += value;
    }
    updateDisplay();
}

function updateDisplay() {
    
    let hours = parseInt(RemainingTime / 3600, 10);
    let minutes = parseInt((RemainingTime / 60) % 60, 10);
    let seconds = parseInt(RemainingTime % 60, 10);

    const display_secret = document.getElementById("display_secret");

    const display_hours = document.getElementById("display_hours");
    const display_minutes = document.getElementById("display_minutes");
    const display_seconds = document.getElementById("display_seconds");

    if (hours != 0) {
        display_secret.classList.remove("hidden");
        display_hours.classList.remove("hidden");
    }
    else{
        display_hours.classList.add("hidden");
        display_secret.classList.add("hidden");
    }
    
    display_hours.innerHTML = hours < 10 ? "0" + hours : hours;
    display_minutes.innerHTML = minutes < 10 ? "0" + minutes : minutes;
    display_seconds.innerHTML = seconds < 10 ? "0" + seconds : seconds;
}

function showHelp(){
    document.getElementById("help_text").classList.toggle("hidden");
}
