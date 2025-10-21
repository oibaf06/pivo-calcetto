<script setup lang="ts">
import type { Database } from '~/types/supabase'

const supabase = useSupabaseClient<Database>()
const router = useRouter()

const { data: players } = await useAsyncData('players', async () => {
  const { data } = await supabase.from('players').select('id, label')
  return data
})

const homePlayers = ref([])
const awayPlayers = ref([])

const playerOptions = computed(() => players.value?.map(p => ({ label: p.label, value: p.id })) || [])

async function startGame() {
  const homeP = homePlayers.value.filter(Boolean)
  const awayP = awayPlayers.value.filter(Boolean)

  if (homeP.length === 0 || awayP.length === 0) {
    alert('Please select at least one player for each team')
    return
  }

  const allPlayers = [...homeP, ...awayP]
  if (new Set(allPlayers).size !== allPlayers.length) {
    alert('Players cannot be the same')
    return
  }

  const { data: match, error } = await supabase
    .from('matches')
    .insert({
      status: 'ongoing',
    })
    .select('id')
    .single()

  if (error || !match) {
    console.error('Error creating match:', error)
    alert('Error creating match')
    return
  }

  const playersToInsert = [
    ...homeP.map(p => ({ match_id: match.id, player_id: p, team: 'home' })),
    ...awayP.map(p => ({ match_id: match.id, player_id: p, team: 'away' })),
  ]

  const { error: playersError } = await supabase
    .from('match_players')
    .insert(playersToInsert)

  if (playersError) {
    console.error('Error adding players to match:', playersError)
    alert('Error adding players to match')
    // TODO: delete match if players cannot be added
    return
  }

  if (match) {
    router.push(`/game/${match.id}`)
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Nuova Partita</h1>
    <div class="flex flex-col gap-2">
      <UFormField label="In casa" class="w-full">
        <div class="flex gap-2">
          <USelect v-model="homePlayers[0]" :items="playerOptions" placeholder="Giocatore 1" class="w-full"/>
          <USelect v-model="homePlayers[1]" :items="playerOptions" placeholder="Giocatore 2" class="w-full"/>
        </div>
      </UFormField>
      <UFormField label="Ospite" class="w-full">
        <div class="flex gap-2">
          <USelect v-model="awayPlayers[0]" :items="playerOptions" placeholder="Giocatore 1" class="w-full"/>
          <USelect v-model="awayPlayers[1]" :items="playerOptions" placeholder="Giocatore 2" class="w-full"/>
        </div>
      </UFormField>
      <UButton @click="startGame">
        Inizia partita
      </UButton>
    </div>
  </div>
</template>
