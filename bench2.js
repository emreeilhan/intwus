import { performance } from 'perf_hooks';

async function runBench() {
  const start = performance.now();
  const promises = [];
  for(let i=0; i<1000; i++) {
    promises.push(fetch('http://localhost:3000/api/profile').then(res => res.json()));
  }
  await Promise.all(promises);
  const end = performance.now();
  console.log(`1000 concurrent requests took: ${end - start} ms`);
}

runBench();
