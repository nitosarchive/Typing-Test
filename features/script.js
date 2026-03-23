// NOTE: if there are a number of these that are just referenced once, its much easier to just make the call directly in the place it's needed. To starrt a program like this can easily be seen as clutter.
const textBox = document.getElementById("text");
const timer = document.getElementById("time");
const start = document.getElementById("start");
const accuracy = document.getElementById("accuracy");
const wpm = document.getElementById("wpm");
let incrementedTime;
let words;
let correct = 0;
let testStart = false;
const btn = document.querySelectorAll("button");
let span;
const select = document.querySelectorAll("select");
const format = document.getElementById("format");
const restart = document.getElementById("restart");
const test = document.querySelector(".test");
const result = document.querySelector(".result");
const wpmResult = document.querySelector("#wpm-result");
const correctResult = document.getElementById("correct");
const incorrectResult = document.getElementById("incorrect");
const accuracyResult = document.getElementById("accuracy-result");
let best = localStorage.getItem("bestScore");
const base = document.querySelector(".base");
const bestScore = document.getElementById("best-score");
const messageTitle = base.querySelector("h3");
const message = base.querySelector("p");

if (best != null) {
    bestScore.innerText = best + " WPM";
}

// NOTE: we won't have to care about this if:
// - we define the keyup event handler right before we start the timer
// - we destroy the event listener in our cleanup function (a new one will be created before the timer starts)
// so every keypress outside of the start & end of timer, we won't ever worry about
window.addEventListener("keydown", function (e) {
    if (e.key === " ") {
        if (e.target === document.body) {
            e.preventDefault();
        }
    }
});

// TODO: you want your function names to make it clear what it's doing. This could be something like `parseTestMaterial()`
function elementString() {
    let textString = words.text.split("");

    let array = textString.map((value) => {
        return `<span>${value}</span>`;
    });

    let fullHTML = array.join("");
    textBox.innerHTML = fullHTML;
}

let easy;
let medium;
let hard;

fetch("./typing-speed-test-main/data.json")
    .then((response) => response.json())
    .then((data) => {
        easy = data.easy;
        medium = data.medium;
        hard = data.hard;

        defaultSetting();
    })
    .catch((error) => console.error("Error:", error));

// TODO: this becomes more useful if you just pass the desired difficulty level as a string arg
// right now this is only ran once when you initialize the game and its always 'easy'
// this value can be saved & read from localStorage so that the user doesn't have to set it every time they load the page.
function defaultSetting() {
    words = easy[Math.floor(Math.random() * easy.length)];
    elementString();
}

// TODO: ...and so this can actually be more appropriate as 'setDifficulty(val)'
// so after fetch, check localStorage if this is already set, then instead of `defaultSetting()` you can say `setDifficulty(<value>)`
function getDifficulty(e) {
    if (e.target.value === "easy") {
        words = easy[Math.floor(Math.random() * easy.length)];
    } else if (e.target.value === "medium") {
        words = medium[Math.floor(Math.random() * medium.length)];
    } else {
        words = hard[Math.floor(Math.random() * hard.length)];
    }

    elementString();
}

// TODO: ...the handler can then be written `.addEventListener('change', (ev) => setDifficulty(ev.target.value);`
document.getElementById("difficulty").addEventListener("change", getDifficulty);

let timePassed = 0;

let time;
let seconds;

// setTimer(<val>)
function timeMode() {
    incrementedTime = 60;

    if (time) clearInterval(time);
    time = setInterval(() => {
        if (incrementedTime === 0) {
            test.classList.add("hidden");
            return;
        }

        timePassed++;

        incrementedTime--;
        seconds = String(incrementedTime).padStart(2, "0");

        timer.innerText = `0:${seconds}`;
    }, 1000);
}

// 'updateTimer()'
function passage() {
    if (time) clearInterval(time);
    incrementedTime = 0;

    time = setInterval(() => {
        incrementedTime++;
        timePassed++;
        let minutes = Math.floor(incrementedTime / 60);

        let second = incrementedTime % 60;

        let minute = minutes % 60;

        second = String(second).padStart(2, "0");

        minute = String(minute).padStart(1, "0");

        timer.innerText = `${minute}:${second}`;
    }, 1000);
}

function getWpm() {
    setInterval(() => {
        if (timePassed === 0) return;
        wpm.innerText = Math.floor((correct / 5) * (60 / timePassed));
    }, 1000);
}

let currentIndex = 0;
let incorrect = 0;

function takeTest() {
    restart.classList.remove("hidden");
    getWpm();
    if (format.value === "60s") {
        timeMode();
    } else passage();

    select.forEach((select) => {
        select.disabled = true;
    });

    span = textBox.querySelectorAll("span");
    testStart = true;
    span[currentIndex].classList.add("current");
    textBox.classList.remove("not-started");
    document.querySelector(".overlay").classList.add("hidden");
}

let saveWpm;
let saveAccuracy;

// TODO: oooo, so here you potentially run into a problem
// look into 'event bubbling' / "event propagation"
// e.g. if the Start button happens to overlao textBox, then it's possible that you actually have two instances of the test running (each with timing mechanisms) because when you click an element, the click event travels all the way through the DOM elements in the tree, in which case two elements are handling it by executing `takeTest`
start.addEventListener("click", takeTest);
textBox.addEventListener("click", takeTest);

const ignore = [
    "Shift",
    "Backspace",
    "Ctrl",
    "Enter",
    "Alt",
    "CapsLock",
    "Tab",
];

// create/add the keyup listener right before the countdown starts
// TODO: we are executing the handler with every single keyup event, and so it's important that we keep the logic in the handler lightweight
document.addEventListener("keyup", (e) => {
    if (ignore.includes(e.key)) return;

    // NOTE: UI update real-time START

    current = document.querySelector(".current");

    if (testStart === false) return;

    if (e.key === current.innerText) {
        current.classList.add("correct");
        correct++;
    } else {
        current.classList.add("incorrect");
        incorrect++;
    }
    current.classList.remove("current");

    // NOTE: real time accuracy calc
    accuracy.innerText =
        Math.floor(((span.length - incorrect) / span.length) * 100) + "%";

    // NOTE: game checkEnd START
    if (currentIndex >= span.length - 1) {
        testStart = false;
        result.classList.remove("hidden");
        test.classList.add("hidden");
        saveWpm = Math.floor((correct / 5) * (60 / timePassed));
        saveAccuracy =
            Math.floor(((span.length - incorrect) / span.length) * 100) + "%";
        wpmResult.innerText = saveWpm;
        correctResult.innerText = correct;
        incorrectResult.innerText = incorrect;
        accuracyResult.innerText = saveAccuracy;
        restart.style.background = "white";
        restart.style.color = "hsl(0, 0%, 7%)";
        base.classList.remove("hidden");

        if (saveWpm <= best) {
            document.querySelector(".base-img").classList.remove("hidden");
            document.querySelector(".highscore").classList.add("hidden");
            document.querySelector(".confetti-wrapper").classList.add("hidden");
            restart.firstChild.nodeValue = "Go again";
            messageTitle.innerText = "Test Complete!";
            message.innerText =
                "Solid run. Keep pushing to beat your high score.";
            return;
        }

        if (best === null) {
            restart.firstChild.nodeValue = "Beat this Score";
            document.querySelector(".highscore").classList.add("hidden");
            messageTitle.innerText = "Baseline Established!";
            message.innerText =
                "You've set the bar. Now the real challenge begins—time to beat it.";
            localStorage.setItem("bestScore", saveWpm);
            best = localStorage.getItem("bestScore");
            bestScore.innerText = best + " WPM";
            return;
        }

        if (saveWpm > best) {
            localStorage.setItem("bestScore", saveWpm);
            best = localStorage.getItem("bestScore");
            bestScore.innerText = best + " WPM";
            restart.firstChild.nodeValue = "Go again";
            document.querySelector(".base-img").classList.remove("hidden");
            bestScore.innerText = best + " WPM";
            document.querySelector(".base-img").classList.add("hidden");
            document.querySelector(".highscore").classList.remove("hidden");
            document
                .querySelector(".confetti-wrapper")
                .classList.remove("hidden");
            messageTitle.innerText = "High Score Smashed!";
            message.innerText =
                "You're getting faster. That was incredible typing.";
        }

        // TODO: not needed if you aren't doing anything, we've ended the game!
        return;
    }

    // TODO: the below logic would just happen at L190
    currentIndex++;
    current.scrollIntoView({
        block: "center",
        behavior: "smooth",
    });
    span[currentIndex].classList.add("current");
});

// TODO: this is basically your end-of-game cleanup, but also the UX can be improved:
// often if a user messes up early and wants to immediately start over, they hit "Tab + Enter"
// which essentially is a fast way of starting over without reaching for your mouse
// starting the time only on mousedown means the timer starts, but the user hasn't returned their fingers to home row
// you'll need to ensure that at any point in the test if the user hits Tab that the reset button will be focused
// then the subsequent "Enter" will clean up and restart the timer, the user is immediately in position to type
restart.addEventListener("mousedown", (e) => {
    e.preventDefault();
    testStart = true;
    timePassed = 0;
    restart.style.color = "white";
    restart.style.background = "hsl(0, 0%, 15%)";
    restart.firstChild.nodeValue = "Restart Test";
    document.querySelector(".confetti-wrapper").classList.add("hidden");
    if (currentIndex >= span.length - 1) {
        result.classList.add("hidden");
    }
    test.classList.remove("hidden");

    if (format.value === "60s") {
        incrementedTime = 60;
        timeMode();

        timer.innerText = "0:60";
    } else {
        passage();
        incrementedTime = 0;
        timer.innerText = "0:00";
    }

    incorrect = 0;
    correct = 0;

    accuracy.innerText = "100%";
    wpm.innerText = 0;

    currentIndex = 0;

    span.forEach((span) => {
        span.removeAttribute("class");
    });

    select.forEach((select) => {
        select.disabled = true;
    });

    span[currentIndex].classList.add("current");
    base.classList.add("hidden");
});
