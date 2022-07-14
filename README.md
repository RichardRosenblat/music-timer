# music-timer
>Project in production: https://richard-music-timer.herokuapp.com/ 

This meeting-focused application allows the user to set videos and play them for a given timeframe. 

![](https://img.shields.io/github/license/RichardRosenblat/music-timer?style=for-the-badge)

## Table of Contents
- [music-timer](#music-timer)
  - [Table of Contents](#table-of-contents)
  - [How to install and open the project](#how-to-install-and-open-the-project)
  - [Features](#features)
    - [Timer](#timer)
      - [Timer Control](#timer-control)
    - [Video Player](#video-player)
      - [Video Player control](#video-player-control)
    - [Save and Load](#save-and-load)
      - [Save and Load control](#save-and-load-control)
  - [Author / Support](#author--support)

## How to install and open the project
 1. Clone the project:
  
  git clone https://github.com/RichardRosenblat/music-timer.git

 2. Open project using the editing tool of your preference (E.g. Visual Studio code):
  
  code .

 
## Features
 >Please be aware, some features are *still in development*, so no image shown here will necessarily represent the final product.
### Timer
 ![](https://github.com/RichardRosenblat/github-assets/blob/main/Music-Timer/Clock.png?raw=true) 

 The application contains a timer, which counts down from an interval specified by the user. (Check [Timer Control](#timer-control) for all the possible ways to input and alter the time) 
 Once the timer is started, if a video has been set, it will start playing. Likewise, once the timer is paused or cleared, the video will stop playing. (Check [Video Player](#video-player) for more information on the player feature) 
 After the time reaches `00:00` the application will play an alarm sound and start counting the seconds upwards, marking how many seconds have passed since the given time; during this period; it is still possible to add or remove seconds and minutes.
 ### Timer Control
 1. Right hand:
     * **ArrowUp**: Adds 30 seconds
     * **ArrowDown**: Minus 30 seconds
     * **ArrowRight**: Adds 1 minute
     * **ArrowLeft**: Minus 1 minute
     * **PageUp**: Adds 5 minutes
     * **PageDown**: Minus 5 minutes
     * **Home**: Adds 10 minutes
     * **End**: Minus 10 minutes
     * **Enter**: Start/Pause
     * **Delete**: Stop/Clear
 2. Left hand:
     * **W**: Adds 30 seconds
     * **S**: Minus 30 seconds
     * **D**: Adds 1 minute
     * **A**: Minus 1 minute
     * **E**: Adds 5 minutes
     * **Q**: Minus 5 minutes
     * **R**: Adds 10 minutes
     * **F**: Minus 10 minutes
     * **Space**: Start/Pause
     * **Esc**: Stop/Clear
 3. Buttons: 
     * **Start/Clear**: These buttons will start/pause/play and clear the timer, accordingly
     * **Buttons ranging from -10m to +10m**: These buttons will remove or add the specified amount of time
 4. Keyboard: (The application will *not* receive keyboard input while the timer is active)
    * **Numbers from 0-1:** These numbers will be added at the end of the time displayed on the screen (Something akin to a microwave display)
    * **Backspace:** Backspace will remove the last number from the display, moving all other numbers to the right (For example, pressing backspace with the display as `01:00` would cause the time to become `00:10`)

### Video Player
 ![](https://github.com/RichardRosenblat/github-assets/blob/main/Music-Timer/Video.png?raw=true) 
 The application is able to play songs and playlists using the [YouTube Player API](https://developers.google.com/youtube/iframe_api_reference). Allowing the user to write or paste a YouTube link in the text-area of the application and set it on the player. 
 The user can play the video and use the already existing buttons on the player. 
 The video will automatically play once the timer is started or resumed and it will pause whenever the timer is stopped or cleared. 
 If the video has been loaded from the saved songs table, once it ends, the next video on the table will play, if any. (Check [Save and Load](#save-and-load) for more details on the feature) 
 Do be aware, **some videos have their privacy configurations set so that they are not able to be embedded**, in the case of an error, the application will show an error text and skip to the next song if possible. 
### Video Player control
 1. Setting up a video
      * To set a video, first paste an youtube link on the text area. E.g.
        * https://youtu.be/F5tSoaJ93ac
        * https://www.youtube.com/watch?v=WIKqgE4BwAY
        * https://www.youtube.com/playlist?list=PLAZNU5fM7FIC4ruXQhKjpuvP0AByhc0bl
        * https://www.youtube.com/watch?v=XKFofNyyhNU&list=PLbHUA-o_5dgKIcvpPs10ftV9AdaV_hNN1&index=1
 2. Picking a saved video
      * If you double click on a row in the saved songs table, said video will be set on the player, with the next video on the list being played after it, if any
 3. Hide and mute buttons
      * The buttons hide and mute will hide the player, leaving only the audio and mute the audio of the video, respectively

### Save and Load
![](https://github.com/RichardRosenblat/github-assets/blob/main/Music-Timer/Load%20and%20Save.png?raw=true) 

The application contains a table in which users can save videos or playlists so that they can be played later.  
The song can be either the last one set on the player or the link written in the text area.
Once saved the user can either *double click* on the row and play the song or click on load and start from the first song on the table.  
Videos loaded from the saved songs table will play in a queue-like fashion and play one after the other until the end of the rows of the table.  
During the reproduction of the queue, the current song will be highlighted.  
To remove songs, the user can either click on the remove button on the row of the song or click on the delete save button, in which case will delete the entire table after a confirmation prompt.

### Save and Load control
  1. Save a video or playlist
     * To save a video or playlist, the user can use of two ways
       * Paste a link on the text area and press the save button
       * Set a song on the player and press the save button (This will not work if you have something written on the text area while pressing the save button)
  2. Load the saved songs table
     * To play the songs saved on the table press the load button and the first song will be set and the other songs will be reproduced on a queue
  3. Load a specific video or playlist
     * To load a specific song, double click on a row of the table and the song from that row will be set, and after it ends the queue will continue from that point
  4. Delete a specific video or playlist
     * To delete a specific video press the X button on the remove column on the table; it will remove only that row from the table
     * If the deleted video is the currently playing, the application will remove the video from the table and once it finishes the next video will play normally 
  5. Delete all saved songs
     * The user can delete all songs saved by pressing the delete save button, which will prompt the user for confirmation
     * In case of confirmation the table will be cleared and all songs removed
     * If the queue was playing during the deletion of the table, the song will finish normally and no song will play after the conclusion of such

## Author / Support
> Any doubts and suggestions are welcome. Feel free to contact me and I will answer as soon as possible.
 
 Richard Rosenblat
 * rosenblatr@gmail.com 
 * https://www.linkedin.com/in/richard-rosenblat/ 
 * https://github.com/RichardRosenblat 
