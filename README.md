# Lighting

**Play Here: [https://hiddenwaffle.github.io/lighting] (https://hiddenwaffle.github.io/lighting)**
* Chrome desktop browser works best.
* Firefox works OK.
* Untested on Safari.
* Edge lags too much to be playable. 

## Credits

* Megan McDuffee - Music
* Alex Sengsoury - Building Model
* Alisa Tana - Sprites
* Anthony Villena - Design and Programming
* AI is based on Yiyuan Lee's research on [algorithm and weights] (https://codemyroad.wordpress.com/2013/04/14/tetris-ai-the-near-perfect-player/)
* Sound FX are CC0 and acquired from [freesound.org] (https://www.freesound.org/): [1] (https://www.freesound.org/people/claudiooliveira2/sounds/155599/), [2] (https://www.freesound.org/people/RutgerMuller/sounds/364860/), [3] (https://www.freesound.org/people/Adam_N/sounds/324891/), [4] (https://www.freesound.org/people/Adam_N/sounds/346684/)

## About

Lighting was written for GitHub's [Game Off 2016] (https://gameoff.github.com/), where the theme was to write a game loosely based on "hacking, modding, and/or augmenting".

A popular real-life hack is the repurposing of office building lights to simulate low resolution displays. This game was inspired by two events that showcased this type of hack:

* **Building Design** - Green Building, MIT, [2012] (http://hacks.mit.edu/by_year/2012/tetris/)
  * The building design, window lighting, and collapse animation came from this event.
  * There was no gameplay sound that I could tell from at this event, just the noise of the crowd, and I decided to keep it that way for the atmosphere of this game.
* **Gameplay Design** - Cira Centre, Philadelpha, [2014] (http://drexel.edu/now/archive/2014/June/Cira-Tetris-Guinness/)
  * The idea of having two competing buildings whose lines cleared affected each other came from this event.
* The idea of a crowd watching gathering, reacting, and then leaving came from videos of both events.

## Building

Install the latest gulp-cli if not already installed. This project was built with CLI version 1.2.2. 
<pre>
npm install gulpjs/gulp-cli -g
</pre>

Run the default task to build the dist directory and start a server for it.
<pre>
gulp
</pre>

The dist directory can be removed with the clean task
<pre>
gulp clean
</pre>
