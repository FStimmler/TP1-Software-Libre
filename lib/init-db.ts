// server/init-db.ts
import { connectToDatabase } from './mongo';
import { generateMockZones, generateMockCattle } from './mock-data';
import type { Zone } from "@/lib/cattle-context"

export async function initDatabase() {
  const db = await connectToDatabase();
  let zones:Zone[] = generateMockZones();
  const zonesCollection = db.collection('zones');
  const cattleCollection = db.collection('cattle');

  let count = await zonesCollection.countDocuments();
  if (count === 0) {
    console.log('📥 Insertando datos mock zonas en MongoDB...');
    await zonesCollection.insertMany(zones);
    console.log('✅ Datos mock zonas insertados');
  } else {
    console.log('ℹ️ Datos ya existentes, no se insertan duplicados.');
  }

  count = await cattleCollection.countDocuments();
  if (count === 0) {
    console.log('📥 Insertando datos mock ganado en MongoDB...');
    await cattleCollection.insertMany(generateMockCattle(zones));
    console.log('✅ Datos mock ganado insertados');
  } else {
    console.log('ℹ️ Datos ya existentes, no se insertan duplicados.');
  }
}
