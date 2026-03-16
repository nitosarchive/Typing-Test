const textBox = document.getElementById("text");
const timer = document.getElementById("time");
const start = document.getElementById("start");
const accuracy = document.getElementById("accuracy");
const wpm = document.getElementById("wpm");
let duration = 60;
let words;
let correct = 0;
let testStart = false;
const btn = document.querySelectorAll("button");
let span;
const select = document.querySelectorAll("select");

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

function timeStart() {
  time = setInterval(() => {
    timePassed++;
    if (timer.innerText === "0") return;
    duration--;
    timer.innerText = duration;
  }, 1000);

  setInterval(() => {
    wpm.innerText = Math.floor((correct / 5) * (60 / timePassed));
  }, 1000);
}

let currentIndex = 0;
let incorrect = 0;

start.addEventListener("click", () => {
  timeStart();
  btn.forEach((btn) => {
    btn.disabled = true;
  });

  select.forEach((select) => {
    select.disabled = true;
  });

  span = textBox.querySelectorAll("span");
  testStart = true;
  span[currentIndex].classList.add("current");
  textBox.classList.remove("not-started");
  document.querySelector(".overlay").style.display = "none";
});

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

  accuracy.innerText = Math.floor(
    ((span.length - incorrect) / span.length) * 100,
  );

  if (currentIndex >= span.length - 1) {
    clearInterval(time);
    testStart = false;
  }

  currentIndex++;

  if (testStart != true) return;
  span[currentIndex].classList.add("current");
});
