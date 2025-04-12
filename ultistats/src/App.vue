<script setup lang="ts"></script>

<template>
  <sl-split-panel>
    <template v-slot:start>
      <div
        style="
          height: 400px;
          background: var(--sl-color-neutral-50);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        "
      >
        Start
      </div>
    </template>
    <template v-slot:end>
      <div>
        <sl-split-panel vertical style="height: 400px">
          <template v-slot:start>
            <div
              style="
                height: 100%;
                background: var(--sl-color-neutral-50);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
              "
            >
              Top
            </div>
          </template>
          <template v-slot:end>
            <div
              style="
                height: 100%;
                background: var(--sl-color-neutral-50);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
              "
            >
              Bottom
            </div>
          </template>
        </sl-split-panel>
      </div>
    </template>
  </sl-split-panel>
</template>
