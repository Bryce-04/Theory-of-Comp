function dfaRecognizesEmptyLanguage(dfa) {
  const { states, alphabet, transitions, start_state, accept_states } = dfa;

  // BFS queue
  const queue = [start_state];
  const visited = new Set([start_state]);

  while (queue.length > 0) {
    const current = queue.shift();

    // If current state is accepting → language is NOT empty
    if (accept_states.includes(current)) {
      return false;  // NOT empty language
    }

    // Explore transitions
    for (const symbol of alphabet) {
      const next = transitions[current][symbol];

      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  // No accepting state reachable
  return true;  // EMPTY language
}

// ------------------ EXAMPLES ------------------

// Example 1: DFA with reachable accept state → NOT empty
const dfa1 = {
  states: [0,1,2],
  alphabet: ["a","b"],
  transitions: {
    0: {a:1, b:2},
    1: {a:1, b:1},
    2: {a:2, b:2}
  },
  start_state: 0,
  accept_states: [1]
};

console.log("DFA 1 empty? ", dfaRecognizesEmptyLanguage(dfa1));  
// false → NOT empty


// Example 2: DFA with accepting state BUT NOT reachable → EMPTY language
const dfa2 = {
  states: [0,1,2],
  alphabet: ["a","b"],
  transitions: {
    0: {a:0, b:0},
    1: {a:1, b:1},
    2: {a:2, b:2}
  },
  start_state: 0,
  accept_states: [1] // unreachable!
};

console.log("DFA 2 empty? ", dfaRecognizesEmptyLanguage(dfa2));