<template>
  <div class="flex flex-col items-center gap-4 p-4">
    <h1>Aggiungi nuovo giocatore</h1>
    <form @submit.prevent="addPlayer" class="w-full flex flex-col gap-2">
      <u-form-field label="Nome giocatore">
        <UInput id="label" v-model="label" type="text" required />
      </u-form-field>
      <UButton type="submit">Aggiungi Giocatore</UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Database } from '~/types/supabase'

const supabase = useSupabaseClient<Database>()
const router = useRouter()

const label = ref('')
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const addPlayer = async () => {
  loading.value = true
  errorMsg.value = null
  try {
    const { error } = await supabase
      .from('players')
      .insert({ label: label.value })

    if (error) throw error

    router.push('/')
  } catch (error: any) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>