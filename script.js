//working video url: https://www.youtube.com/watch?v=MkQW5xr9iGc
//not working video url: https://youtu.be/ETEg-SB01QY

function onYouTubeIframeAPIReady() {
    Video.CreatePlayer();
}

const Application = {
    Load() {
        SongStorage.Create();
        Sounds.LoadAlarm();
        Video.LoadIframeAPI();
        Display.SavedSongsTable.Update();
    }
}

const States = {
    appState: "idle",
    get ApplicationState() {
        return this.appState;
    },
    ChangeStatesTo(state) {

        const StatesChangeActions = {
            "idle": function ()  {
                Buttons.SetStartButton();
                Display.Timer.Lock.Unlock();
                Time.StopTimer();
                Time.ClearTime();
                Display.NegativeSign.Hide();
                Video.PauseVideo();
                Display.PageTitle.Reset();
                Display.OvertimeDisplay.Hide();
                // States.ApplicationState = "idle";
                this.applicationState = "idle";
            },
            "playing": function ()  {
                Display.OvertimeDisplay.Hide();
                Buttons.SetPauseButton();
                Display.Timer.Lock.Lock();
                Time.StopTimer();
                Time.StartTimer();
                Display.NegativeSign.Hide();
                Video.PlayVideo();
                // States.ApplicationState = "playing";
                this.applicationState = "playing";
            },
            "overtimed": function ()  {
                Buttons.SetPauseButton();
                Display.Timer.Lock.Lock();
                Time.StopTimer();
                Time.StartTimer();
                Video.PlayVideo();
                Sounds.PlayAlarm();
                Display.OvertimeDisplay.Show();
                Display.NegativeSign.Show();
                // States.ApplicationState = "overtimed";
                this.applicationState = "overtimed";
            },
            "paused": function ()  {
                Buttons.SetResumeButton();
                Display.Timer.Lock.Unlock();
                Time.StopTimer();
                Video.PauseVideo();
                // States.ApplicationState = "paused";
                this.applicationState = "paused";
            }
        };
        StatesChangeActions[state]();
        Buttons.BlurMainButtons();
        Display.Timer.UpdateDisplays();
    },
    CycleStates() {
        const stateChange = {
            "idle": () => {
                States.ChangeStatesTo("playing");
            },
            "playing": () => {
                States.ChangeStatesTo("paused");
            },
            "overtimed": () => {
                States.ChangeStatesTo("paused");
            },
            "paused": () => {
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
    SetStartButton() {
        let startButton = document.getElementById("start");

        startButton.innerHTML = "Start";
        startButton.classList.add("btn-primary");
        startButton.classList.remove("btn-success");
        startButton.classList.remove("btn-secondary");
    },
    SetResumeButton() {
        let startButton = document.getElementById("start");

        startButton.innerHTML = "Resume";
        startButton.classList.remove("btn-primary");
        startButton.classList.add("btn-success");
        startButton.classList.remove("btn-secondary");
    },
    SetPauseButton() {
        let startButton = document.getElementById("start");

        startButton.innerHTML = "Pause";
        startButton.classList.remove("btn-primary");
        startButton.classList.remove("btn-success");
        startButton.classList.add("btn-secondary");
    },
    BlurMainButtons() {
        document.getElementById("start").blur();
        document.getElementById("clear").blur();
    },
    UpdateHideButton() {
        document.getElementById("hide_show_button").disabled = Video.HasVideoBeenSet();
        if (document.getElementById("player").classList.contains("hidden")) {
            document.getElementById("hide_show_img").src = "./assets/images/show.png";
            return;
        }
        document.getElementById("hide_show_img").src = "./assets/images/hide.png";
    },
    UpdateMuteButton() {
        document.getElementById("mute_sound_button").disabled = Video.HasVideoBeenSet();
        if (!(Video.IsMuted() === undefined || Video.IsMuted())) {
            document.getElementById("mute_sound_img").src = "./assets/images/volume.png";
            return;
        }
        document.getElementById("mute_sound_img").src = "./assets/images/mute.png";
    },
    UpdateSaveButton() {
        let linkLabel = document.getElementById("link_label");
        let saveButton = document.getElementById("save_button");

        saveButton.disabled = linkLabel.value == "" && SongStorage.Queue.LastSong == "";
    },
    OpenSongLink(el) {
        window.open(el.innerHTML, '_blank');
    }
}

const Input = {
    RecieveInput(e) {
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
            if (Display.Timer.Lock.IsLocked()) {
                return;
            }
            recieveKeyboardInput(key);
        }


        function recieveKeyboardInput(key) {

            let hours = document.getElementById("display_hours").innerHTML;
            let minutes = document.getElementById("display_minutes").innerHTML;
            let seconds = document.getElementById("display_seconds").innerHTML;

            let hoursLen = hours.length;

            let display_array = Array.from(hours + minutes + seconds);

            if (key == "Backspace") {
                removeNumber(display_array);
            } else if (!isNaN(key)) {
                addNumber(display_array, key);
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

            function addNumber(display_array, key) {

                display_array.push(key);

                if (display_array[0] == "0") {
                    display_array.shift();
                    return;
                }

                hoursLen++;
            }

            function removeNumber(display_array) {
                display_array.unshift("0");
                display_array.pop();
            }

            function setRemainingTime(hours, minutes, seconds) {

                Time.RemainingTime = (hours * 3600) + (minutes * 60) + seconds;

                Display.Timer.UpdateDisplays();
            }
        }
    }
}

const Time = {
    TimerId: 0,
    RemainingTime: 0,
    AlterMinutes(value) {
        Time.AlterSeconds(value * 60);
    },
    AlterSeconds(value) {
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
        Display.Timer.UpdateDisplays();
    },
    StartTimer() {
        Time.TimerId = setInterval(() => {
            if (States.ApplicationState != "overtimed" && --Time.RemainingTime <= 0) {
                Time.ClearTime();
                States.ChangeStatesTo("overtimed");
            } else if (States.ApplicationState == "overtimed") {
                Time.RemainingTime++;
            }
            Display.Timer.UpdateDisplays();
        }, 1000);
    },
    StopTimer() {
        clearInterval(Time.TimerId);
    },
    ClearTime() {
        Time.RemainingTime = 0;
    },
    IsTimerOvertimed() {
        return Display.OvertimeDisplay.isActive();
    }
}

const Display = {
    Timer: {
        UpdateDisplays() {

            if (States.ApplicationState == 'playing') {
                Video.PlayVideo();
            }

            let hours = parseInt(Time.RemainingTime / 3600, 10);
            let minutes = parseInt((Time.RemainingTime / 60) % 60, 10);
            let seconds = parseInt(Time.RemainingTime % 60, 10);

            const display_hours = document.getElementById("display_hours");
            const display_minutes = document.getElementById("display_minutes");
            const display_seconds = document.getElementById("display_seconds");

            if (hours != 0) {
                Display.Timer.showHour();
            } else {
                Display.Timer.hideHour();
            }

            display_hours.innerHTML = hours < 10 ? "0" + hours : hours;
            display_minutes.innerHTML = minutes < 10 ? "0" + minutes : minutes;
            display_seconds.innerHTML = seconds < 10 ? "0" + seconds : seconds;

            Display.PageTitle.Update();
        },
        hideHour() {
            document.getElementById("display_hours").classList.add("hidden");
            document.getElementById("display_secret").classList.add("hidden");
        },
        showHour() {
            document.getElementById("display_secret").classList.remove("hidden");
            document.getElementById("display_hours").classList.remove("hidden");
        },
        Lock: {
            Unlock() {
                document.getElementById("display").classList.remove("locked");
                document.getElementById("lock_image").classList.add("hidden");
            },
            Lock() {
                document.getElementById("display").classList.add("locked");
                document.getElementById("lock_image").classList.remove("hidden");
            },
            IsLocked() {
                return document.getElementById("display").classList.contains("locked");
            },
        }
    },
    PageTitle: {
        Update() {
            if (States.ApplicationState == 'idle') {
                return;
            }

            let hours = parseInt(Time.RemainingTime / 3600, 10);

            const display_hours = document.getElementById("display_hours");
            const display_minutes = document.getElementById("display_minutes");
            const display_seconds = document.getElementById("display_seconds");

            let newTitle = "Music Timer (" +
                (Time.IsTimerOvertimed() ? "-" : "") +
                (hours <= 0 ? "" : display_hours.innerHTML + ":") +
                display_minutes.innerHTML + ":" +
                display_seconds.innerHTML + ')';

            document.querySelector('title').textContent = newTitle;
        },
        Reset() {
            document.querySelector('title').textContent = 'Music Timer';
        },
    },
    VideoError: {
        Show(errorCode) {
            const videoErrorAlert = document.getElementById("video_error")

            const videoErrorInfo = {
                message: "",
                miliseconds: 0
            }

            switch (errorCode) {
                case 150:
                case 101:
                    videoErrorInfo.message = "The owner of the video does not allow it to be embedded!";
                    videoErrorInfo.miliseconds = 9000;
                    break;
                case 100:
                    videoErrorInfo.message = "Video not found!";
                    videoErrorInfo.miliseconds = 5000;
                    break;
                case 5:
                    videoErrorInfo.message = "This video cannot be played on website players!";
                    videoErrorInfo.miliseconds = 9000;
                    break;
                case 2:
                    return;
                default:
                    videoErrorInfo.message = "Invalid youtube video!";
                    videoErrorInfo.miliseconds = 5000;
                    break;
            }

            videoErrorAlert.innerHTML = videoErrorInfo.message;
            videoErrorAlert.classList.remove("hidden");
            setTimeout(function () {
                Display.VideoError.Hide();
            }, videoErrorInfo.miliseconds);
        },
        Hide() {
            document.getElementById("video_error").classList.add("hidden");
        },
    },
    VideoPlayer: {
        Hide() {
            document.getElementById("player").classList.add("hidden");
        },
        Show() {
            document.getElementById("player").classList.remove("hidden");
        },
        Toggle() {
            document.getElementById("player").classList.toggle("hidden");
            Buttons.UpdateHideButton();
        },
        IsHidden() {
            return document.getElementById("player").classList.contains("hidden") && document.getElementById("hide_show_button").disabled === false;
        }
    },
    OvertimeDisplay: {
        Show() {
            document.getElementById("display_div").classList.add("overtimed");
        },
        Hide() {
            document.getElementById("display_div").classList.remove("overtimed");
        },
        isActive() {
            return document.getElementById("display_div").classList.contains("overtimed")
        },
    },
    NegativeSign: {
        Show() {
            document.getElementById("display_negative").classList.remove("hidden");
        },
        Hide() {
            document.getElementById("display_negative").classList.add("hidden");
        },
    },
    LinkLabel: {
        Clear() {
            document.getElementById("link_label").value = "";
        },
        GetValue() {
            return document.getElementById("link_label").value;
        },
    },
    SavedSongsTable: {
        Update() {
            let tableBody = document.getElementById("saves_table_body");
            let savedSongs = SongStorage.Read();

            if (hideTableIfSaveEmpty()) {
                return;
            }

            deletePreviousTable();

            createNewTable();

            Display.PlayingNow.Update();

            function hideTableIfSaveEmpty() {
                let isEmpty = SongStorage.IsEmpty();

                if (isEmpty) {
                    Display.SavedSongsTable.Hide();
                } else {
                    Display.SavedSongsTable.Show();
                }

                return isEmpty;
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
        Hide() {
            document.getElementById("saves_table_div").classList.add("hidden");
        },
        Show() {
            document.getElementById("saves_table_div").classList.remove("hidden");
        },
    },
    PlayingNow: {
        Update() {
            if (!SongStorage.Queue.IsEnabled) {
                return;
            }
            Display.PlayingNow.Set(SongStorage.Queue.Index);
        },
        Set(index) {
            let tableRows = document.getElementById("saves_table_body").children;

            Display.PlayingNow.Clear(tableRows);

            tableRows[index].classList.add("playing-now")
        },
        Clear() {
            let tableRows = document.getElementById("saves_table_body").children;
            for (let i = 0; i < tableRows.length; i++) {
                const element = tableRows[i];
                element.classList.remove("playing-now");
            }
        }
    },
}

const Video = {
    Player: {},
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
                'onStateChange': (event) => {
                    Video.PlayerStateChangeHandler(event.data);
                },
                'onError': (event) => {
                    console.log(event.data);
                    Video.PlayerErrorHandler(event.data);
                }
            }
        });
    },
    PlayerStateChangeHandler(playerState) {
        if (playerState == YT.PlayerState.ENDED) {
            SongStorage.Queue.Next();
        }
    },
    PlayerErrorHandler(errorCode) {
        Display.VideoError.Show(errorCode);
        SongStorage.Queue.Next();
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
        Buttons.UpdateMuteButton();
    },
    HasVideoBeenSet() {
        return SongStorage.Queue.LastSong == "";
    },
    SetVideoWithoutQueue(link) {
        SongStorage.Queue.Disable();
        link === undefined ? Video.SetVideo() : Video.SetVideo(link);
        Buttons.UpdateSaveButton();
    },
    SetVideoWithQueue(link, index) {
        Video.SetVideoWithoutQueue(link);
        index === undefined ? SongStorage.Queue.Enable() : SongStorage.Queue.Enable(index);
    },
    SetVideo(link = Display.LinkLabel.GetValue()) {

        SongStorage.Queue.LastSong = link;

        const linkType = Video.getVideoType(link);
        const id = Video.getVideoId(link, linkType);
        const index = Video.getVideoIndex(link, linkType);

        const linkTypeBehaviours = {
            "single": () => {
                if (!Display.VideoPlayer.IsHidden()) {
                    Display.VideoPlayer.Show();
                }
                Video.Player.loadVideoById(id);
                Display.VideoError.Hide();
            },
            "playlist": () => {
                if (!Display.VideoPlayer.IsHidden()) {
                    Display.VideoPlayer.Show();
                }
                Video.Player.loadPlaylist({
                    list: id,
                    listType: "playlist",
                    index: index
                });
                Display.VideoError.Hide();
            },
            "invalid": () => {
                Video.PlayerErrorHandler(0);
            }
        }

        linkTypeBehaviours[linkType]();

        if (!SongStorage.Queue.IsEnabled) {
            StopVideoAfterLoading();
        }

        Display.LinkLabel.Clear();
        Buttons.UpdateHideButton();
        Buttons.UpdateMuteButton();

        function StopVideoAfterLoading() {
            let videoStateChecker = setInterval(() => {
                if (States.ApplicationState != 'playing' && Video.Player.getPlayerState() === YT.PlayerState.PLAYING) {
                    Video.StopVideo();
                    clearInterval(videoStateChecker);
                }
            }, 10);
        }
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
    }
}

const SongStorage = {
    SaveSeparator: "###",
    Queue: {
        LastSong: "",
        IsEnabled: false,
        Index: 0,
        Disable() {
            SongStorage.Queue.IsEnabled = false;
            SongStorage.Queue.Index = 0;
            Display.PlayingNow.Clear();
        },
        Enable(index = 0) {
            SongStorage.Queue.IsEnabled = true;
            SongStorage.Queue.Index = index;
            Display.PlayingNow.Set(index);
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
            Display.PlayingNow.Update();
            Video.SetVideo(savedSongs[SongStorage.Queue.Index]);
        }
    },
    Create() {
        if (localStorage.savedSongs == null) {
            localStorage.savedSongs = "";
        }
    },
    Read() {
        let result = localStorage.savedSongs.split(SongStorage.SaveSeparator);
        result.pop();

        return result;
    },
    Load() {
        if (SongStorage.IsEmpty()) {
            return;
        }
        let savedSongs = SongStorage.Read();
        Video.SetVideoWithQueue(savedSongs[0]);
    },
    Save(song = Display.LinkLabel.GetValue() == "" ? SongStorage.Queue.LastSong : Display.LinkLabel.GetValue()) {

        const saveBehaviours = {
            'object': () => {
                song.push("");
                localStorage.savedSongs = song.join(SongStorage.SaveSeparator);
            },
            'string': () => {
                localStorage.savedSongs += song + SongStorage.SaveSeparator;
            }
        };

        try {
            saveBehaviours[typeof song]();
        } catch (error) {
            return;
        }

        Display.SavedSongsTable.Update();
    },
    Delete(el) {
        if (el === undefined) {
            if (!confirm("Delete all saved songs?")) {
                return;
            }

            console.log("Deleting all saved songs");
            localStorage.savedSongs = "";
            SongStorage.Queue.Disable();
            Display.SavedSongsTable.Update();

        } else {
            let savedSongs = SongStorage.Read();

            let itemIndex = (el.parentElement.parentElement.children[0].innerHTML) - 1;

            if (SongStorage.Queue.Index >= itemIndex && SongStorage.Queue.IsEnabled) {
                SongStorage.Queue.Index--;
            }

            savedSongs.splice(itemIndex, 1);

            SongStorage.Save(savedSongs);
        }

    },
    IsEmpty() {
        return SongStorage.Read().length == 0;
    }
}

const Sounds = {
    Alarm: {},
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