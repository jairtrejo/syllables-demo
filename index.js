const words = {
  ocuilin: "o·cui·lin",
  āhuiya: "ā·hui·ya",
  huītzilin: "huī·tzi·lin",
  calli: "cal·li",
  tamalli: "ta·mal·li",
};

const root = document.getElementById("root");
const checkBtn = document.getElementById("check-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

/*
 * Utilities
 */
function listen(element, eventName) {
  const p = new Promise((resolve) => {
    const listener = (e) => {
      element.removeEventListener(eventName, listener);
      resolve(e);
    };
    element.addEventListener(eventName, listener);
  });
  return p;
}

function show(element) {
  element.style.display = "revert";
}

function hide(element) {
  element.style.display = "none";
}

/*
 * Game loop
 */
(async function game() {
  while (true) {
    let exercises = Object.keys(words)
      .sort(() => Math.random() - 0.5)
      .map((word) => ({ prompt: word, answer: words[word] }));

    root.innerText = "";
    root.classList.remove("game-over");
    hide(restartBtn);

    while (exercises.length > 0) {
      const { prompt, answer } = exercises.pop();

      const cleanUp = syllabificator(root, prompt);
      show(checkBtn);
      hide(nextBtn);

      let userAnswer;
      do {
        await listen(checkBtn, "click");

        root.classList.remove("incorrect");
        userAnswer = root.innerText;

        if (userAnswer !== answer) {
          setTimeout(() => root.classList.add("incorrect"), 10);
        } else {
          root.classList.add("correct");
          show(nextBtn);
          hide(checkBtn);
          await listen(nextBtn, "click");
          root.classList.remove("correct");
        }
      } while (userAnswer !== answer);

      cleanUp();
    }

    root.innerText = "Good job!";
    root.classList.add("game-over");
    hide(nextBtn);
    show(restartBtn);

    await listen(restartBtn, "click");
  }
})();

/*
 * Main widget
 */
function syllabificator(root, prompt) {
  let splitPoint;

  function changeSplitPoint(e) {
    if (e.target === root) {
      return;
    }

    clearSplitPoint();

    const hovered = e.target;
    const rect = hovered.getBoundingClientRect();
    const position = (e.x - rect.left) / (rect.right - rect.left);

    let between = [];
    if (position < 0.5) {
      between = [hovered.previousElementSibling, hovered];
    } else {
      between = [hovered, hovered.nextElementSibling];
    }

    let splitPoint;
    if (between[0] === null || between[1] === null) {
      splitPoint = null;
    } else if (between[0].innerText === "." || between[1].innerText === ".") {
      splitPoint = null;
    } else {
      splitPoint = between[0];
    }

    setSplitPoint(splitPoint);
  }

  function setSplitPoint(element) {
    if (element) {
      element.classList.add("split-after");
    }
    splitPoint = element;
  }

  function clearSplitPoint() {
    if (splitPoint) {
      splitPoint.classList.remove("split-after");
    }
    splitPoint = null;
  }

  function splitWord() {
    if (!splitPoint) {
      return;
    }

    const dot = document.createElement("span");
    dot.classList.add("letter");
    dot.innerText = "·";

    splitPoint.after(dot);
    clearSplitPoint();
  }

  function removeSplit(e) {
    if (e.target.innerText === "·") {
      e.target.parentNode.removeChild(e.target);
      return;
    }
  }

  root.addEventListener("mousemove", changeSplitPoint);
  root.addEventListener("mouseleave", clearSplitPoint);
  root.addEventListener("click", splitWord);
  root.addEventListener("click", removeSplit);

  for (l of prompt) {
    const letter = document.createElement("span");

    letter.classList.add("letter");
    letter.innerText = l;

    root.append(letter);
  }

  return function cleanUp() {
    root.removeEventListener("mousemove", changeSplitPoint);
    root.removeEventListener("mouseleave", clearSplitPoint);
    root.removeEventListener("click", splitWord);
    root.removeEventListener("click", removeSplit);

    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
  };
}
