import { defineNuxtPlugin } from "#app";
import ToastContainer from "~/components/ui/ToastContainer.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("ToastContainer", ToastContainer);
});
