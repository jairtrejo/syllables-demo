const words = {
  ocuilin: "o·cui·lin",
  āhuiya: "ā·hui·ya",
  huītzilin: "huī·tzi·lin",
  calli: "cal·li",
  tamalli: "ta·mal·li",
};

/*
 * Utilities
 */

/**
 * Wait for eventName to happen on element.
 *
 * @param {Element} element - An element that implements eventListener.
 * @param {string}  eventName - The name of the event to wait for.
 * @return {Promise<Event>} A promise that will resolve when the event happens.
 *
 * @example
 *
 * const e = await listen(btn, 'click');
 * e.target.innerText = "Clicked";
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

/**
 * Visually hide an element
 *
 * @param {HTMLElement} - The element to hide.
 */
function hide(element) {
  element.style.display = "none";
}

/**
 * Show an element that was hidden by hide
 *
 * @param {HTMLElement} - The element to show.
 */
function show(element) {
  element.style.display = "revert";
}

/**
 * Game loop
 *
 * Randomizes syllabification exercises and shows them one at a time.
 * It only lets you go to the next exercise once you correctly answered the
 * current one.
 * Once you have gone through all exercises it lets you restart the game.
 */
(async function game() {
  const root = document.getElementById("root");
  const checkBtn = document.getElementById("check-btn");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");

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
          // A small delay is needed so the CSS animation executes again.
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

/**
 * A game widget to display a word and let you break it down by syllables.
 *
 * When you hover over the letters they move to make space for a break.
 * If you click on that space a middle dot is added to represent a break.
 * You can click a middle dot again to remove that break.
 *
 * @param {HTMLElement} root - The root node where the UI will be shown.
 * @param {string} prompt - The word to show.
 * @returns {function} A function to clean up root from the created UI.
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

    // If the user hovers the left side of a letter, preview a break before.
    // Otherwise, preview the break after.
    let between = [];
    if (position < 0.5) {
      between = [hovered.previousElementSibling, hovered];
    } else {
      between = [hovered, hovered.nextElementSibling];
    }

    let splitPoint;
    if (between[0] === null || between[1] === null) {
      // Don't insert a break at the start or end of the word.
      splitPoint = null;
    } else if (between[0].innerText === "·" || between[1].innerText === "·") {
      // Don't insert a break next to an existing break.
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
