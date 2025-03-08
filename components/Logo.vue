<template>
  <div class="logo">
    <img :src="logoIcon" alt="Charisma Logo" class="logo-icon" />
  </div>
</template>

<script>
import logoIcon from "@/assets/images/CU_Logo.svg";

export default {
  data() {
    return {
      logoIcon: logoIcon,
    };
  },
};
</script>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: center;

  .logo-icon {
    width: 80px;
    height: 80px;
  }
}
</style>
