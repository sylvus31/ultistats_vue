<script setup lang="ts">
import '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/details/details.js'
</script>

<template>
  yoh
  <sl-button>Button</sl-button>
  <sl-button>Button</sl-button>
  <!-- eslint-disable vue/no-deprecated-slot-attribute -->
  <!-- prettier-ignore -->
  <sl-split-panel>
    <div slot="start">
      <sl-split-panel vertical>
        <div slot="start">a1</div>
        <div slot="end">a2</div>
      </sl-split-panel>
    </div>
    <div slot="end">
      <sl-details summary="Toggle Me">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
  aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</sl-details>
<sl-details summary="Toggle Me">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
  aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</sl-details>
<sl-details summary="Toggle Me">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
  aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</sl-details>
    </div>
  </sl-split-panel>
</template>

<style></style>
