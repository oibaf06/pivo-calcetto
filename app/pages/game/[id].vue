<script setup>

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
const homePlayer = ref({ id: '', label: '' })
const awayPlayer = ref({ id: '', label: '' })
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
      .select('*, home_player(id, label, elo_rating), away_player(id, label, elo_rating)')
      .eq('id', gameId)
      .single()

    if (error) {
      console.error('Error fetching initial game data:', error)
      game.value = null
    } else {
      game.value = data
      homePlayer.value = data.home_player
      awayPlayer.value = data.away_player

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
</script>

<template>
  <div class="p-2">
    <div class="flex w-full h-40 items-center">
      <div class="flex justify-center items-center flex-1">
        <span class="text-xl">{{ homePlayer.label }}</span>
        <span class="text-xs ml-2">{{ homePlayer.elo_rating }}</span>
      </div>
      <UIcon name="i-custom-versus" class="size-40" />
      <div class="flex justify-center items-center flex-1">
        <span class="text-xl">{{ awayPlayer.label }}</span>
        <span class="text-xs ml-2">{{ awayPlayer.elo_rating }}</span>
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
      
      <UButton ></UButton>
    </div>
    
    <div v-else class="text-center py-8">
      <p class="text-2xl font-bold text-red-600">Partita Non Trovata</p>
      <p class="mt-2 text-gray-500">L'ID partita '{{ gameId }}' non esiste o è stata eliminata.</p>
    </div>
  </div>
</template>
