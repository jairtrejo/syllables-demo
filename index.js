const words = {
  ocuilin: "o·cui·lin",
  āhuiya: "ā·hui·ya",
};

const root = document.getElementById("root");
const checkBtn = document.getElementById("check-btn");

let prompts = Object.keys(words);
let wordIndex = Math.floor(Math.random() * prompts.length);
let prompt = prompts[wordIndex];
let answer = words[prompt];
delete words[prompt];

let currentSplit;

for (l of prompt) {
  const letter = document.createElement("span");

  letter.classList.add("letter");
  letter.innerText = l;

  root.append(letter);
};

root.addEventListener("mousemove", function onLettersFocus(e) {
  if (e.target === root) {
    return;
  }

  if (currentSplit) {
    currentSplit.classList.remove("split-before", "split-after");
  }

  const hovered = e.target;

  if (hovered.innerText === "·") {
    return;
  }

  const prevSibling = hovered.previousElementSibling;
  const nextSibling = hovered.nextElementSibling;
  const rect = hovered.getBoundingClientRect();
  const position = (e.x - rect.left) / (rect.right - rect.left);

  if (position < 0.5 && prevSibling && prevSibling.innerText !== "·") {
    hovered.classList.add("split-before");
  } else if (nextSibling && nextSibling.innerText !== "·") {
    hovered.classList.add("split-after");
  } else {
    currentSplit = null;
    return;
  }

  currentSplit = hovered;
});

root.addEventListener("mouseleave", function onRootMouseOut() {
  if (!currentSplit) {
    return;
  }
  currentSplit.classList.remove("split-before", "split-after");
  currentSplit = null;
});

root.addEventListener("click", function onSplitWord(e) {
  if (e.target.innerText === "·") {
    e.target.parentNode.removeChild(e.target);
    return;
  }

  if (!currentSplit) {
    return;
  }

  const dot = document.createElement("span");
  dot.classList.add("letter");
  dot.innerText = "·";

  if (currentSplit.classList.contains("split-after")) {
    currentSplit.after(dot);
  } else {
    currentSplit.before(dot);
  }

  currentSplit.classList.remove("split-before", "split-after");
  currentSplit = null;
});

checkBtn.addEventListener("click", () => {
  const userAnswer = root.innerText;
  console.log(userAnswer);
  if (userAnswer === answer) {
    console.log("correct!");
  }
  return 
});
