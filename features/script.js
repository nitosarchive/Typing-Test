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

window.addEventListener("keydown", function (e) {
  if (e.key === " ") {
    if (e.target === document.body) {
      e.preventDefault();
    }
  }
});

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

function defaultSetting() {
  words = easy[Math.floor(Math.random() * easy.length)];
  elementString();
}

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

document.getElementById("difficulty").addEventListener("change", getDifficulty);

let timePassed = 0;

let time;
let seconds;

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

document.addEventListener("keyup", (e) => {
  if (ignore.includes(e.key)) return;

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

  accuracy.innerText =
    Math.floor(((span.length - incorrect) / span.length) * 100) + "%";

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
      message.innerText = "Solid run. Keep pushing to beat your high score.";
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
      document.querySelector(".confetti-wrapper").classList.remove("hidden");
      messageTitle.innerText = "High Score Smashed!";
      message.innerText = "You're getting faster. That was incredible typing.";
    }

    return;
  }

  currentIndex++;
  current.scrollIntoView({
    block: "center",
    behavior: "smooth",
  });
  span[currentIndex].classList.add("current");
});

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
