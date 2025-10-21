<script setup>
const { calculateElo } = useElo()
// Assuming these are available via Nuxt auto-imports or context-specific composables
const supabase = useSupabaseClient()
const route = useRoute() // Access to route parameters

// 1. Get the game ID from the route parameters
const gameId = route.params.id

// Reactive state for the game data
const game = ref(null)
const loading = ref(true)
// Variable to hold the Supabase real-time channel instance
let gameChannel = null
const homePlayers = ref([])
const awayPlayers = ref([])
/**
 * Fetches the initial game data and sets up the real-time subscription.
 */
const setupRealtimeSubscription = () => {
  if (!gameId) {
    console.error('Game ID not found in route.')
    loading.value = false
    return
  }

  // Function to fetch the game data from the database
  const fetchGameData = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, match_players(*, players(*))')
      .eq('id', gameId)
      .single()

    if (error) {
      console.error('Error fetching initial game data:', error)
      game.value = null
    } else {
      game.value = data
      homePlayers.value = data.match_players.filter(p => p.team === 'home').map(p => p.players)
      awayPlayers.value = data.match_players.filter(p => p.team === 'away').map(p => p.players)
    }
    loading.value = false
  }

  // 2. Setup the Realtime Channel
  gameChannel = supabase.channel(`game_${gameId}`)

  gameChannel
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'matches', 
        filter: `id=eq.${gameId}` 
      },
      (payload) => {
        console.log('Realtime change received!', payload)
        
        // Update the game state with the latest data from the payload
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          game.value = payload.new
        }
        if (payload.eventType === 'DELETE') {
          game.value = null
          console.log(`Game ${gameId} was deleted.`)
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Once the subscription is confirmed, fetch the initial data
        fetchGameData()
      } else if (status === 'CHANNEL_ERROR') {
         console.error('Realtime channel error.')
      }
    })
}

onMounted(() => {
  setupRealtimeSubscription()
})

// 3. Cleanup: Remove the channel when the component is unmounted
onUnmounted(() => {
  if (gameChannel) {
    console.log(`Unsubscribing from game_${gameId}`)
    supabase.removeChannel(gameChannel)
  }
})

const removeHomeGoal = async () => {
  if (!game.value) return
  const { error } = await supabase
    .from('matches')
    .update({ home_score: game.value.home_score - 1 })
    .eq('id', gameId)
  if (error) console.error('Error updating home score:', error)
}

const removeAwayGoal = async () => {
  if (!game.value) return
  const { error } = await supabase
    .from('matches')
    .update({ away_score: game.value.away_score - 1 })
    .eq('id', gameId)
  if (error) console.error('Error updating away score:', error)
}

const homeGoal = async () => {
  if (!game.value) return
  const { error } = await supabase
    .from('matches')
    .update({ home_score: game.value.home_score + 1 })
    .eq('id', gameId)
  if (error) console.error('Error updating home score:', error)
}

const awayGoal = async () => {
  if (!game.value) return
  const { error } = await supabase
    .from('matches')
    .update({ away_score: game.value.away_score + 1 })
    .eq('id', gameId)
  if (error) console.error('Error updating away score:', error)
}

const router = useRouter()
const stopGame = async () => {
  if (!game.value) return

  const homeScore = game.value.home_score > game.value.away_score ? 1 : 0

  const { teamA: newHomePlayers, teamB: newAwayPlayers } = calculateElo(
    homePlayers.value.map(p => ({ elo: p.elo_rating })),
    awayPlayers.value.map(p => ({ elo: p.elo_rating })),
    homeScore,
  )

  for (const player of newHomePlayers) {
    const oldPlayer = homePlayers.value.find(p => p.elo_rating === player.oldElo)
    await supabase.from('players').update({ elo_rating: player.elo }).eq('id', oldPlayer.id)
  }

  for (const player of newAwayPlayers) {
    const oldPlayer = awayPlayers.value.find(p => p.elo_rating === player.oldElo)
    await supabase.from('players').update({ elo_rating: player.elo }).eq('id', oldPlayer.id)
  }

  const { error } = await supabase
    .from('matches')
    .update({ status: 'finished' })
    .eq('id', gameId)
  if (error) console.error('Error stopping game:', error)
  router.push('/')
}

const resumeGame = async () => {
  if (!game.value) return
  const { error } = await supabase
    .from('matches')
    .update({ status: 'ongoing' })
    .eq('id', gameId)
  if (error) console.error('Error resuming game:', error)
}
</script>

<template>
  <div class="p-2">
    <div class="flex w-full h-40 items-center">
      <div class="flex flex-col justify-center items-center flex-1">
        <div v-for="player in homePlayers" :key="player.id" class="flex items-center">
          <span class="text-xl">{{ player.label }}</span>
          <span class="text-xs ml-2">{{ player.elo_rating }}</span>
        </div>
      </div>
      <UIcon name="i-custom-versus" class="size-40" />
      <div class="flex flex-col justify-center items-center flex-1">
        <div v-for="player in awayPlayers" :key="player.id" class="flex items-center">
          <span class="text-xl">{{ player.label }}</span>
          <span class="text-xs ml-2">{{ player.elo_rating }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-8">
      <!-- Loading Spinner -->
      <UIcon name="i-heroicons-arrow-path-solid" class="animate-spin text-5xl text-blue-600" />
      <p class="mt-4 text-lg font-medium text-gray-600">Caricamento dati partita in tempo reale...</p>
    </div>
    
    <div v-else-if="game" class="space-y-4">
      <p class="text-3xl font-extrabold">{{ game.status.toUpperCase() === 'ONGOING' ? 'In corso' : 'Finita' }}</p>
      <p class="text-3xl font-extrabold">{{ `${game.home_score} - ${game.away_score}` }}</p>
      
      <div class="grid grid-cols-2 gap-2 h-40" v-if="game.status === 'ongoing'">
        <UButton @click="homeGoal">
          Goal In casa
        </UButton>
        <UButton @click="awayGoal">
          Goal Ospite
        </UButton>
        <UButton @click="removeHomeGoal">
          Rimuovi Goal In casa
        </UButton>
        <UButton @click="removeAwayGoal">
          Rimuovi Goal Ospite
        </UButton>
      </div>
      <UButton v-if="game.status === 'ongoing'" @click="stopGame()" class="w-full">
        Fine partita
      </UButton>
      <UButton v-else @click="resumeGame" class="w-full">
        Riprendi partita
      </UButton>

    </div>
    
    <div v-else class="text-center py-8">
      <p class="text-2xl font-bold text-red-600">Partita Non Trovata</p>
      <p class="mt-2 text-gray-500">L'ID partita '{{ gameId }}' non esiste o è stata eliminata.</p>
    </div>
  </div>
</template>
