/*
 * soundfile.js
 * Sounds used when the cards are moved
 * Authors: Dharani Adhikari, James Lungren, Elliot Hatch, Victor Murrafo
 * Reference Source: http://www.javascriptkit.com/script/script2/soundlink.shtml#current
 */

// Define list of audio file extensions and their associated audio types. 
// Add to it if your specified audio file isn't on this list:
var html5_audiotypes={ 
    "mp3": "audio/mpeg",
    "mp4": "audio/mp4",
    "ogg": "audio/ogg",
    "wav": "audio/wav"
}

//Creates the new sound from the loaded sounds
function createSound(sound){
    var solitaireAudio=document.createElement('audio')
    if (solitaireAudio.canPlayType){ //check support for HTML5 audio
	for (var i=0; i<arguments.length; i++){
	    var sourceel=document.createElement('source')
	    sourceel.setAttribute('src', arguments[i])
	    if (arguments[i].match(/\.(\w+)$/i))
		sourceel.setAttribute('type', html5_audiotypes[RegExp.$1])
	    solitaireAudio.appendChild(sourceel)
	}
	solitaireAudio.load()
	solitaireAudio.playclip=function(){
	    solitaireAudio.pause()
	    solitaireAudio.currentTime=0
	    solitaireAudio.play()
	}
	return solitaireAudio
    }
    else{
	return {playclip:function(){throw new Error("Your browser doesn't support HTML5 audio unfortunately")}};
    }
};

//Initialize two sound clips one for returned card and one for accepted card

var dropsound=createSound("audio/dropped.wav", "audio/dropped.mp3");
var returnsound=createSound("audio/return.ogg", "audio/return.mp3");
var winsound=createSound("audio/win.wav", "audio/win.mp3");
