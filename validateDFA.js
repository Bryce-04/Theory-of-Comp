function validateDFA(dfa) {
  const required = ["states", "alphabet", "transitions", "start_state", "accept_states"];

  // Check required fields exist
  for (const prop of required) {
    if (!dfa.hasOwnProperty(prop)) {
      return 0;
    }
  }

  const { states, alphabet, transitions, start_state, accept_states } = dfa;

  // states must be an array of unique values
  if (!Array.isArray(states) || new Set(states).size !== states.length) return 0;

  // alphabet must be an array of unique symbols
  if (!Array.isArray(alphabet) || new Set(alphabet).size !== alphabet.length) return 0;

  // transitions must be an object
  if (typeof transitions !== "object" || transitions === null) return 0;

  // Every state must have a transition for every symbol
  for (const state of states) {
    if (!transitions.hasOwnProperty(state)) return 0;

    for (const symbol of alphabet) {
      if (!transitions[state].hasOwnProperty(symbol)) return 0;

      const target = transitions[state][symbol];
      if (!states.includes(target)) return 0;
    }
  }

  // start_state must be valid
  if (!states.includes(start_state)) return 0;

  // accept_states must all be valid
  if (!Array.isArray(accept_states)) return 0;
  for (const a of accept_states) {
    if (!states.includes(a)) return 0;
  }

  return 1;
}

// ================================================================
// EXAMPLES
// ================================================================

// ---------- VALID DFA ----------
const validDFA = {
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

// ---------- INVALID DFA (missing transition) ----------
const invalidDFA1 = {
  states: ["q0", "q1"],
  alphabet: ["a", "b"],
  transitions: {
    q0: { a: "q1" },         // Missing 'b' transition → invalid
    q1: { a: "q0", b: "q1" }
  },
  start_state: "q0",
  accept_states: ["q1"]
};

// ---------- INVALID DFA (transition to nonexistent state) ----------
const invalidDFA2 = {
  states: ["s0", "s1"],
  alphabet: ["a"],
  transitions: {
    s0: { a: "BAD" },       // "BAD" not in states → invalid
    s1: { a: "s0" }
  },
  start_state: "s0",
  accept_states: ["s1"]
};
console.log("Valid DFA:", validateDFA(validDFA));         // → 1
console.log("Invalid DFA #1:", validateDFA(invalidDFA1)); // → 0
console.log("Invalid DFA #2:", validateDFA(invalidDFA2)); // → 0