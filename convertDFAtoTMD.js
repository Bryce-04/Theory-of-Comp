function convertDFAtoTMD(dfa) {
  const { states, alphabet, transitions, start_state, accept_states } = dfa;

  // Create TM
  const tm = {
    states: [...states.map(s => String(s)), 'ACCEPT', 'REJECT'],
    tapeAlphabet: [...alphabet, '_'],
    blank: '_',
    transitions: {}, // will fill below
    startState: String(start_state)
  };

  // Make transitions for each state
  for (const s of tm.states) tm.transitions[s] = {};

  // Define TM transitions based on DFA transitions
  for (const q of states) {
    const qStr = String(q);
    for (const sym of alphabet) {
      const next = transitions[q][sym];
      tm.transitions[qStr][sym] = { write: sym, move: 'R', nextState: String(next) };
    }

    // Use blank symbol to decide accept/reject
    if (accept_states.includes(q)) {
      tm.transitions[qStr][tm.blank] = { write: tm.blank, move: 'N', nextState: 'ACCEPT' };
    } else {
      tm.transitions[qStr][tm.blank] = { write: tm.blank, move: 'N', nextState: 'REJECT' };
    }
  }

  // ACCEPT and REJECT are halting states with no transitions (already initialized as empty)
  return tm;
}

// --------------------------------
// TM Simulator with tape visualization
// --------------------------------
function simulateTM(tm, input, maxSteps = 1000) {

  // ------------------------------------------------------
  //  Basic validation
  // ------------------------------------------------------
  if (!tm || typeof tm !== "object") {
    throw new Error("simulateTM: TM must be an object.");
  }
  if (typeof input !== "string") {
    throw new Error("simulateTM: input must be a string.");
  }

  // ------------------------------------------------------
  // Initialize tape, head, and state
  // ------------------------------------------------------
  // Tape is an array of characters. If input is empty, use blank.
  let tape;
  if (input.length > 0) {
    tape = input.split("");
  } else {
    tape = [tm.blank];
  }

  let blank = tm.blank;      // the blank symbol
  let head = 0;              // head always starts at position 0
  let state = tm.startState; // start state from the TM object


  // ------------------------------------------------------
  // Function that prints a current view of the tape
  // ------------------------------------------------------
  function tapeCurrent() {

    //Determine leftmost and rightmost non-blank cell
    let left = 0;
    let right = tape.length - 1;

    while (left < tape.length && tape[left] === blank) {
      left++;
    }
    while (right >= 0 && tape[right] === blank) {
      right--;
    }

    //If tape is all blank, show just one blank cell
    if (left > right) {
      left = 0;
      right = 0;
    }

    //Always show the head, even if it is outside the non-blank range
    if (head < left) left = head;
    if (head > right) right = head;

    //Build string of tape symbols
    let symbols = [];

    for (let i = left; i <= right; i++) {

      let sym = tape[i];

      //If symbol is missing or undefined, treat as blank
      if (sym === undefined || sym === null) {
        sym = blank;
      }

      symbols.push(sym);
    }

    let tapeStr = symbols.join("");

    // Mark head position
    let headIndex = head - left;
    let marker = "";
    for (let i = 0; i < headIndex; i++) {
      marker += " ";
    }
    marker += "^";

    return {
      tapeStr: tapeStr,
      headIndex: headIndex,
      marker: marker,
      state: state
    };
  }


  // ------------------------------------------------------
  // Print initial configuration
  // ------------------------------------------------------
  console.log("\n--- TM Simulation Start ---");
  console.log('Input: "' + input + '"');
  console.log("Start state: " + state + "\n");

  let current = tapeCurrent();
  console.log("Step 0: state=" + current.state +
              " tape=" + current.tapeStr +
              " headPos=" + current.headIndex);
  console.log(" ".repeat(7) + current.marker + "\n");

  // ------------------------------------------------------
  // Main simulation loop
  // ------------------------------------------------------
  let steps = 0;

  while (steps < maxSteps) {
    steps++;

    // Extend tape to the right if necessary
    if (tape[head] === undefined) {
      tape[head] = blank;
    }

    let symbol = tape[head];

    // Check for halting states
    if (state === "ACCEPT") {
      console.log("HALT: ACCEPT after " + (steps - 1) + " steps");
      return { result: "ACCEPT", steps: steps - 1, tape: tape };
    }

    if (state === "REJECT") {
      console.log("HALT: REJECT after " + (steps - 1) + " steps");
      return { result: "REJECT", steps: steps - 1, tape: tape };
    }

    // Find the transition rule
    let stateTransitions = tm.transitions[state];
    if (!stateTransitions) {
      console.log("No transitions defined for state=" + state + ". Halting REJECT.");
      return { result: "REJECT", steps: steps, tape: tape };
    }

    let action = stateTransitions[symbol];
    if (!action) {
      console.log("No transition for state=" + state + " and symbol='" + symbol + "'. Halting REJECT.");
      return { result: "REJECT", steps: steps, tape: tape };
    }

    // ------------------------------------------------------
    //Apply the transition (write, move, nextState)
    // ------------------------------------------------------

    tape[head] = action.write;

    // Move head
    if (action.move === "R") {
      head++;
    } 
    // If move is "N", do nothing

    // Extend tape to the right if needed
    if (head >= tape.length) {
      tape.push(blank);
    }

  
    state = action.nextState;

    // ------------------------------------------------------
    // Print snapshot after this step
    // ------------------------------------------------------
    current = tapeCurrent();

    console.log("Step " + steps + ": state=" + state +
                " tape=" + current.tapeStr +
                " headPos=" + current.headIndex);
    console.log(" ".repeat(7) + current.marker + "\n");
  }

  // ------------------------------------------------------
  // If we hit max steps
  // ------------------------------------------------------
  console.log("Max steps (" + maxSteps + ") exceeded — aborting.");
  return { result: "TIMEOUT", steps: maxSteps, tape: tape };
}

const exampleDFA = {
  states: [0, 1, 2, 3],
  alphabet: ["a", "b"],
  transitions: {
    0: { a: 1, b: 2 },
    1: { a: 0, b: 3 },
    2: { a: 3, b: 0 },
    3: { a: 2, b: 1 }
  },
  start_state: 0,
  accept_states: [0, 3]
};

// Convert DFA -> TM
const tm = convertDFAtoTMD(exampleDFA);

// Print TM summary (optional)
console.log("Converted TM (full transitions):");
console.log(JSON.stringify(tm, null, 2));

// Simulate TM on some test inputs
const testInputs = ["", "b", "ab"];
for (const input of testInputs) {
  console.log("\n===============================");
  console.log(`Simulating input "${input}"`);
  simulateTM(tm, input, 100);
}
