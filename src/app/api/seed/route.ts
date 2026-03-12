import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { mockEquipment, mockLocations, mockEvents, mockQuotes, mockMaintenance } from '@/lib/mock';

// POST /api/seed  — run once to populate Supabase with mock data
// Protected: only works in development or with SEED_SECRET header
export async function POST(request: Request) {
  const secret = request.headers.get('x-seed-secret');
  if (process.env.NODE_ENV === 'production' && secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const errors: string[] = [];

  try {
    // ── 1. Locations (no FK deps) ────────────────────────────────────────────
    const locRows = mockLocations.map((l) => ({
      id: l.id,
      name: l.name,
      venue_type: l.venueType,
      address: l.address,
      city: l.city,
      country: l.country,
      lat: l.lat,
      lng: l.lng,
      contact_name: l.contactName,
      contact_email: l.contactEmail,
      contact_phone: l.contactPhone,
      active_event_id: l.activeEventId,
      start_date: l.startDate,
      end_date: l.endDate,
      notes: l.notes,
      created_at: l.createdAt,
    }));
    const { error: locErr } = await supabase
      .from('locations')
      .upsert(locRows, { onConflict: 'id' });
    if (locErr) errors.push(`locations: ${locErr.message}`);

    // ── 2. Equipment ─────────────────────────────────────────────────────────
    const eqRows = mockEquipment.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      brand: e.brand,
      model: e.model,
      serial_number: e.serialNumber,
      status: e.status,
      health_status: e.healthStatus,
      cups_served_since_service: e.cupsServedSinceService,
      cups_service_threshold: e.cupsServiceThreshold,
      total_cups_served: e.totalCupsServed,
      location_id: e.locationId,
      last_service_date: e.lastServiceDate,
      next_service_due: e.nextServiceDue,
      daily_rental_rate: e.dailyRentalRate,
      notes: e.notes,
      image_url: e.imageUrl,
      created_at: e.createdAt,
      updated_at: e.updatedAt,
    }));
    const { error: eqErr } = await supabase
      .from('equipment')
      .upsert(eqRows, { onConflict: 'id' });
    if (eqErr) errors.push(`equipment: ${eqErr.message}`);

    // ── 3. Events ────────────────────────────────────────────────────────────
    const evtRows = mockEvents.map((ev) => ({
      id: ev.id,
      name: ev.name,
      type: ev.type,
      status: ev.status,
      client_name: ev.clientName,
      client_email: ev.clientEmail,
      client_phone: ev.clientPhone,
      location_id: ev.locationId,
      venue_name: ev.venueName,
      venue_address: ev.venueAddress,
      start_date: ev.startDate,
      end_date: ev.endDate,
      expected_attendees: ev.expectedAttendees,
      expected_cups_per_day: ev.expectedCupsPerDay,
      barista_count: ev.baristaCount,
      quote_id: ev.quoteId,
      notes: ev.notes,
      created_at: ev.createdAt,
      updated_at: ev.updatedAt,
    }));
    const { error: evtErr } = await supabase
      .from('events')
      .upsert(evtRows, { onConflict: 'id' });
    if (evtErr) errors.push(`events: ${evtErr.message}`);

    // ── 4. Event equipment junction ──────────────────────────────────────────
    const junctionRows = mockEvents.flatMap((ev) =>
      ev.equipmentIds.map((eqId) => ({ event_id: ev.id, equipment_id: eqId }))
    );
    if (junctionRows.length > 0) {
      const { error: jErr } = await supabase
        .from('event_equipment')
        .upsert(junctionRows, { onConflict: 'event_id,equipment_id' });
      if (jErr) errors.push(`event_equipment: ${jErr.message}`);
    }

    // ── 5. Maintenance records ───────────────────────────────────────────────
    const maintRows = mockMaintenance.map((m) => ({
      id: m.id,
      equipment_id: m.equipmentId,
      service_type: m.serviceType,
      performed_by: m.performedBy,
      performed_at: m.performedAt,
      cups_at_service: m.cupsAtService,
      description: m.description,
      cost: m.cost,
      next_service_at: m.nextServiceAt,
    }));
    const { error: maintErr } = await supabase
      .from('maintenance_records')
      .upsert(maintRows, { onConflict: 'id' });
    if (maintErr) errors.push(`maintenance_records: ${maintErr.message}`);

    // ── 6. Quotes ────────────────────────────────────────────────────────────
    const quoteRows = mockQuotes.map((q) => ({
      id: q.id,
      quote_number: q.quoteNumber,
      status: q.status,
      client_name: q.clientName,
      client_email: q.clientEmail,
      client_phone: q.clientPhone,
      event_id: q.eventId,
      subtotal: q.subtotal,
      tax_rate: q.taxRate,
      tax_amount: q.taxAmount,
      discount_amount: q.discountAmount,
      total: q.total,
      valid_until: q.validUntil || null,
      notes: q.notes,
      generated_by_ai: q.generatedByAI,
      created_at: q.createdAt,
      updated_at: q.updatedAt,
    }));
    const { error: qErr } = await supabase
      .from('quotes')
      .upsert(quoteRows, { onConflict: 'id' });
    if (qErr) errors.push(`quotes: ${qErr.message}`);

    // ── 7. Quote line items ──────────────────────────────────────────────────
    const lineItemRows = mockQuotes.flatMap((q) =>
      q.lineItems.map((li) => ({
        id: li.id,
        quote_id: q.id,
        equipment_id: li.equipmentId,
        equipment_name: li.equipmentName,
        equipment_type: li.equipmentType,
        days: li.days,
        daily_rate: li.dailyRate,
        subtotal: li.subtotal,
        notes: li.notes,
      }))
    );
    if (lineItemRows.length > 0) {
      const { error: liErr } = await supabase
        .from('quote_line_items')
        .upsert(lineItemRows, { onConflict: 'id' });
      if (liErr) errors.push(`quote_line_items: ${liErr.message}`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      seeded: {
        locations: locRows.length,
        equipment: eqRows.length,
        events: evtRows.length,
        event_equipment: junctionRows.length,
        maintenance_records: maintRows.length,
        quotes: quoteRows.length,
        quote_line_items: lineItemRows.length,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
