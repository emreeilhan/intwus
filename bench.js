import { performance } from 'perf_hooks';

async function runBench() {
  const start = performance.now();
  for(let i=0; i<1000; i++) {
    const res = await fetch('http://localhost:3000/api/profile');
    await res.json();
  }
  const end = performance.now();
  console.log(`1000 requests took: ${end - start} ms`);
}

runBench();
