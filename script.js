//working video url: https://www.youtube.com/watch?v=MkQW5xr9iGc
//not working video url: https://youtu.be/ETEg-SB01QY

const SAVE_SEPARATOR = "###"
var LastSong = "https://www.youtube.com/watch?v=MkQW5xr9iGc";
var ApplicationState = "idle";
var RemainingTime = 0;
var Player;
var TimerId;
var Alarm;


function onYouTubeIframeAPIReady() {
    Video.LoadPlayer();
}
class Application {
    static Load() {
        SongStorage.CreateSaveStorageIfInexistent();
        Sounds.LoadAlarm();
        Video.LoadIframeAPI();
        Display.UpdateSavedSongsTable();
    }
}

class States {
    static ChangeStatesTo(state) {

        const StatesChangeActions = {
            "idle": function () {
                Buttons.SetStartButton();
                Display.UnlockDisplayForKeyboard();
                Time.StopTimer();
                Time.ClearTimer();
                Display.HideNegativeSign();
                Video.PauseVideo();
                Display.SetDefaultTitle();
                Display.HideOvertimeDisplay();
                ApplicationState = "idle";
            },
            "playing": function () {
                Display.HideOvertimeDisplay();
                Buttons.SetPauseButton();
                Display.LockDisplayForKeyboard();
                Time.StopTimer();
                Time.StartTimer();
                Display.HideNegativeSign();
                Video.PlayVideo();
                ApplicationState = "playing";
            },
            "overtimed": function () {
                Buttons.SetPauseButton();
                Display.LockDisplayForKeyboard();
                Time.StopTimer();
                Time.StartTimer();
                Video.PlayVideo();
                Sounds.PlayAlarm();
                Display.ShowOvertimeDisplay();
                Display.ShowNegativeSign();
                ApplicationState = "overtimed";
            },
            "paused": function () {
                Buttons.SetResumeButton();
                Display.UnlockDisplayForKeyboard();
                Time.StopTimer();
                Video.PauseVideo();
                ApplicationState = "paused";
            }
        };
        StatesChangeActions[state]();
        Buttons.BlurButtons();
        Display.UpdateDisplays();
    }

    static CycleStates() {
        const stateChange = {
            "idle": function () {
                States.ChangeStatesTo("playing");
            },
            "playing": function () {
                States.ChangeStatesTo("paused");
            },
            "overtimed": function () {
                States.ChangeStatesTo("paused");
                Display.LockDisplayForKeyboard();
            },
            "paused": function () {
                if (Time.IsTimerOvertimed()) {
                    States.ChangeStatesTo("overtimed");
                    return;
                }
                States.ChangeStatesTo("playing");
            }
        };
        stateChange[ApplicationState]();
    }
}

class Buttons {
    static SetStartButton() {
        document.getElementById("start").innerHTML = "Start";
        document.getElementById("start").classList.add("btn-primary");
        document.getElementById("start").classList.remove("btn-success");
        document.getElementById("start").classList.remove("btn-secondary");
    }
    static SetResumeButton() {
        document.getElementById("start").innerHTML = "Resume";
        document.getElementById("start").classList.remove("btn-primary");
        document.getElementById("start").classList.add("btn-success");
        document.getElementById("start").classList.remove("btn-secondary");
    }
    static SetPauseButton() {
        document.getElementById("start").innerHTML = "Pause";
        document.getElementById("start").classList.remove("btn-primary");
        document.getElementById("start").classList.remove("btn-success");
        document.getElementById("start").classList.add("btn-secondary");
    }
    static BlurButtons() {
        document.getElementById("start").blur();
        document.getElementById("clear").blur();
    }
    static UpdateHideButton() {
        if (Video.HasVideoBeenSet()) {
            document.getElementById("hide_show_button").disabled = false;
        }
        if (document.getElementById("player").classList.contains("hidden")) {
            document.getElementById("hide_show_img").src = "./assets/images/show.png";
            return;
        }
        document.getElementById("hide_show_img").src = "./assets/images/hide.png";
    }
    static UpdateMuteButton() {
        if (Video.HasVideoBeenSet()) {
            document.getElementById("mute_sound_button").disabled = false;
        }
        if (!(Video.IsMuted() || Video.IsMuted() == undefined)) {
            document.getElementById("mute_sound_img").src = "./assets/images/volume.png";
            return;
        }
        document.getElementById("mute_sound_img").src = "./assets/images/mute.png";
    }

    static OpenSongLink(el) {
        window.open(el.innerHTML, '_blank')
    }
}

class Input {

    static RecieveInput(e) {
        const keyboardShortcuts = {
            "ArrowRight": function () {
                Time.AlterSeconds(30)
            },
            "ArrowLeft": function () {
                Time.AlterSeconds(-30)
            },
            "ArrowUp": function () {
                Time.AlterMinutes(1)
            },
            "ArrowDown": function () {
                Time.AlterMinutes(-1)
            },
            "PageUp": function () {
                Time.AlterMinutes(5)
            },
            "PageDown": function () {
                Time.AlterMinutes(-5)
            },
            "Home": function () {
                Time.AlterMinutes(10)
            },
            "End": function () {
                Time.AlterMinutes(-10)
            },
            "Enter": function () {
                States.CycleStates()
            },
            "Delete": function () {
                States.ChangeStatesTo("idle")
            },
            " ": function () {
                States.CycleStates()
            },

            "d": function () {
                Time.AlterSeconds(30)
            },
            "a": function () {
                Time.AlterSeconds(-30)
            },
            "w": function () {
                Time.AlterMinutes(1)
            },
            "s": function () {
                Time.AlterMinutes(-1)
            },
            "e": function () {
                Time.AlterMinutes(5)
            },
            "q": function () {
                Time.AlterMinutes(-5)
            },
            "r": function () {
                Time.AlterMinutes(10)
            },
            "f": function () {
                Time.AlterMinutes(-10)
            },
            "Escape": function () {
                States.ChangeStatesTo("idle")
            },
        };

        const key = e.key;

        if (document.getElementById("link-label") === document.activeElement) {
            if (key == "Enter") {
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
            if (Display.IsDisplayLocked()) {
                return;
            }

            let hours = document.getElementById("display_hours").innerHTML;
            let minutes = document.getElementById("display_minutes").innerHTML;
            let seconds = document.getElementById("display_seconds").innerHTML;

            let hoursLen = hours.length;

            let display_array = Array.from(hours + minutes + seconds);

            if (key == "Backspace") {
                removeNumber();
            } else if (!isNaN(key)) {
                addNumber();
            } else {
                return;
            }

            hours = display_array.slice(0, hoursLen);
            minutes = display_array.slice(hoursLen, hoursLen + 2);
            seconds = display_array.slice(hoursLen + 2, hoursLen + 4);

            hours = parseInt(hours.join(''));
            minutes = parseInt(minutes.join(''));
            seconds = parseInt(seconds.join(''));


            setRemainingTime(hours, minutes, seconds);

            function addNumber() {

                display_array.push(key);

                if (display_array[0] == "0") {
                    display_array.shift();
                    return;
                }

                hoursLen++;
            }

            function removeNumber() {
                display_array.unshift("0");
                display_array.pop();
            }

            function setRemainingTime(hours, minutes, seconds) {

                RemainingTime = (hours * 3600) + (minutes * 60) + seconds;

                Display.UpdateDisplays();
            }
        }
    }
}

class Time {
    static AlterMinutes(value) {
        this.AlterSeconds(value * 60);
    }
    static AlterSeconds(value) {
        if (ApplicationState != "overtimed") {
            if (RemainingTime + value <= 0) {
                RemainingTime = 0;
            } else {
                RemainingTime += value;
            }
        } else {
            if (RemainingTime - value <= 0) {
                RemainingTime = (RemainingTime - value) * -1;
                States.ChangeStatesTo("playing");
            } else {
                RemainingTime -= value;
            }
        }
        Display.UpdateDisplays();
    }

    static StartTimer() {
        TimerId = setInterval(() => {
            if (ApplicationState != "overtimed" && --RemainingTime <= 0) {
                Time.ClearTimer();
                States.ChangeStatesTo("overtimed");
            } else if (ApplicationState == "overtimed") {
                RemainingTime++;
            }
            Display.UpdateDisplays();
        }, 1000);
    }
    static StopTimer() {
        clearInterval(TimerId);
    }
    static ClearTimer() {
        RemainingTime = 0;
    }

    static IsTimerOvertimed() {
        return Display.HasDisplayOvertime();
    }
}

class Display {

    static UpdateDisplays() {

        if (ApplicationState == 'playing') {
            Video.PlayVideo();
        }

        let hours = parseInt(RemainingTime / 3600, 10);
        let minutes = parseInt((RemainingTime / 60) % 60, 10);
        let seconds = parseInt(RemainingTime % 60, 10);

        const display_secret = document.getElementById("display_secret");

        const display_hours = document.getElementById("display_hours");
        const display_minutes = document.getElementById("display_minutes");
        const display_seconds = document.getElementById("display_seconds");

        if (hours != 0) {
            showHour_display();
        } else {
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
            let newTitle = "Music Timer (" +
                (Time.IsTimerOvertimed() ? "-" : "") +
                (hours <= 0 ? "" : display_hours.innerHTML + ":") +
                display_minutes.innerHTML + ":" +
                display_seconds.innerHTML + ')';

            document.querySelector('title').textContent = newTitle;
        }
    }

    static UnlockDisplayForKeyboard() {
        document.getElementById("display").classList.remove("locked");
        document.getElementById("lock_image").classList.add("hidden");
    }
    static LockDisplayForKeyboard() {
        document.getElementById("display").classList.add("locked");
        document.getElementById("lock_image").classList.remove("hidden");
    }
    static IsDisplayLocked() {
        return document.getElementById("display").classList.contains("locked");
    }

    static SetDefaultTitle() {
        document.querySelector('title').textContent = 'Music Timer';
    }

    static ShowVideoError(errorCode) {
        const videoErrorAlert = document.getElementById("video_error")

        switch (errorCode) {
            case 150:
            case 101:
                videoErrorAlert.innerHTML = "The owner of the video does not allow it to be embedded!"
                break;
            case 100:
                videoErrorAlert.innerHTML = "Video not found!"
                break;
            case 5:
                videoErrorAlert.innerHTML = "This video cannot be played on website players!"
                break;
            case 2:
            default:
                videoErrorAlert.innerHTML = "Invalid youtube video!"
                break;
        }

        videoErrorAlert.classList.remove("hidden")
        setTimeout(function () {
            Display.HideVideoError();
        }, 3000);
    }
    static HideVideoError() {
        document.getElementById("video_error").classList.add("hidden")
    }

    static ClearLinkLabel() {
        document.getElementById("link-label").value = "";
    }

    static HidePlayer() {
        document.getElementById("player").classList.add("hidden")
    }
    static ShowPlayer() {
        document.getElementById("player").classList.remove("hidden")
    }

    static ToggleVideo() {
        document.getElementById("player").classList.toggle("hidden");
        Buttons.UpdateHideButton();
    }

    static ShowOvertimeDisplay() {
        document.getElementById("display_div").classList.add("overtimed");
    }
    static HideOvertimeDisplay() {
        document.getElementById("display_div").classList.remove("overtimed");
    }
    static HasDisplayOvertime() {
        return document.getElementById("display_div").classList.contains("overtimed")
    }

    static ShowNegativeSign() {
        document.getElementById("display-negative").classList.remove("hidden");
    }
    static HideNegativeSign() {
        document.getElementById("display-negative").classList.add("hidden");
    }

    static GetLinkLabelValue() {
        return document.getElementById("link-label").value;
    }

    static UpdateSavedSongsTable() {
        let tableBody = document.getElementById("saves-table-body");
        let savedSongs = SongStorage.Read();

        deletePreviousTable();

        hideTableIfSaveEmpty();

        createNewTable();

        function hideTableIfSaveEmpty() {
            if (SongStorage.IsSaveEmpty()) {
                Display.HideSavesTable();
            } else {
                Display.ShowSavesTable();
            }
        }

        function deletePreviousTable() {
            document.getElementById("saves-table-body").replaceChildren();
        }

        function createNewTable() {
            for (let i = 0; i < savedSongs.length; i++) {
                let savedSong = savedSongs[i];
                let row = document.createElement("tr");
                row.appendChild(createNumberCell(i));
                row.appendChild(createImageCell(savedSong));
                row.appendChild(createLinkCell(savedSong));
                row.appendChild(createRemoveCell());

                row.addEventListener("dblclick", () => {
                    Video.SetVideo(savedSong);
                });

                tableBody.appendChild(row);
            }

            function createNumberCell(i) {
                let cell = document.createElement("th");
                let number = document.createTextNode(i + 1);
                cell.setAttribute("scope", "row");
                cell.appendChild(number);
                return cell;
            }

            function createImageCell(savedSong) {
                let cell = document.createElement("td");
                let img = createImg(savedSong);

                cell.appendChild(img);

                return cell;

                function createImg(savedSong) {
                    let image = document.createElement("img");

                    let videoType = Video.getVideoType(savedSong);

                    if (videoType == "playlist") {
                        image.setAttribute("src", "assets\\images\\playlist.png");
                    } else {
                        let id = Video.getVideoId(savedSong, videoType);
                        image.setAttribute("src", "https://img.youtube.com/vi/" + id + "/mqdefault.jpg");
                    }

                    image.setAttribute("width", "75");
                    image.setAttribute("height", "42");

                    image.setAttribute("alt", "Video's thumbnail");
                    image.setAttribute("title", savedSong);

                    return image;
                }
            }

            function createLinkCell(savedSong) {

                let cell = document.createElement("td");

                cell.appendChild(createLinkButton());

                return cell;

                function createLinkButton() {
                    let linkButton = document.createElement("button");

                    let linkText = document.createTextNode(savedSong);

                    linkButton.appendChild(linkText);
                    linkButton.classList.add("btn");
                    linkButton.classList.add("btn-link");
                    linkButton.setAttribute("type", "button");
                    linkButton.addEventListener("click", () => {
                        Buttons.OpenSongLink(linkButton);
                    });

                    return linkButton;
                }

            }

            function createRemoveCell() {

                let cell = document.createElement("td");

                cell.appendChild(createRemoveButton());

                return cell;

                function createRemoveButton() {
                    let removeButton = document.createElement("button");

                    let removeText = document.createTextNode("x");

                    removeButton.appendChild(removeText);
                    removeButton.classList.add("btn");
                    removeButton.classList.add("btn-danger");
                    removeButton.setAttribute("type", "button");
                    removeButton.addEventListener("click", () => {
                        SongStorage.Delete(removeButton);
                    });

                    return removeButton;
                }

            }
        }
    }

    static HideSavesTable() {
        document.getElementById("saves-table-div").classList.add("hidden");
    }
    static ShowSavesTable() {
        document.getElementById("saves-table-div").classList.remove("hidden");
    }
}

class Video {
    static LoadIframeAPI() {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    static LoadPlayer() {
        Player = new YT.Player('player', {
            height: '360',
            width: '640',
            events: {
                'onError': (event) => {
                    console.log(event.data);
                    Display.ShowVideoError(event.data);
                },
                // 'onStateChange': Video.StateChange()
            }
        });
    }

    static PlayVideo() {
        Player.playVideo();
    }
    static StopVideo() {
        Player.stopVideo();
    }
    static PauseVideo() {
        Player.pauseVideo();
    }
    static IsMuted() {
        return Player.isMuted();
    }

    static ToggleMute() {
        if (Video.IsMuted()) {
            Player.unMute();
        } else {
            Player.mute();
        }
        Buttons.UpdateMuteButton()


    }
    static HasVideoBeenSet() {
        return !(Player.getVideoUrl() === 'https://www.youtube.com/watch');
    }

    static SetVideo(link = Display.GetLinkLabelValue()) {

        LastSong = link;

        const linkType = Video.getVideoType(link);
        const id = Video.getVideoId(link, linkType);
        const index = Video.getVideoIndex(link, linkType);

        const linkTypeBehaviours = {
            "single": () => {
                Display.ShowPlayer();
                Player.loadVideoById(id);
                Display.HideVideoError()
            },
            "playlist": () => {
                Display.ShowPlayer();
                Player.loadPlaylist({
                    list: id,
                    listType: "playlist",
                    index: index
                });
                Display.HideVideoError();
            },
            "invalid": () => {
                Display.ShowVideoError(2);
            }
        }

        linkTypeBehaviours[linkType]();


        let videoStateChecker = setInterval(() => {
            if (ApplicationState != 'playing' && Player.getPlayerState() === 1) {
                Video.StopVideo();
                clearInterval(videoStateChecker);
            }
        }, 10);

        Display.ClearLinkLabel();
        Buttons.UpdateHideButton();
        Buttons.UpdateMuteButton();

    }

    static getVideoType(link) {
        if (link.match("https:\/\/(www\.)*youtu.*")) {
            if (link.includes("index") || link.includes("playlist?")) {
                return "playlist";
            }
            if (link.includes("watch?") || link.includes(".be/")) {
                return "single";
            }
        }
        return "invalid";
    }

    static getVideoId(link, type) {
        const typeBehaviour = {
            "single": () => {
                if (link.includes("watch?")) {
                    return link.substring(link.indexOf("=") + 1);
                }

                return link.substring(link.indexOf("/", 8) + 1);
            },
            "playlist": () => {
                if (link.includes("index")) {
                    return link.split("list=").pop().split("&").shift();
                }
                return link.split("list=").pop();
            },
            "invalid": () => {
                return;
            }
        }

        try {
            return typeBehaviour[type]();
        } catch (error) {
            return;
        }
    }

    static getVideoIndex(link, type) {
        if (type === 'playlist' && link.includes("index")) {
            return parseInt(link.split("index=").pop()) - 1;
        }

        return 0;
    }

    static ClearVideo() {
        Player.stopVideo();
        Player.loadVideoById("000");
        Display.HidePlayer();
    }
}

class Sounds {
    static LoadAlarm() {
        Alarm = new Audio('./assets/audio/ringtone.mp3');
    }

    static PlayAlarm() {
        Alarm.play();
    }
}

class SongStorage {
    static CreateSaveStorageIfInexistent() {
        if (localStorage.savedSongs == null) {
            localStorage.savedSongs = "";
        }
    }

    static Read() {
        let result = localStorage.savedSongs.split(SAVE_SEPARATOR);
        result.pop();

        return result;
    }

    static Load() {
        console.log(SongStorage.Read());

        // go one by one from array and queue them
        // if link is a playlist it will call the add playlist function
    }

    static Save(song = Display.GetLinkLabelValue() == "" ? LastSong : Display.GetLinkLabelValue()) {
        const saveBehaviours = {
            'object': () => {
                song.push("");
                localStorage.savedSongs = song.join(SAVE_SEPARATOR);
            },
            'string': () => {
                localStorage.savedSongs += song + SAVE_SEPARATOR;
            }
        };

        try {
            saveBehaviours[typeof song]();
        } catch (error) {
            return;
        }

        Display.UpdateSavedSongsTable();
    }

    static Delete(el) {
        if (el === undefined) {
            if (!confirm("Delete all saved songs?")) {
                return;
            }

            console.log("Deleting all saved songs");
            localStorage.savedSongs = "";
            Display.UpdateSavedSongsTable();

        } else {
            let savedSongs = SongStorage.Read();

            let indexOfItemToRemove = (el.parentElement.parentElement.children[0].innerHTML) - 1;

            savedSongs.splice(indexOfItemToRemove, 1)

            SongStorage.Save(savedSongs);
        }

    }

    static IsSaveEmpty() {
        return SongStorage.Read().length == 0
    }
}

class Help {
    static ToggleHelp() {
        document.getElementById("help_text").classList.toggle("hidden");
    }
}