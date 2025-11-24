function convertDFAtoTMD(dfa) {
  const { states, alphabet, transitions, start_state, accept_states } = dfa;

  // Build TM
  const tm = {
    states: [...states.map(s => String(s)), 'ACCEPT', 'REJECT'],
    tapeAlphabet: [...alphabet, '_'],
    blank: '_',
    transitions: {}, // will fill below
    startState: String(start_state)
  };

  // Initialize transitions for each state
  for (const s of tm.states) tm.transitions[s] = {};

  // Define TM transitions based on DFA transitions
  for (const q of states) {
    const qStr = String(q);
    for (const sym of alphabet) {
      const next = transitions[q][sym];
      tm.transitions[qStr][sym] = { write: sym, move: 'R', nextState: String(next) };
    }

    // Handle blank symbol to decide accept/reject
    if (accept_states.includes(q)) {
      tm.transitions[qStr][tm.blank] = { write: tm.blank, move: 'N', nextState: 'ACCEPT' };
    } else {
      tm.transitions[qStr][tm.blank] = { write: tm.blank, move: 'N', nextState: 'REJECT' };
    }
  }

  // ACCEPT and REJECT are halting states with no transitions (already initialized as empty)
  return tm;
}

// ================================
// TM Simulator with tape visualization
// ================================
function simulateTM(tm, input, maxSteps = 1000) {
  if (!tm || typeof tm !== 'object') throw new Error('simulateTM: missing TM object');
  if (typeof input !== 'string') throw new Error('simulateTM: input must be string');

  const tape = input.length ? input.split('') : [tm.blank];
  const blank = tm.blank;
  let head = 0;
  let state = tm.startState;

  // Helper: print tape with head and state
  function tapeSnapshot() {
    let left = 0, right = tape.length - 1;
    while (left < tape.length && tape[left] === blank) left++;
    while (right >= 0 && tape[right] === blank) right--;
    if (left > right) left = right = 0;
    left = Math.min(left, head);
    right = Math.max(right, head);

    const symbols = [];
    for (let i = left; i <= right; i++) symbols.push(tape[i] ?? blank);
    const tapeStr = symbols.join('');
    const headIndex = head - left;
    const marker = ' '.repeat(headIndex) + '^';
    return { tapeStr, headIndex, marker, state };
  }

  console.log('\n--- TM Simulation Start ---');
  console.log(`Input: "${input}"`);
  console.log(`Start state: ${state}\n`);
  let snap = tapeSnapshot();
  console.log(`Step 0: state=${snap.state} tape=${snap.tapeStr} headPos=${snap.headIndex}`);
  console.log(' '.repeat(7) + snap.marker + '\n');

  let steps = 0;
  while (steps < maxSteps) {
    steps++;
    if (tape[head] === undefined) tape[head] = blank;
    const symbol = tape[head];

    if (state === 'ACCEPT') {
      console.log(`HALT: ACCEPT after ${steps - 1} steps`);
      return { result: 'ACCEPT', steps: steps - 1, tape };
    }
    if (state === 'REJECT') {
      console.log(`HALT: REJECT after ${steps - 1} steps`);
      return { result: 'REJECT', steps: steps - 1, tape };
    }

    const action = tm.transitions[state][symbol];
    if (!action) {
      console.log(`No transition for state=${state} symbol='${symbol}'. Halting REJECT.`);
      return { result: 'REJECT', steps, tape };
    }

    tape[head] = action.write;
    if (action.move === 'R') head++;
    else if (action.move === 'L') head = Math.max(0, head - 1);

    if (head >= tape.length) tape.push(blank);
    state = action.nextState;

    snap = tapeSnapshot();
    console.log(`Step ${steps}: state=${state} tape=${snap.tapeStr} headPos=${snap.headIndex}`);
    console.log(' '.repeat(7) + snap.marker + '\n');
  }

  console.log(`Max steps (${maxSteps}) exceeded — aborting.`);
  return { result: 'TIMEOUT', steps: maxSteps, tape };
}

// ================================
// Example DFA
// ================================
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

// ================================
// Convert DFA -> TM and simulate
// ================================
const tm = convertDFAtoTMD(exampleDFA);
console.log('\nConverted TM summary:');
console.log('States:', tm.states);
console.log('Tape alphabet:', tm.tapeAlphabet);
console.log('Start state:', tm.startState);
console.log('Transitions for state 0 and 1:');
console.log(JSON.stringify({ 0: tm.transitions['0'], 1: tm.transitions['1'] }, null, 2));

// Test a few strings
const tests = ['', 'b', 'ab'];
for (const input of tests) {
  console.log('\n========================================');
  console.log(`Simulating input "${input}"`);
  simulateTM(tm, input, 200);
}