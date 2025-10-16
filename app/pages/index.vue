<script setup lang="ts">
interface Profile {
  id: number
  username: string
  // Add other profile fields here
}

const supabase = useSupabaseClient()
const players = ref<Profile[] | null>([])

async function getProfiles() {
  const { data } = await supabase.from('players').select('*')
  if (data) {
    players.value = data
  }
}
</script>

<template>
  <div>
    <UButton @click="getProfiles">
      Fetch Profiles
    </UButton>
    <pre>{{ players }}</pre>
  </div>
</template>
