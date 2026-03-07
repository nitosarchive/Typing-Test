const textBox = document.getElementById("text");

const timer = document.getElementById("time");

const start = document.getElementById("start");

let duration = 60;

let textString;
let fullHTML = "";

let words;
let easy;
let medium;
let hard;

function elementString() {
  textString = words.text.split("");

  array = textString.map((value) => {
    return `<span>${value}</span>`;
  });
  fullHTML = array.join("");
  textBox.innerHTML = fullHTML;
}

function difficulty(e) {
  if (!e.target.matches("button")) return; // Check which difficulty was selected

  if (e.target.id === "easy") {
    words = easy[Math.floor(Math.random() * easy.length)];
  } else if (e.target.id === "medium") {
    words = medium[Math.floor(Math.random() * medium.length)];
  } else {
    words = hard[Math.floor(Math.random() * hard.length)];
  }

  elementString();
}

fetch("./typing-speed-test-main/data.json")
  .then((response) => response.json())
  .then((data) => {
    easy = data.easy;
    medium = data.medium;
    hard = data.hard;

    function defaultSetting() {
      words = easy[Math.floor(Math.random() * easy.length)];
      elementString();
    }

    defaultSetting();
  })
  .catch((error) => console.error("Error:", error));

document.getElementById("btn").addEventListener("click", difficulty);

function timeStart() {
  setInterval(() => {
    duration--;

    timer.innerText = duration;
  }, 1000);
}

start.addEventListener("click", () => {
  timeStart();
  start.disabled = true;
});

let letter = "e";

document.addEventListener("keyup", (e) => {
  if ((e.key = letter)) {
    console.log("correct");
  }
});
