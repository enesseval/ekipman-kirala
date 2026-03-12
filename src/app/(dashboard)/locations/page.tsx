import TopBar from '@/components/layout/TopBar';
import LocationCard from '@/components/locations/LocationCard';
import { getLocations } from '@/lib/data/locations';
import { getEquipmentAtLocation } from '@/lib/data/equipment';
import { mockEquipment } from '@/lib/mock';

export default function LocationsPage() {
  const locations = getLocations();

  // Split into active (events) and storage
  const activeLocations = locations.filter(
    (l) => l.venueType !== 'other' && l.equipmentIds.length > 0
  );
  const storageLocations = locations.filter((l) => l.venueType === 'other');

  // Total machines deployed
  const deployedCount = mockEquipment.filter((e) => e.status === 'rented').length;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Konum Haritası"
        subtitle={`${activeLocations.length} aktif konum · ${deployedCount} ekipman konuşlandırıldı`}
      />

      <div className="flex-1 p-6 space-y-8">
        {/* Active locations */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display font-semibold text-base text-stone-100">
              Aktif Konumlar
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              {activeLocations.length} konum
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeLocations.map((location) => {
              const machines = location.equipmentIds
                .map((id) => mockEquipment.find((e) => e.id === id))
                .filter((e): e is (typeof mockEquipment)[0] => e !== undefined);

              return (
                <LocationCard
                  key={location.id}
                  location={location}
                  machines={machines}
                />
              );
            })}
          </div>
        </section>

        {/* Storage / warehouse */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display font-semibold text-base text-stone-100">
              Depo & Bakım
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 font-medium">
              {storageLocations.length} tesis
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {storageLocations.map((location) => {
              const machines = location.equipmentIds
                .map((id) => mockEquipment.find((e) => e.id === id))
                .filter((e): e is (typeof mockEquipment)[0] => e !== undefined);

              return (
                <LocationCard
                  key={location.id}
                  location={location}
                  machines={machines}
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
