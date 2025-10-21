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
    id: 'created_at',
    accessorKey: 'created_at',
    header: 'Data',
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString()
    }
  },
  {
    id: 'home_player.label',
    accessorKey: 'home_player.label',
    header: 'In casa'
  },
  {
    id: 'away_player.label',
    accessorKey: 'away_player.label',
    header: 'Ospite'
  },
  {
    id: 'score',
    accessorKey: 'score',
    header: 'risultato',
    cell: ({ row }) => {
      return `${row.original.home_score} - ${row.original.away_score}`
    }
  }
]

const matches = ref([])
const loadingMatches = ref(false)
async function fetchMatches() {
  loadingMatches.value = true
  const { data, error } = await supabase
    .from('matches')
    .select('*, home_player(id, label, elo_rating), away_player(id, label, elo_rating)')
    .order('created_at', { ascending: false })

  if (error)
    console.error(error)

  loadingMatches.value = false
  matches.value = data?.map((item, index) => ({
    ...item,
    home_player: {
      id: item.home_player?.id,
      label: item.home_player?.label ?? 'Giocatore sconosciuto',
      elo_rating: item.home_player?.elo_rating ?? 0
    },
    away_player: {
      id: item.away_player?.id,
      label: item.away_player?.label ?? 'Giocatore sconosciuto',
      elo_rating: item.away_player?.elo_rating ?? 0
    },
    status: item.status ?? 'Sconosciuto',
    home_score: item.home_score ?? 0,
    away_score: item.away_score ?? 0
  }))
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
