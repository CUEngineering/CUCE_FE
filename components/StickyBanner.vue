<template>
  <section
    v-if="stickyData"
    class="component entry sticky-banner"
    :class="[stickyData.state]"
  >
    {{ stickyData.message }}
  </section>
</template>

<script setup lang="ts">
import { useNow } from '@vueuse/core';
import { formatDistance, isPast } from 'date-fns';

const sessionStore = useSessionStore();

sessionStore.activeSessionResp.execute({ dedupe: 'cancel' });

const activeSession = computed(
  () => sessionStore.activeSessionResp.data?.value ?? undefined,
);

const isLoadingActiveSession = computed(
  () => sessionStore.activeSessionResp.status?.value === 'pending',
);

const currentDate = useNow();

const stickyData = computed(() => {
  if (!activeSession.value) {
    if (isLoadingActiveSession.value) {
      return undefined;
    }

    return {
      state: 'danger',
      message: `Ooops... There is no active session at the moment.`,
    };
  }

  if (isPast(activeSession.value.enrollment_deadline)) {
    return {
      state: 'danger',
      message: `Ooops... Course enrollment deadline has passed. Hence course registration is closed for this session`,
    };
  }

  const distanceFromNow = formatDistance(
    activeSession.value.enrollment_deadline,
    currentDate.value,
    {
      addSuffix: true,
      includeSeconds: true,
    },
  );

  return {
    state: 'warning',
    message: `Course enrollment will be closed for this session ${distanceFromNow}`,
  };
});
</script>

<style scoped lang="scss">
.component.entry.sticky-banner {
  display: flex;
  padding: 15px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background-color: #f9fafb;
  margin: 0 0 15px 0;

  &.warning {
    background-color: #d7dba7;
  }

  &.danger {
    background-color: #e1a9a2;
  }
}
</style>
