<script setup>
import { useI18n } from 'vue-i18n';
import ResetPassword from './Index.vue';

const PARTNER_PASSWORD_URL =
  'https://partner.takehk.com/desk/workspace/index';

const { t, te } = useI18n();

const copy = key => (te(key) ? t(key) : t(key, {}, { locale: 'zh_TW' }));
</script>

<template>
  <div
    class="flex flex-col justify-center w-full min-h-screen py-12 bg-n-brand/5 dark:bg-n-background sm:px-6 lg:px-8"
  >
    <section
      class="bg-white shadow sm:mx-auto sm:w-full sm:max-w-lg dark:bg-n-solid-2 p-11 sm:shadow-lg sm:rounded-lg"
    >
      <h1
        class="mb-1 text-2xl font-medium tracking-tight text-left text-n-slate-12"
      >
        {{ copy('RESET_PASSWORD.PARTNER.TITLE') }}
      </h1>
      <p
        class="mb-4 text-sm font-normal leading-6 tracking-normal text-n-slate-11"
      >
        {{ copy('RESET_PASSWORD.PARTNER.DESCRIPTION') }}
      </p>
      <p class="text-sm font-medium leading-6 text-n-slate-12">
        {{ copy('RESET_PASSWORD.PARTNER.PATH') }}
      </p>
      <a
        :href="PARTNER_PASSWORD_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center w-full h-12 px-5 mt-6 text-base text-white transition-all duration-100 ease-out border-0 rounded-lg outline outline-1 outline-transparent bg-n-brand hover:brightness-110"
      >
        {{ copy('RESET_PASSWORD.PARTNER.ACTION') }}
      </a>
      <p class="mt-3 text-sm break-all text-n-slate-11">
        <a
          :href="PARTNER_PASSWORD_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="underline text-n-brand"
        >
          {{ PARTNER_PASSWORD_URL }}
        </a>
      </p>
      <p class="mt-4 -mb-1 text-sm text-n-slate-11">
        {{ copy('RESET_PASSWORD.GO_BACK_TO_LOGIN') }}
        <router-link to="/auth/login" class="text-link text-n-brand">
          {{ copy('COMMON.CLICK_HERE') }}.
        </router-link>
      </p>
    </section>
    <div class="hidden" aria-hidden="true">
      <ResetPassword />
    </div>
  </div>
</template>
