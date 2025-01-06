"use strict";

// DOM Elements
const backgroundAudio = document.getElementById('background-audio');
const toggleButton = document.getElementById('sound-toggle-button');
const voiceOverAudio = document.getElementById('voice-over-audio');

// State Variables
let audioInitialized = false;
let lastPlayedSectionId = '';
let voiceOverAudioTimeout = 0;

// Get all sections
const sections = document.querySelectorAll('section');

// Function to update URL based on currently visible section
function updateUrl() {
    const scrollPosition = window.scrollY;

    // Find the currently visible section
    const currentSection = [...sections].find(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight / 2;
        const sectionHeightDifference = section.clientHeight - sectionHeight;
        return (
            scrollPosition + sectionHeightDifference >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
        );
    });

    if (!currentSection) return;

    const sectionId = currentSection.id;

    // Set URL hash to the id of the visible section
    window.history.replaceState(null, null, `#${sectionId}`);
    playVoiceOver(sectionId);
}

// Function to get current section id from URL
function getCurrentSectionIdFromUrl() {
    const url = window.location.href;
    // Split the URL by '#' and get the second part
    return url.split('#')[1];
}

// Function to debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this,
            args = arguments;
        const later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Toggle playback function
function togglePlayback() {
    if (backgroundAudio.paused) {
        playBackgroundAudio();
        lastPlayedSectionId = null;
        playVoiceOver(getCurrentSectionIdFromUrl());
    } else {
        pauseBackgroundAudio();

        lastPlayedSectionId = null;
        clearTimeout(voiceOverAudioTimeout);
        if (!voiceOverAudio.paused) {
            pauseAndResetAudio(voiceOverAudio);
        }
    }
}

// Play background audio
function playBackgroundAudio() {
    backgroundAudio.play();
    toggleButton.innerHTML = '<ion-icon name="volume-high"></ion-icon> Mute';
}

// Pause background audio
function pauseBackgroundAudio() {
    backgroundAudio.pause();
    toggleButton.innerHTML = '<ion-icon style="color: var(--color-danger)" name="volume-mute"></ion-icon> Unmute';
}

// Play specific audio
function playVoiceOver(sectionId) {

    if (sectionId === lastPlayedSectionId || !audioInitialized || backgroundAudio.paused) {
        return;
    }
    else if (!sectionId){
        sectionId = 'start';
    }

    lastPlayedSectionId = sectionId;
    voiceOverAudio.pause();
    toggleButton.innerHTML = '<ion-icon name="volume-high"></ion-icon> Mute';
    clearTimeout(voiceOverAudioTimeout);

    if (!(['credits'].includes(sectionId)) && !backgroundAudio.paused) {
        voiceOverAudio.src = `assets/audio/voice-overs/${sectionId}.wav`;
        voiceOverAudioTimeout = setTimeout(() => {
            toggleButton.innerHTML = '<ion-icon style="color:var(--color-info)" name="volume-high"></ion-icon> Mute';
            voiceOverAudio.play();
        }, 1000);
    }
}

voiceOverAudio.onended = function(){
    if (backgroundAudio.paused) {
        return;
    }
    toggleButton.innerHTML = '<ion-icon name="volume-high"></ion-icon> Mute';
}

// Initialize audio on first interaction
function initializeAudio() {
    if (!audioInitialized) {
        backgroundAudio.volume = 0.1;
        voiceOverAudio.volume = 0.3;
        audioInitialized = true;
        playBackgroundAudio();
        playVoiceOver(getCurrentSectionIdFromUrl());
    }
}


// Pause and reset playback position of an audio element
function pauseAndResetAudio(audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
}

function playClickFx() {
    if(backgroundAudio.paused){
        return;
    }
    let audio = document. createElement("audio");
    audio.src = "assets/audio/default.mp3";
    audio.volume = 0.05;
    audio.play().then(() => {audio.remove();});
}

// Event Listeners
window.addEventListener('scroll', debounce(updateUrl, 100)); // Listen for scroll events with debouncing
window.addEventListener('hashchange', () => {
    playClickFx();
    playVoiceOver(getCurrentSectionIdFromUrl())
});
toggleButton.addEventListener('click', togglePlayback); // Listen for click events on the mute button
window.addEventListener("click", () => {
    if(!audioInitialized){
        initializeAudio();
    }
});

