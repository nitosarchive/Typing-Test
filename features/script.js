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

function getWpm() {
  setInterval(() => {
    wpm.innerText = Math.floor((correct / 5) * (60 / timePassed));
  }, 1000);
}

let time;
let seconds;

function timeMode() {
  incrementedTime = 60;
  time = setInterval(() => {
    timePassed++;
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

let currentIndex = 0;
let incorrect = 0;

function takeTest() {
  restart.classList.remove("hidden");
  if (format.value === "60s") {
    timeMode();
  } else passage();

  getWpm();

  select.forEach((select) => {
    select.disabled = true;
  });

  span = textBox.querySelectorAll("span");
  testStart = true;
  span[currentIndex].classList.add("current");
  textBox.classList.remove("not-started");
  document.querySelector(".overlay").classList.add("hidden");
}

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

  if (testStart != true) return;

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
    clearInterval(time);
    testStart = false;
    test.classList.add("hidden");

    restart.innerText = "Take test again";
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
  test.classList.remove("hidden");
  if (format.value === "60s") {
    {
      incrementedTime = 60;
      timeMode();
    }
  } else incrementedTime = 0;

  incorrect = 0;
  correct = 0;

  accuracy.innerText = "100%";

  currentIndex = 0;

  span.forEach((span) => {
    span.removeAttribute("class");
  });

  getWpm();

  select.forEach((select) => {
    select.disabled = true;
  });

  span[currentIndex].classList.add("current");
});
