<script setup lang="ts">
import type { Database } from '~/types/supabase'

const supabase = useSupabaseClient<Database>()
const router = useRouter()

const { data: players } = await useAsyncData('players', async () => {
  const { data } = await supabase.from('players').select('id, label')
  return data
})

const homePlayer = ref()
const awayPlayer = ref()

const playerOptions = computed(() => players.value?.map(p => ({ label: p.label, value: p.id })) || [])

async function startGame() {
  if (!homePlayer.value || !awayPlayer.value) {
    alert('Please select both players')
    return
  }

  if (homePlayer.value === awayPlayer.value) {
    alert('Players cannot be the same')
    return
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({
      home_player: homePlayer.value,
      away_player: awayPlayer.value,
      status: 'ongoing',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating match:', error)
    alert('Error creating match')
    return
  }

  if (data) {
    router.push(`/game/${data.id}`)
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Nuova Partita</h1>
    <div class="flex flex-col gap-2">
      <UFormField label="In casa" class="w-full">
        <USelect v-model="homePlayer" :items="playerOptions" placeholder="Seleziona il giocatore di casa" class="w-full"/>
      </UFormField>
      <UFormField label="Ospite" class="w-full">
        <USelect v-model="awayPlayer" :items="playerOptions" placeholder="Seleziona il giocatore ospite" class="w-full"/>
      </UFormField>
      <UButton @click="startGame">
        Inizia partita
      </UButton>
    </div>
  </div>
</template>