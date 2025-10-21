<script setup>
const supabase = useSupabaseClient()
const router = useRouter()

const leaderboardColumns = [
  {
    id: 'position',
    accessorKey: 'position',
    header: 'Posizione'
  },
  {
    id: 'player.label',
    accessorKey: 'player.label',
    header: 'Giocatore'
  },
  {
    id: 'player.elo_rating',
    accessorKey: 'player.elo_rating',
    header: 'Elo'
  },
]

const leaderboard = ref([])
const loadingLeaderboard = ref(false)
async function fetchLeaderboard() {
  loadingLeaderboard.value = true
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*, player(id, label, elo_rating)')
    .order('elo_rating', { foreignTable: 'player', ascending: true })

  if (error)
    console.error(error)

  loadingLeaderboard.value = false
  leaderboard.value = data?.map((item, index) => ({
    ...item,
    position: index + 1,
    player: {
      id: item.player?.id,
      label: item.player?.label ?? 'Giocatore sconosciuto',
      elo_rating: item.player?.elo_rating ?? 0
    }
  }))
}

const matchesColumns = [
  {
    id: 'score',
    accessorKey: 'score',
    header: 'risultato',
    cell: ({ row }) => {
      return `${row.original.home_score} - ${row.original.away_score}`
    }
  },
  {
    id: 'home_players',
    header: 'In casa',
    cell: ({ row }) => {
      const players = row.original.match_players.filter(p => p.team === 'home').map(p => p.players.label)
      return players.join(', ')
    }
  },
  {
    id: 'away_players',
    header: 'Ospite',
    cell: ({ row }) => {
      const players = row.original.match_players.filter(p => p.team === 'away').map(p => p.players.label)
      return players.join(', ')
    }
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: 'Data',
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString()
    }
  },
]

const matches = ref([])
const loadingMatches = ref(false)
async function fetchMatches() {
  loadingMatches.value = true
  const { data, error } = await supabase
    .from('matches')
    .select('*, match_players(*, players(*))')
    .order('created_at', { ascending: false })

  if (error)
    console.error(error)

  loadingMatches.value = false
  matches.value = data
}

onMounted(async () => {
  fetchLeaderboard()
  fetchMatches()
})

</script>

<template>
  <div class="p-4 flex flex-col gap-2">
    <div class="w-full grid grid-cols-2 h-40 gap-2">
      <UButton @click="router.push('/player/new')">
        <UIcon name="i-game-icons-soccer-kick" class="text-7xl"/>
        <span class="text-xl">Aggiungi Giocatore</span>
      </UButton>
      <UButton @click="router.push('/game/start')">
        <UIcon name="i-material-symbols-play-arrow-outline-rounded" class="text-7xl"/>
        <span class="text-xl">Inizia<br/>Partita</span>
      </UButton>
    </div>
    <USeparator class="my-4"/>
    <div class="text-lg mx-auto">CLASSIFICA</div>
    <UTable ref="table" :data="leaderboard" :columns="leaderboardColumns" :loading="loadingLeaderboard" @select="(row) => router.push(`/player/${row.original.player.id}`)">
      <template #empty >
        <div class="flex flex-col justify-center items-center gap-2">
          <span>Non c'è nessun giocatore, aggiungilo</span>
          <UButton @click="router.push('/player/new')">Aggiungi Giocatore</UButton>
        </div>
      </template>
    </UTable>
    <USeparator class="my-4"/>
    <div class="text-lg mx-auto">ULTIME PARTITE GIOCATE</div>
    <UTable ref="table" :data="matches" :columns="matchesColumns" :loading="loadingMatches" @select="(row) => router.push(`/game/${row.original.id}`)">
      <template #empty >
        <div class="flex flex-col justify-center items-center gap-2">
          <span>Non c'è nessuna partita, scomisia a sugare</span>
          <UButton @click="router.push('/game/start')">Inizia<br/>Partita</UButton>
        </div>
      </template>
    </UTable>
  </div>
</template>
