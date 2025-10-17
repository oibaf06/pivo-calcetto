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

async function startGame() {
  const { data, error } = await supabase
    .from('games')
    .insert({ status: 'ongoing' })
    .select('id')
    .single()
  if (error)
    console.error(error)

  router.push(`/game/${data?.id}`)
  
}

const leaderboard = ref([])
const loadingLeaderboard = ref(false)
async function fetchLeaderboard() {
  loadingLeaderboard.value = true
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*, player(label, elo_rating)')
    .order('player.elo_rating', { ascending: true })

  if (error)
    console.error(error)

  loadingLeaderboard.value = false
  leaderboard.value = data?.map((item, index) => ({
    ...item,
    position: index + 1,
  }))
}

onMounted(async () => {
  fetchLeaderboard()
})

</script>

<template>
  <div class="p-4 flex flex-col gap-2">
    <div class="w-full grid grid-cols-2 h-40 gap-2">
      <UButton @click="console.log('click')">
        <UIcon name="i-material-symbols-add" class="text-7xl"/>
        <span class="text-xl">Aggiungi<br/>Partita</span>
      </UButton>
      <UButton @click="startGame()">
        <UIcon name="i-material-symbols-play-arrow-outline-rounded" class="text-7xl"/>
        <span class="text-xl">Inizia<br/>Partita</span>
      </UButton>
    </div>
    <UTable ref="table" :data="leaderboard" :columns="leaderboardColumns" :loading="loadingLeaderboard" >
      <template #empty >
        <div class="flex flex-col justify-center items-center gap-2">
          <span>Non c'è nessun giocatore, aggiungilo</span>
          <UButton @click="router.push('/player/new')">Aggiungi Giocatore</UButton>
        </div>
      </template>
    </UTable>
    
  </div>
</template>
