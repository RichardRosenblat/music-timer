//working video url: https://www.youtube.com/watch?v=MkQW5xr9iGc
//not working video url: https://youtu.be/ETEg-SB01QY

function onYouTubeIframeAPIReady() {
    Video.CreatePlayer();
}

const Application = {
    Load: () => {
        SongStorage.Create();
        Sounds.LoadAlarm();
        Video.LoadIframeAPI();
        Display.UpdateSavedSongsTable();
    }
}

const States = {
    ApplicationState: "idle",
    ChangeStatesTo: (state) => {

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
                States.ApplicationState = "idle";
            },
            "playing": function () {
                Display.HideOvertimeDisplay();
                Buttons.SetPauseButton();
                Display.LockDisplayForKeyboard();
                Time.StopTimer();
                Time.StartTimer();
                Display.HideNegativeSign();
                Video.PlayVideo();
                States.ApplicationState = "playing";
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
                States.ApplicationState = "overtimed";
            },
            "paused": function () {
                Buttons.SetResumeButton();
                Display.UnlockDisplayForKeyboard();
                Time.StopTimer();
                Video.PauseVideo();
                States.ApplicationState = "paused";
            }
        };
        StatesChangeActions[state]();
        Buttons.BlurButtons();
        Display.UpdateDisplays();
    },
    CycleStates: () => {
        const stateChange = {
            "idle": function () {
                States.ChangeStatesTo("playing");
            },
            "playing": function () {
                States.ChangeStatesTo("paused");
            },
            "overtimed": function () {
                States.ChangeStatesTo("paused");
            },
            "paused": function () {
                if (Time.IsTimerOvertimed()) {
                    States.ChangeStatesTo("overtimed");
                    return;
                }
                States.ChangeStatesTo("playing");
            }
        };
        stateChange[States.ApplicationState]();
    }
}

const Buttons = {
    SetStartButton: () => {
        document.getElementById("start").innerHTML = "Start";
        document.getElementById("start").classList.add("btn-primary");
        document.getElementById("start").classList.remove("btn-success");
        document.getElementById("start").classList.remove("btn-secondary");
    },
    SetResumeButton: () => {
        document.getElementById("start").innerHTML = "Resume";
        document.getElementById("start").classList.remove("btn-primary");
        document.getElementById("start").classList.add("btn-success");
        document.getElementById("start").classList.remove("btn-secondary");
    },
    SetPauseButton: () => {
        document.getElementById("start").innerHTML = "Pause";
        document.getElementById("start").classList.remove("btn-primary");
        document.getElementById("start").classList.remove("btn-success");
        document.getElementById("start").classList.add("btn-secondary");
    },
    BlurButtons: () => {
        document.getElementById("start").blur();
        document.getElementById("clear").blur();
    },
    UpdateHideButton: () => {
        if (Video.HasVideoBeenSet()) {
            document.getElementById("hide_show_button").disabled = false;
        }
        if (document.getElementById("player").classList.contains("hidden")) {
            document.getElementById("hide_show_img").src = "./assets/images/show.png";
            return;
        }
        document.getElementById("hide_show_img").src = "./assets/images/hide.png";
    },
    UpdateMuteButton: () => {
        if (Video.HasVideoBeenSet()) {
            document.getElementById("mute_sound_button").disabled = false;
        }
        if (!(Video.IsMuted() || Video.IsMuted() === undefined)) {
            document.getElementById("mute_sound_img").src = "./assets/images/volume.png";
            return;
        }
        document.getElementById("mute_sound_img").src = "./assets/images/mute.png";
    },
    UpdateSaveButton: () => {
        let linkLabel = document.getElementById("link_label");
        let saveButton = document.getElementById("save_button");

        if (linkLabel.value == "" && SongStorage.Queue.LastSong == "") {
            saveButton.disabled = true;
            return;
        }

        saveButton.disabled = false;
    },
    OpenSongLink: (el) => {
        window.open(el.innerHTML, '_blank')
    }
}

const Input = {
    RecieveInput: (e) => {
        const keyboardShortcuts = {
            "ArrowRight": () => {
                document.getElementById("atb_+30s").click();
            },
            "ArrowLeft": () => {
                document.getElementById("atb_-30s").click();
            },
            "ArrowUp": () => {
                document.getElementById("atb_+1m").click();
            },
            "ArrowDown": () => {
                document.getElementById("atb_-1m").click();
            },
            "PageUp": () => {
                document.getElementById("atb_+5m").click();
            },
            "PageDown": () => {
                document.getElementById("atb_-5m").click();
            },
            "Home": () => {
                document.getElementById("atb_+10m").click();
            },
            "End": () => {
                document.getElementById("atb_-10m").click();
            },
            "Enter": () => {
                document.getElementById("start").click();
            },
            "Delete": () => {
                document.getElementById("clear").click();
            },

            "d": () => {
                keyboardShortcuts.ArrowRight();
            },
            "a": () => {
                keyboardShortcuts.ArrowLeft();
            },
            "w": () => {
                keyboardShortcuts.ArrowUp();
            },
            "s": () => {
                keyboardShortcuts.ArrowDown();
            },
            "e": () => {
                keyboardShortcuts.PageUp();
            },
            "q": () => {
                keyboardShortcuts.PageDown();
            },
            "r": () => {
                keyboardShortcuts.Home();
            },
            "f": () => {
                keyboardShortcuts.End();
            },
            " ": () => {
                keyboardShortcuts.Enter();
            },
            "Escape": () => {
                keyboardShortcuts.Delete();
            },
        };

        const key = e.key;

        if (document.getElementById("link_label") === document.activeElement) {
            if (key == "Enter") {
                document.getElementById("set_video_button").click();
            }
            return;
        }

        try {
            keyboardShortcuts[key]();
            e.preventDefault();
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

                Time.RemainingTime = (hours * 3600) + (minutes * 60) + seconds;

                Display.UpdateDisplays();
            }
        }
    }
}

const Time = {
    TimerId: 0,
    RemainingTime: 0,
    AlterMinutes: (value) => {
        Time.AlterSeconds(value * 60);
    },
    AlterSeconds: (value) => {
        if (Time.IsTimerOvertimed()) {
            if (Time.RemainingTime - value <= 0) {
                Time.RemainingTime = (Time.RemainingTime - value) * -1;
                States.ChangeStatesTo("playing");
            } else {
                Time.RemainingTime -= value;
            }
        } else {
            if (Time.RemainingTime + value <= 0) {
                Time.RemainingTime = 0;
            } else {
                Time.RemainingTime += value;
            }
        }
        Display.UpdateDisplays();
    },
    StartTimer: () => {
        Time.TimerId = setInterval(() => {
            if (States.ApplicationState != "overtimed" && --Time.RemainingTime <= 0) {
                Time.ClearTimer();
                States.ChangeStatesTo("overtimed");
            } else if (States.ApplicationState == "overtimed") {
                Time.RemainingTime++;
            }
            Display.UpdateDisplays();
        }, 1000);
    },
    StopTimer: () => {
        clearInterval(Time.TimerId);
    },
    ClearTimer: () => {
        Time.RemainingTime = 0;
    },
    IsTimerOvertimed: () => {
        return Display.HasDisplayOvertime();
    }
}

const Display = {
    UpdateDisplays() {

        if (States.ApplicationState == 'playing') {
            Video.PlayVideo();
        }

        let hours = parseInt(Time.RemainingTime / 3600, 10);
        let minutes = parseInt((Time.RemainingTime / 60) % 60, 10);
        let seconds = parseInt(Time.RemainingTime % 60, 10);

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
            if (States.ApplicationState == 'idle') {
                return;
            }
            let newTitle = "Music Timer (" +
                (Time.IsTimerOvertimed() ? "-" : "") +
                (hours <= 0 ? "" : display_hours.innerHTML + ":") +
                display_minutes.innerHTML + ":" +
                display_seconds.innerHTML + ')';

            document.querySelector('title').textContent = newTitle;
        }
    },
    UnlockDisplayForKeyboard() {
        document.getElementById("display").classList.remove("locked");
        document.getElementById("lock_image").classList.add("hidden");
    },
    LockDisplayForKeyboard() {
        document.getElementById("display").classList.add("locked");
        document.getElementById("lock_image").classList.remove("hidden");
    },
    IsDisplayLocked() {
        return document.getElementById("display").classList.contains("locked");
    },
    SetDefaultTitle() {
        document.querySelector('title').textContent = 'Music Timer';
    },
    ShowVideoError(errorCode) {
        const videoErrorAlert = document.getElementById("video_error")
        let miliseconds;
        switch (errorCode) {
            case 150:
            case 101:
                videoErrorAlert.innerHTML = "The owner of the video does not allow it to be embedded!"
                miliseconds = 9000
                break;
            case 100:
                videoErrorAlert.innerHTML = "Video not found!"
                miliseconds = 5000
                break;
            case 5:
                videoErrorAlert.innerHTML = "This video cannot be played on website players!"
                miliseconds = 9000
                break;
            case 2:
                return;
            default:
                videoErrorAlert.innerHTML = "Invalid youtube video!"
                miliseconds = 5000
                break;
        }

        videoErrorAlert.classList.remove("hidden")
        setTimeout(function () {
            Display.HideVideoError();
        }, miliseconds);
    },
    HideVideoError() {
        document.getElementById("video_error").classList.add("hidden")
    },
    ClearLinkLabel() {
        document.getElementById("link_label").value = "";
    },
    HidePlayer() {
        document.getElementById("player").classList.add("hidden")
    },
    ShowPlayer() {
        document.getElementById("player").classList.remove("hidden")
    },
    ToggleVideo() {
        document.getElementById("player").classList.toggle("hidden");
        Buttons.UpdateHideButton();
    },
    ShowOvertimeDisplay() {
        document.getElementById("display_div").classList.add("overtimed");
    },
    HideOvertimeDisplay() {
        document.getElementById("display_div").classList.remove("overtimed");
    },
    HasDisplayOvertime() {
        return document.getElementById("display_div").classList.contains("overtimed")
    },
    ShowNegativeSign() {
        document.getElementById("display_negative").classList.remove("hidden");
    },
    HideNegativeSign() {
        document.getElementById("display_negative").classList.add("hidden");
    },
    GetLinkLabelValue() {
        return document.getElementById("link_label").value;
    },
    UpdateSavedSongsTable() {
        let tableBody = document.getElementById("saves_table_body");
        let savedSongs = SongStorage.Read();

        deletePreviousTable();

        hideTableIfSaveEmpty();

        createNewTable();

        Display.UpdatePlayingNow();

        function hideTableIfSaveEmpty() {
            if (SongStorage.IsEmpty()) {
                Display.HideSavesTable();
            } else {
                Display.ShowSavesTable();
            }
        }

        function deletePreviousTable() {
            document.getElementById("saves_table_body").replaceChildren();
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
                    Video.SetVideoWithQueue(savedSong, i);
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
    },
    HideSavesTable() {
        document.getElementById("saves_table_div").classList.add("hidden");
    },
    ShowSavesTable() {
        document.getElementById("saves_table_div").classList.remove("hidden");
    },
    UpdatePlayingNow() {
        if (!SongStorage.Queue.IsEnabled) {
            return;
        }
        Display.SetPlayingNow(SongStorage.Queue.Index);
    },
    SetPlayingNow(index) {
        let tableRows = document.getElementById("saves_table_body").children;

        Display.ClearPlayingNow(tableRows);

        tableRows[index].classList.add("playing-now")
    },
    ClearPlayingNow() {
        let tableRows = document.getElementById("saves_table_body").children;
        for (let i = 0; i < tableRows.length; i++) {
            const element = tableRows[i];
            element.classList.remove("playing-now");
        }
    }
}

const Video = {
    Player: undefined,
    LoadIframeAPI() {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    },
    CreatePlayer() {
        Video.Player = new YT.Player('player', {
            height: '360',
            width: '640',
            events: {
                'onError': (event) => {
                    console.log(event.data);
                    Video.VideoErrorHandler(event.data);
                },
                'onStateChange': (event) => {
                    Video.OnPlayerStateChange(event.data)
                }
            }
        });
    },
    OnPlayerStateChange(playerState) {
        if (playerState == YT.PlayerState.ENDED) {
            SongStorage.Queue.Next();
        }
    },
    PlayVideo() {
        Video.Player.playVideo();
    },
    StopVideo() {
        Video.Player.stopVideo();
    },
    PauseVideo() {
        Video.Player.pauseVideo();
    },
    IsMuted() {
        return Video.Player.isMuted();
    },
    ToggleMute() {
        if (Video.IsMuted()) {
            Video.Player.unMute();
        } else {
            Video.Player.mute();
        }
        Buttons.UpdateMuteButton()


    },
    HasVideoBeenSet() {
        return !(Video.Player.getVideoUrl() === 'https://www.youtube.com/watch');
    },
    SetVideoWithoutQueue(link) {
        SongStorage.Queue.Disable();
        link === undefined ? Video.SetVideo() : Video.SetVideo(link);
        Buttons.UpdateSaveButton();
    },
    SetVideoWithQueue(link, index) {
        Video.SetVideoWithoutQueue(link)
        index === undefined ? SongStorage.Queue.Enable() : SongStorage.Queue.Enable(index);
    },
    SetVideo(link = Display.GetLinkLabelValue()) {

        SongStorage.Queue.LastSong = link;

        const linkType = Video.getVideoType(link);
        const id = Video.getVideoId(link, linkType);
        const index = Video.getVideoIndex(link, linkType);

        const linkTypeBehaviours = {
            "single": () => {
                Display.ShowPlayer();
                Video.Player.loadVideoById(id);
                Display.HideVideoError()
            },
            "playlist": () => {
                Display.ShowPlayer();
                Video.Player.loadPlaylist({
                    list: id,
                    listType: "playlist",
                    index: index
                });
                Display.HideVideoError();
            },
            "invalid": () => {
                Video.VideoErrorHandler(0);
            }
        }

        linkTypeBehaviours[linkType]();

        if (!SongStorage.Queue.IsEnabled) {
            let videoStateChecker = setInterval(() => {
                if (States.ApplicationState != 'playing' && Video.Player.getPlayerState() === YT.PlayerState.PLAYING) {
                    Video.StopVideo();
                    clearInterval(videoStateChecker);
                }
            }, 10);
        }

        Display.ClearLinkLabel();
        Buttons.UpdateHideButton();
        Buttons.UpdateMuteButton();

    },
    getVideoType(link) {
        if (link.match("https:\/\/(www\.)*youtu.*")) {
            if (link.includes("index") || link.includes("playlist?")) {
                return "playlist";
            }
            if (link.includes("watch?") || link.includes(".be/")) {
                return "single";
            }
        }
        return "invalid";
    },
    getVideoId(link, type) {
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
    },
    getVideoIndex(link, type) {
        if (type === 'playlist' && link.includes("index")) {
            return parseInt(link.split("index=").pop()) - 1;
        }

        return 0;
    },
    VideoErrorHandler(errorCode) {
        Display.ShowVideoError(errorCode);
        SongStorage.Queue.Next();
    },
    ClearVideo() {
        Video.Player.stopVideo();
        Video.Player.loadVideoById("000");
        Display.HidePlayer();
    }
}

const SongStorage = {
    SAVE_SEPARATOR : "###",
    Queue: {
        LastSong: "",
        IsEnabled: false,
        Index: 0,
        Disable() {
            SongStorage.Queue.IsEnabled = false;
            SongStorage.Queue.Index = 0;
            Display.ClearPlayingNow();
        },
        Enable(index = 0) {
            SongStorage.Queue.IsEnabled = true;
            SongStorage.Queue.Index = index;
            Display.SetPlayingNow(index);
        },
        Next() {
            if (!SongStorage.Queue.IsEnabled) {
                return;
            }

            let savedSongs = SongStorage.Read();
            if (++SongStorage.Queue.Index >= savedSongs.length) {
                SongStorage.Queue.Disable();
                return;
            }
            Display.UpdatePlayingNow();
            Video.SetVideo(savedSongs[SongStorage.Queue.Index])
        }
    },
    Create() {
        if (localStorage.savedSongs == null) {
            localStorage.savedSongs = "";
        }
    },
    Read() {
        let result = localStorage.savedSongs.split(SongStorage.SAVE_SEPARATOR);
        result.pop();

        return result;
    },
    Load() {
        if (SongStorage.IsEmpty()) {
            return;
        }
        let savedSongs = SongStorage.Read();
        Video.SetVideoWithQueue(savedSongs[0])
    },
    Save(song = Display.GetLinkLabelValue() == "" ? SongStorage.Queue.LastSong : Display.GetLinkLabelValue()) {

        const saveBehaviours = {
            'object': () => {
                song.push("");
                localStorage.savedSongs = song.join(SongStorage.SAVE_SEPARATOR);
            },
            'string': () => {
                localStorage.savedSongs += song + SongStorage.SAVE_SEPARATOR;
            }
        };

        try {
            saveBehaviours[typeof song]();
        } catch (error) {
            return;
        }

        Display.UpdateSavedSongsTable();
    },
    Delete(el) {
        if (el === undefined) {
            if (!confirm("Delete all saved songs?")) {
                return;
            }

            console.log("Deleting all saved songs");
            localStorage.savedSongs = "";
            SongStorage.Queue.Disable();
            Display.UpdateSavedSongsTable();

        } else {
            let savedSongs = SongStorage.Read();

            let itemIndex = (el.parentElement.parentElement.children[0].innerHTML) - 1;

            if (SongStorage.Queue.Index >= itemIndex && SongStorage.Queue.IsEnabled) {
                SongStorage.Queue.Index--;
            }

            savedSongs.splice(itemIndex, 1)

            SongStorage.Save(savedSongs);
        }

    },
    IsEmpty() {
        return SongStorage.Read().length == 0
    }
}

const Sounds = {
    Alarm: undefined,
    LoadAlarm() {
        Sounds.Alarm = new Audio('./assets/audio/ringtone.mp3');
    },
    PlayAlarm() {
        Sounds.Alarm.play();
    }
}

const Help = {
    ToggleHelp() {
        document.getElementById("help_text").classList.toggle("hidden");
    }
}