<template>
    <div class="min-h-screen bg-background font-sans antialiased text-foreground">
        <AppSidebar />

        <div class="pl-64 flex flex-col min-h-screen transition-all duration-300">
            <AppTopbar />

            <main class="flex-1 p-6 space-y-6">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppTopbar from '~/components/layout/AppTopbar.vue'
</script>
