'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import LocationCard from '@/components/locations/LocationCard';
import LocationSheet from '@/components/locations/LocationSheet';
import { getLocations } from '@/lib/data/locations';
import { getEventById } from '@/lib/data/events';
import { mockEquipment } from '@/lib/mock';
import type { Location, Event, Equipment } from '@/lib/types';

export default function LocationsPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const locations = getLocations();

  const activeLocations = locations.filter(
    (l) => l.venueType !== 'other' && l.equipmentIds.length > 0
  );
  const storageLocations = locations.filter((l) => l.venueType === 'other');
  const deployedCount = mockEquipment.filter((e) => e.status === 'rented').length;

  // Resolve machines for a location
  const getMachines = (loc: Location): Equipment[] =>
    loc.equipmentIds
      .map((id) => mockEquipment.find((e) => e.id === id))
      .filter((e): e is Equipment => e !== undefined);

  // Resolve active event for a location
  const getEvent = (loc: Location): Event | null =>
    loc.activeEventId ? (getEventById(loc.activeEventId) ?? null) : null;

  const handleOpen = (loc: Location) => setSelectedLocation(loc);
  const handleClose = () => setSelectedLocation(null);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Konum Haritası"
        subtitle={`${activeLocations.length} aktif konum · ${deployedCount} ekipman konuşlandırıldı`}
      />

      <div className="flex-1 p-6 space-y-8">

        {/* Active locations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-semibold text-base text-stone-100">
                Aktif Konumlar
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {activeLocations.length} konum
              </span>
            </div>
            <Link href="/locations/new" className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Plus size={13} />
              Yeni Konum
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                machines={getMachines(location)}
                onClick={() => handleOpen(location)}
              />
            ))}
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
            {storageLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                machines={getMachines(location)}
                onClick={() => handleOpen(location)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Location detail sheet */}
      {selectedLocation && (
        <LocationSheet
          location={selectedLocation}
          event={getEvent(selectedLocation)}
          machines={getMachines(selectedLocation)}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
