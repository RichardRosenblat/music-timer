var ApplicationState = "idle";

var RemainingTime = 0;
var Player;

var TimerId;

function onYouTubeIframeAPIReady() {
    Video.loadPlayer();
}
class Application {
    static load(){
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
    }
}


class States {
    static changeStatesTo(state) {
    
        const StatesChangeActions = {
            "idle": function () {
                Buttons.setStartButton();
                Display.unlockDisplayForKeyboard();
                Time.stopTimer();
                Time.clearTimer();
                Video.pauseVideo();
                Display.setDefaultTitle();
                ApplicationState = "idle";
            },
            "playing": function () {
                Buttons.setPauseButton();
                Display.lockDisplayForKeyboard();
                Time.startTimer();
                Video.playVideo()
                ApplicationState = "playing";
            },
            "paused": function () {
                Buttons.setResumeButton();
                Display.unlockDisplayForKeyboard();
                Time.stopTimer();
                Video.pauseVideo();
                ApplicationState = "paused";
            }
        
        };
        StatesChangeActions[state]();
        Buttons.blurButtons();
        Display.updateDisplays();
    }

    static cycleStates() {
        const stateChange = {
            "idle": function () {States.changeStatesTo("playing")},
            "playing": function () {States.changeStatesTo("paused")},
            "paused": function () {States.changeStatesTo("playing")}
        };
       stateChange[ApplicationState]();
    }
}

class Buttons {
    static setStartButton(){
        document.getElementById("start").innerHTML = "Start";
        document.getElementById("start").classList.add("btn-primary");
        document.getElementById("start").classList.remove("btn-success");
        document.getElementById("start").classList.remove("btn-secondary");
    }
    static setResumeButton(){
        document.getElementById("start").innerHTML = "Resume";
        document.getElementById("start").classList.remove("btn-primary");
        document.getElementById("start").classList.add("btn-success");
        document.getElementById("start").classList.remove("btn-secondary");
    }
    static setPauseButton(){
        document.getElementById("start").innerHTML = "Pause";
        document.getElementById("start").classList.remove("btn-primary");
        document.getElementById("start").classList.remove("btn-success");
        document.getElementById("start").classList.add("btn-secondary");
    }
    static blurButtons() {
        document.getElementById("start").blur();
        document.getElementById("clear").blur();
    }
}

class Input {

    static recieveInput(e) {
        const keyboardShortcuts = {
            "ArrowRight": function () {Time.alterSeconds(30)},
            "ArrowLeft": function () {Time.alterSeconds(-30)},
            "ArrowUp": function () {Time.alterMinutes(1)},
            "ArrowDown": function () {Time.alterMinutes(-1)},
            "PageUp": function () {Time.alterMinutes(5)},
            "PageDown": function () {Time.alterMinutes(-5)},
            "Home": function () {Time.alterMinutes(10)},
            "End": function () {Time.alterMinutes(-10)},
            "Enter": function () {States.cycleStates()},
            "Delete": function () {States.changeStatesTo("idle")},
            
            "d": function () {Time.alterSeconds(30)},
            "a": function () {Time.alterSeconds(-30)},
            "w": function () {Time.alterMinutes(1)},
            "s": function () {Time.alterMinutes(-1)},
            "e": function () {Time.alterMinutes(5)},
            "q": function () {Time.alterMinutes(-5)},
            "r": function () {Time.alterMinutes(10)},
            "f": function () {Time.alterMinutes(-10)},
            "Escape": function () {States.changeStatesTo("idle")},
        };

        const key = e.key;

        if (document.getElementById("link-label")===document.activeElement) {
            if (key =="Enter") {
                Video.setVideo();
            }
            return;
        }
    
        try {
            keyboardShortcuts[key]();
            return;
        } catch (err) {
            recieveKeyboardInput(key);
        }
        
    
        function recieveKeyboardInput(key) {
            if(Display.isDisplayLocked()){
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
                
                Display.updateDisplays();
            }
        }
    }
}

class Time {
    static alterMinutes(value) {
        this.alterSeconds(value * 60);
    }
    static alterSeconds(value) {
        if (RemainingTime + value <= 0) {
            RemainingTime = 0;
        }
        else {
            RemainingTime += value;
        }
        Display.updateDisplays();
    }

    static startTimer(){
        TimerId = setInterval(() => {
            if(--RemainingTime < 0){
                States.changeStatesTo("idle");
            }
            Display.updateDisplays();
        }, 1000);
    }
    static stopTimer(){
        clearInterval(TimerId);
    }
    static clearTimer() {
        Time.alterSeconds(RemainingTime*-1);
    } 
}

class Display {
    
    static updateDisplays() {
        
        let hours = parseInt(RemainingTime / 3600, 10);
        let minutes = parseInt((RemainingTime / 60) % 60, 10);
        let seconds = parseInt(RemainingTime % 60, 10);
    
        const display_secret = document.getElementById("display_secret");
    
        const display_hours = document.getElementById("display_hours");
        const display_minutes = document.getElementById("display_minutes");
        const display_seconds = document.getElementById("display_seconds");
    
        if (hours != 0) {
            showHour_display();
        }
        else{
            hideHour_display();
        }
        
        updatePageDisplay();
        updateTitleDisplay()
    
        function hideHour_display() {
            display_hours.classList.add("hidden");
            display_secret.classList.add("hidden");
        }
    
        function showHour_display() {
            display_secret.classList.remove("hidden");
            display_hours.classList.remove("hidden");
        }
    
        function updatePageDisplay() {
            display_hours.innerHTML = hours < 10 ? "0" + hours : hours;
            display_minutes.innerHTML = minutes < 10 ? "0" + minutes : minutes;
            display_seconds.innerHTML = seconds < 10 ? "0" + seconds : seconds;
        }
    
        function updateTitleDisplay() {
            if (ApplicationState == 'idle') {
                return;
            }
            let newTitle =  "Music Timer (" +
                            (hours <= 0 ? "" : display_hours.innerHTML + ":") +
                            display_minutes.innerHTML + ":" + 
                            display_seconds.innerHTML + ')';
    
            document.querySelector('title').textContent = newTitle;
        }
    }

    static unlockDisplayForKeyboard() {
        document.getElementById("display").classList.remove("locked");
        document.getElementById("lock_image").classList.add("hidden");
    }
    static lockDisplayForKeyboard() {
        document.getElementById("display").classList.add("locked");
        document.getElementById("lock_image").classList.remove("hidden");
    }
    static isDisplayLocked() {
        return document.getElementById("display").classList.contains("locked");
    }

    static setDefaultTitle() {
        document.querySelector('title').textContent = 'Music Timer';
    }
}

class Help {
    static toggleHelp(){
        document.getElementById("help_text").classList.toggle("hidden");
    }
}

class Video {
    static loadPlayer() {
        Player = new YT.Player('player', {
            height: '360',
            width: '640',
            videoId: 'x7SQaDTSrVg'
        });
    }

    static playVideo(){
        Player.playVideo();
    }
    static stopVideo(){
        Player.stopVideo();
    }
    static pauseVideo(){
        Player.pauseVideo();
    }

    static setVideo() {
        let link = document.getElementById("link-label").value;
        let id = getVideoId(link);
        let player = document.getElementById("player")
        let invalidVideoAlert = document.getElementById("invalid_video")
    
        isVideoIdValid(id,
            () => {
                invalidVideoAlert.classList.add("hidden")
                player.src=buildEmbedURL(id);
            },
            () => {
                invalidVideoAlert.classList.remove("hidden")
                setTimeout(function() {
                    invalidVideoAlert.classList.add("hidden")
                  }, 6000);
            }
        );
    
        function getVideoId(link) {
            if (link.includes("https://www.youtube.com")) {
                if (link.includes("start_radio")||link.includes("index")) {
                    return "000";
                }
                if (link.includes("playlist?")) {
                    return "000";
                }
                if (link.includes("watch?")) {
                    return link.substring(link.indexOf("=")+1);
                }
            }
            if (link.includes("https://youtu.be/")) {
                return link.substring(link.indexOf("/",8)+1)
            }
            return link;
        }
        
        function isVideoIdValid(id,callback,fail) {
            var img = new Image();
    
            img.src = "http://img.youtube.com/vi/" + id + "/mqdefault.jpg";
            img.onload = function () {
                if (this.width === 120) {
                    fail();
                    return;
                } 
                callback();
            }
    
        }
    
        function buildEmbedURL(id) {
            return "https://www.youtube.com/embed/"+id;
        }
    }
}


// Add "?&autoplay=1" to autoplay embeded youtube video
// https://www.youtube.com/embed/[CODE] = https://www.youtube.com/watch?v=
// https://www.youtube.com/embed/pXRviuL6vMY
// https://www.youtube.com/embed/videoseries?list=[CODE] = https://www.youtube.com/playlist?list=[CODE]
