<template>
  <UCard v-if="player">
    <template #header>
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          {{ player.label }}
        </h1>
        <div class="flex gap-2">
          <UButton
            v-if="!editing"
            icon="i-heroicons-pencil-square"
            @click="editing = true"
          >
            Edit
          </UButton>
          <UButton
            v-else
            icon="i-heroicons-x-mark"
            @click="editing = false"
          >
            Cancel
          </UButton>
          <UButton
            icon="i-heroicons-trash"
            color="error"
            @click="isDeleteModalOpen = true"
          />
        </div>
      </div>
    </template>

    <div v-if="editing">
      <UForm
        :state="player"
        class="space-y-4"
        @submit="savePlayer"
      >
        <UFormGroup
          label="Name"
          name="label"
        >
          <UInput v-model="player.label" />
        </UFormGroup>

        <UButton
          type="submit"
          :loading="saving"
        >
          Save
        </UButton>
      </UForm>
    </div>
    <div v-else>
      <p>Elo: {{ player.elo_rating }}</p>
    </div>
  </UCard>
  <UModal v-model:open="isDeleteModalOpen" title="Cancella giocatore">
    <template #body>
      <p>Sei sicuro di voler eliminare questo giocatore?</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          @click="isDeleteModalOpen = false"
        >
          Cancella
        </UButton>
        <UButton
          color="error"
          :loading="deleting"
          @click="deletePlayer"
        >
          Elimina
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase'

type Player = Database['public']['Tables']['players']['Row']

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const toast = useToast()
const router = useRouter()

const playerId = route.params.id
const isDeleteModalOpen = ref(false)
const deleting = ref(false)

const { data: player, error } = await useAsyncData<Player>(`player-${playerId}`, async () => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId as string)
    .single()
  if (error) {
    throw error
  }
  return data as Player
})

if (error.value) {
  console.error('Error fetching player:', error.value)
  toast.add({ title: 'Error fetching player', description: error.value.message, color: 'error' })
}

const editing = ref(false)
const saving = ref(false)

async function savePlayer () {
  if (!player.value) { return }
  saving.value = true
  try {
    const { error } = await supabase
      .from('players')
      .update({ label: player.value.label })
      .eq('id', player.value.id)

    if (error) {
      throw error
    }
    toast.add({ title: 'Player updated successfully' })
    editing.value = false
  } catch (error: any) {
    toast.add({ title: 'Error updating player', description: error.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

async function deletePlayer () {
  if (!player.value) { return }
  deleting.value = true
  try {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', player.value.id)

    if (error) {
      throw error
    }
    toast.add({ title: 'Player deleted successfully' })
    router.push('/')
  } catch (error: any) {
    toast.add({ title: 'Error deleting player', description: error.message, color: 'error' })
  } finally {
    deleting.value = false
    isDeleteModalOpen.value = false
  }
}
</script>