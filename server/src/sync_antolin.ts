import { syncAntolin } from './domain/admin';

async function main() {
  process.stdout.write(`Starting Antolin sync.`);
  const res = await syncAntolin();
  process.stdout.write(`${res.books} books loaded.`);
}

main();
