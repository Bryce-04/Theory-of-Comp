function* enumerateDFA() {
  const states = [0, 1];
  const alphabet = ["a", "b"];

  const nextStateChoices = [0, 1];

  for (const q0a of nextStateChoices)
  for (const q0b of nextStateChoices)
  for (const q1a of nextStateChoices)
  for (const q1b of nextStateChoices)
  for (const start of states)
  for (const accept0 of [0, 1])
  for (const accept1 of [0, 1]) {

    const acceptStates = [];
    if (accept0) acceptStates.push(0);
    if (accept1) acceptStates.push(1);

    const dfa = {
      states,
      alphabet,
      transitions: {
        0: { a: q0a, b: q0b },
        1: { a: q1a, b: q1b }
      },
      start_state: start,
      accept_states: acceptStates
    };

    yield dfa;
  }
}

// =============================================================
// PRINT FIRST 20 DFAs
// =============================================================

let count = 0;
for (const dfa of enumerateDFA()) {
  console.log(`\n===== DFA #${count + 1} =====`);
  console.log(JSON.stringify(dfa, null, 2));

  count++;
  if (count >= 20) break;
}

console.log(`\nGenerated ${count} DFAs.`);