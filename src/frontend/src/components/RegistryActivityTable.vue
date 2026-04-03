<template>
  <div class="glass rounded-2xl p-6">
    <h3 class="font-headline font-semibold text-onSurface text-lg mb-4">Registry Activity</h3>

    <div class="overflow-auto max-h-[360px]">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-surface">
          <tr class="text-onSurface-variant font-label text-xs uppercase tracking-widest">
            <th class="text-left py-2 px-3 w-2/5">Event</th>
            <th class="text-left py-2 px-3 w-1/4">Model</th>
            <th class="text-left py-2 px-3 w-1/4">Timestamp</th>
            <th class="text-left py-2 px-3 w-1/8">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in activityRows"
            :key="row.id"
            class="transition-colors duration-100"
            :class="index % 2 === 0 ? 'bg-surface-low' : 'bg-surface'"
          >
            <td class="py-2.5 px-3 text-onSurface font-body">{{ row.event }}</td>
            <td class="py-2.5 px-3 text-onSurface-variant font-label text-xs">{{ row.model }}</td>
            <td class="py-2.5 px-3 text-onSurface-variant font-label text-xs">{{ row.timestamp }}</td>
            <td class="py-2.5 px-3">
              <span class="flex items-center gap-1.5 font-label text-xs" :class="row.statusClass">
                <span class="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" :class="row.dotClass"></span>
                {{ row.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ActivityRow {
  id: number;
  event: string;
  model: string;
  timestamp: string;
  status: string;
  statusClass: string;
  dotClass: string;
}

const activityRows: ActivityRow[] = [
  {
    id: 1,
    event: 'Model Added',
    model: 'gpt-4o',
    timestamp: '2026-04-02 22:14',
    status: 'Success',
    statusClass: 'text-green-400',
    dotClass: 'bg-green-400',
  },
  {
    id: 2,
    event: 'Temperature Updated',
    model: 'claude-3-5-sonnet',
    timestamp: '2026-04-02 21:50',
    status: 'Success',
    statusClass: 'text-green-400',
    dotClass: 'bg-green-400',
  },
  {
    id: 3,
    event: 'Model Deprecated',
    model: 'gpt-3.5-turbo',
    timestamp: '2026-04-02 20:33',
    status: 'Warning',
    statusClass: 'text-amber-400',
    dotClass: 'bg-amber-400',
  },
  {
    id: 4,
    event: 'Feature Mapping Updated',
    model: 'gemini-1.5-pro',
    timestamp: '2026-04-02 19:08',
    status: 'Success',
    statusClass: 'text-green-400',
    dotClass: 'bg-green-400',
  },
  {
    id: 5,
    event: 'API Key Validated',
    model: 'claude-3-opus',
    timestamp: '2026-04-02 18:42',
    status: 'Success',
    statusClass: 'text-green-400',
    dotClass: 'bg-green-400',
  },
  {
    id: 6,
    event: 'Model Added',
    model: 'gemini-1.5-flash',
    timestamp: '2026-04-02 17:20',
    status: 'Success',
    statusClass: 'text-green-400',
    dotClass: 'bg-green-400',
  },
  {
    id: 7,
    event: 'Health Check',
    model: 'gpt-4o-mini',
    timestamp: '2026-04-02 16:55',
    status: 'Success',
    statusClass: 'text-green-400',
    dotClass: 'bg-green-400',
  },
  {
    id: 8,
    event: 'Rate Limit Warning',
    model: 'gpt-4o',
    timestamp: '2026-04-02 15:30',
    status: 'Warning',
    statusClass: 'text-amber-400',
    dotClass: 'bg-amber-400',
  },
  {
    id: 9,
    event: 'Context Window Updated',
    model: 'claude-3-haiku',
    timestamp: '2026-04-02 14:12',
    status: 'Success',
    statusClass: 'text-green-400',
    dotClass: 'bg-green-400',
  },
  {
    id: 10,
    event: 'Model Added',
    model: 'claude-3-haiku',
    timestamp: '2026-04-02 13:45',
    status: 'Success',
    statusClass: 'text-green-400',
    dotClass: 'bg-green-400',
  },
];
</script>
