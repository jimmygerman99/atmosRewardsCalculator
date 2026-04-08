#!/usr/bin/env python3
"""
Reads airports.csv from stdin (OurAirports format), filters to airports with
IATA codes and type large_airport or medium_airport, then outputs a TypeScript
file to stdout.
"""
import csv
import sys
import json

def main():
    reader = csv.DictReader(sys.stdin)
    airports = []
    seen_iata = set()

    for row in reader:
        airport_type = row.get('type', '').strip()
        if airport_type not in ('large_airport', 'medium_airport'):
            continue

        iata = row.get('iata_code', '').strip()
        if not iata or iata in seen_iata:
            continue

        try:
            lat = float(row.get('latitude_deg', ''))
            lon = float(row.get('longitude_deg', ''))
        except ValueError:
            continue

        name = row.get('name', '').strip().replace('\\', '\\\\').replace('"', '\\"')
        city = row.get('municipality', '').strip().replace('\\', '\\\\').replace('"', '\\"')

        seen_iata.add(iata)
        airports.append((iata, name, city, lat, lon))

    airports.sort(key=lambda a: a[0])

    lines = []
    lines.append('// AUTO-GENERATED — do not edit. Run scripts/build-airports.py to regenerate.')
    lines.append('')
    lines.append('export interface Airport { iata: string; name: string; city: string; lat: number; lon: number; }')
    lines.append('')
    lines.append('export const AIRPORTS: Airport[] = [')
    for iata, name, city, lat, lon in airports:
        lines.append(f'  {{ iata: "{iata}", name: "{name}", city: "{city}", lat: {lat}, lon: {lon} }},')
    lines.append('];')
    lines.append('')
    lines.append('export const AIRPORT_MAP: Record<string, Airport> = Object.fromEntries(AIRPORTS.map(a => [a.iata, a]));')
    lines.append('')

    print('\n'.join(lines))

if __name__ == '__main__':
    main()
