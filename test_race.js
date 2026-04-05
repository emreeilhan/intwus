import { performance } from 'perf_hooks';

async function run() {
  const responses = await Promise.all([
    fetch('http://localhost:3000/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: { executive: 'Exec1' } })
    }),
    fetch('http://localhost:3000/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: { profile: 'Prof2' } })
    })
  ]);

  const p1 = await responses[0].json();
  const p2 = await responses[1].json();

  const final = await (await fetch('http://localhost:3000/api/profile')).json();
  console.log(final.summary.executive, final.summary.profile);
}

run();
