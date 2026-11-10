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
const difficultyWrapper = document.querySelector(".difficulty-wrapper");
const modeWrapper = document.querySelector(".mode-wrapper");
const modeBtn = modeWrapper.querySelectorAll("button");
const difficultyBtn = difficultyWrapper.querySelectorAll("button");
const ctx = document.getElementById("chart");
let formatValue;
let labels;
let currentWpm;
let baseTime;
let graphTime = [];
let graphWpm = [];
let wpmList;
let chart;
let wpmInterval;
let allWords;
let wordIndex = 1;
let arr;
let current;
let lengthString;
let currentDifficulty;
let currentIndex = 1;
let currentWord;
let letterIndex = 0;
let currentLetter;
let input = document.getElementById("type-input");

const initDiff = difficultyWrapper.querySelector("div").querySelector("button");
initDiff.classList.add("active");

const initMode = modeWrapper.querySelector("div").querySelector("button");
initMode.classList.add("active");
formatValue = initMode.value;

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
  lengthString = words.text.split("");

  let textString = words.text.split(" ");

  arr = textString.map((val) => {
    return `<div>${val} </div>`;
  });

  let fullHTML = arr.join("");

  textBox.innerHTML = fullHTML;
  allWords = textBox.querySelectorAll("div");
  allWords.forEach((word) => {
    word.dataset.wordIndex = wordIndex;
    wordIndex++;
    let letterString = word.innerText.split("");
    arr = letterString.map((val) => {
      return `<letter>${val}</letter>`;
    });

    fullHTML = arr.join("");
    word.innerHTML = fullHTML;
    word.classList.add("word");
  });
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

    (function () {
      words = easy[Math.floor(Math.random() * easy.length)];
      currentDifficulty = "easy";
      elementString();
    })();
  })
  .catch((error) => console.error("Error:", error));

function getDifficulty(e) {
  if (e) {
    currentDifficulty = e.target.value;

    if (e.target.value === "easy") {
      words = easy[Math.floor(Math.random() * easy.length)];
    } else if (e.target.value === "medium") {
      words = medium[Math.floor(Math.random() * medium.length)];
    } else {
      words = hard[Math.floor(Math.random() * hard.length)];
    }
  } else {
    if (currentDifficulty === "easy") {
      words = easy[Math.floor(Math.random() * easy.length)];
    } else if (currentDifficulty === "medium") {
      words = medium[Math.floor(Math.random() * medium.length)];
    } else {
      words = hard[Math.floor(Math.random() * hard.length)];
    }
  }

  currentIndex = 1;
  letterIndex = 0;
  wordIndex = 1;
  elementString();
}

document.getElementById("difficulty").addEventListener("change", getDifficulty);

format.addEventListener("change", () => {
  formatValue = format.value;
});

difficultyWrapper.addEventListener("click", (e) => {
  getDifficulty(e);
});

difficultyBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    difficultyBtn.forEach((selected) => {
      selected.classList.remove("active");
    });

    btn.classList.add("active");
  });
});

modeBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeBtn.forEach((selected) => {
      selected.classList.remove("active");
    });
    btn.classList.add("active");

    formatValue = btn.value;
  });
});

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

    let minutes = Math.floor(incrementedTime / 60);

    let second = incrementedTime % 60;

    let minute = minutes % 60;

    second = String(second).padStart(2, "0");

    minute = String(minute).padStart(1, "0");

    timer.innerText = `${minute}:${second}`;
  }, 1000);
}

function getWpm() {
  wpmList = [];
  graphTime = [];
  graphWpm = [];
  wpmInterval = setInterval(() => {
    timePassed++;
    currentWpm = Math.floor((correct / 5) * (60 / timePassed));

    wpm.innerText = currentWpm;
    wpmList.push(currentWpm);
  }, 1000);
}

let incorrect = 0;

const ignore = [
  "Shift",
  "Backspace",
  "Ctrl",
  "Enter",
  "Alt",
  "CapsLock",
  "Tab",
];

function restartKeybind() {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Tab") restartTest();
    if (e.shiftKey) {
      if (e.key === "Alt") restartTest();
    }
  });
}

document.addEventListener("keydown", (e) => {
  input.focus();

  restartKeybind();
  if (ignore.includes(e.key)) return;

  let endWpm = timePassed;

  currentWord = document.querySelector(`[data-word-index ="${currentIndex}"]`);

  currentLetter = currentWord.querySelectorAll("letter");

  if (testStart === false) return;

  if (
    currentIndex >= allWords.length &&
    letterIndex === currentLetter.length - 1
  ) {
    // Test end
    testStart = false;
    result.classList.remove("hidden");
    test.classList.add("hidden");
    saveWpm = Math.floor((correct / 5) * (60 / timePassed));
    saveAccuracy =
      Math.floor(
        ((lengthString.length - incorrect) / lengthString.length) * 100,
      ) + "%";
    wpmResult.innerText = saveWpm;
    correctResult.innerText = correct;
    incorrectResult.innerText = incorrect;
    accuracyResult.innerText = saveAccuracy;
    restart.style.background = "white";
    restart.style.color = "hsl(0, 0%, 7%)";
    base.classList.remove("hidden");

    if (wpmInterval) {
      clearInterval(wpmInterval);
    }

    timePassed = Math.floor(timePassed / 10);

    if (timePassed < 1) timePassed = 1;

    graphTime.push(1);

    while (timePassed <= endWpm) {
      if (timePassed < endWpm) {
        graphTime.push(timePassed);
      }

      graphWpm.push(wpmList[timePassed - 1]); //Pull from array the plotted wpm
      timePassed++;
    }
    if (chart) {
      chart.data.datasets[0].data = graphWpm;
      chart.data.labels = graphTime;
      chart.update();
    } else {
      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: graphTime,
          datasets: [
            {
              borderColor: "rgb(75, 192, 192)",
              data: graphWpm,
              tension: 0.3,
            },
          ],
        },
        options: {
          legend: {
            display: false,
          },
        },
      });
    }

    if (saveWpm <= best) {
      //Normal run screen.
      document.querySelector(".base-img").classList.remove("hidden");
      document.querySelector(".highscore").classList.add("hidden");
      document.querySelector(".confetti-wrapper").classList.add("hidden");
      restart.firstChild.nodeValue = "Go again";
      messageTitle.innerText = "Test Complete!";
      message.innerText = "Solid run. Keep pushing to beat your high score.";
      return;
    }

    if (best === null) {
      //Baseline screen
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
      //High score screen
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
  } else if (letterIndex === currentLetter.length) {
    if (e.key === " ") {
      correct++;
      currentIndex++;
      letterIndex = 0;
    } else incorrect++;
    currentWord = document.querySelector(
      `[data-word-index ="${currentIndex}"]`,
    );
    currentLetter = currentWord.querySelectorAll("letter");

    current.classList.remove("current");
    currentLetter[letterIndex].classList.add("current");
  } else {
    currentLetter[letterIndex].classList.add("current");
    current = document.querySelector(".current");

    if (e.key === current.innerText) {
      current.classList.add("correct");
      correct++;
    } else {
      current.classList.add("incorrect");
      incorrect++;
    }
    letterIndex++;
    if (letterIndex < currentLetter.length) {
      current.classList.remove("current");
      currentLetter[letterIndex].classList.add("current");
    }
    if (letterIndex === currentLetter.length)
      current.classList.remove("current");
  }

  accuracy.innerText =
    Math.floor(
      ((lengthString.length - incorrect) / lengthString.length) * 100,
    ) + "%";

  current.scrollIntoView({
    block: "center",
    behavior: "smooth",
  });
});

let saveWpm;
let saveAccuracy;

function takeTest() {
  if (testStart === true) return;
  textBox.addEventListener("click", input.focus());
  restart.classList.remove("hidden");
  getWpm();
  input.focus();
  document
    .querySelector(".option-container-desktop")
    .querySelectorAll("button")
    .forEach((btn) => {
      btn.disabled = true;
    });

  if (formatValue === "60s") {
    timeMode();
  } else passage();

  select.forEach((select) => {
    select.disabled = true;
  });

  testStart = true;
  textBox.classList.remove("not-started");
  document.querySelector(".overlay").classList.add("hidden");
}

start.addEventListener("click", takeTest);
textBox.addEventListener("click", takeTest);

function restartTest() {
  testStart = true;
  timePassed = 0;
  restart.style.color = "white";
  restart.style.background = "hsl(0, 0%, 15%)";
  restart.firstChild.nodeValue = "Restart Test";
  document.querySelector(".confetti-wrapper").classList.add("hidden");
  if (currentIndex >= allWords.length - 1) {
    result.classList.add("hidden");
  }
  test.classList.remove("hidden");

  getDifficulty();

  if (formatValue === "60s") {
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

  select.forEach((select) => {
    select.disabled = true;
  });

  base.classList.add("hidden");
  if (wpmInterval) {
    clearInterval(wpmInterval);
  }
  getWpm();
}

restart.addEventListener("mousedown", restartTest);
