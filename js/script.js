console.log("let's write java script")
let currentSong = new Audio();
let songs;
let currFolder;
let isDragging = false;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}




async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //show all the song in playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + ` <li><img src="img/music.svg" alt="">
   <div class="info">
      <div>${song.replaceAll("%20", " ")}</div>
      <div>Himanshu</div>
   </div>
   <div class="playnow">
       <span>Playnow</span>
       <img src="img/play.svg" alt="">
   </div>
  </li> `
    }
      // Attach an event listener to each song
    Array.from(document.querySelector(".songlist ul").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", (element) => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim(), false, currentSong)
        })
    })
  return songs
}
const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track
    if (!pause) {

        currentSong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


};


//function for display albums
async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardcontainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
          if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            console.log(folder);                        
            //get the meta data of the folder
            let infoData = await fetch(`/songs/${folder}/info.json`);
            let infoResponse = await infoData.json();
            // console.log(infoResponse)


            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card rounded">
    <div class="play">
        <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="24" style="fill: #1ed760; stroke: none;" />

            <svg x="10" y="10" width="30" height="30" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4L19 12L5 20Z" style="fill: #000000;" />
            </svg>
        </svg>
    </div>
    <img src="/songs/${folder}/cover.png" alt="">
    <h3 class="cardhead">${infoResponse.tittle}</h3>
    <p>${infoResponse.description}</p>
</div> `
        }
    }
            //load the playlist whenever card is click
            Array.from(document.getElementsByClassName("card")).forEach((e) => {
                e.addEventListener("click", async item => {
                    // console.log(item.target, item.currentTarget.dataset)
                    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                    playMusic(songs[0])

                })
            })
        }




async function main() {
    // Get the list of all the songs
    await getSongs("songs/ncs");
    //  let currentSong= new Audio();
    playMusic(songs[0], true)
    //display all the albums on the page
    displayAlbums()






    //Attach and event listner to previus and play
    const play = document.getElementById("play")
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

   //listen for time update event 
   currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
})

      // Add an event listener to seekbar
      document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
        console.log(`percent: ${percent}, currentTime: ${currentSong.currentTime}`);

    })

    //add an event listner to menubar
    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0 + "%"
    })
    //add event listner to close menu bar
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%"
    })
    //add an event listner to previous 
    const previous = document.getElementById("previous")
    previous.addEventListener("click", () => {
        console.log("previous click")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    //add an event listner to  next 
    const next = document.getElementById("next")
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("next click")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(index)

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }


    })
    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e,e.target,e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
        if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
        else if(currentSong.volume == 0){
            document.querySelector(".volume>img").src= document.querySelector(".volume>img").src.replace("volume.svg","mute.svg")
        }

    })
    //add an event lisnet to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        // console.log(e.target)
        // console.log("changing", e.target.src)
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0

        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume=.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }


    })






}
main()
