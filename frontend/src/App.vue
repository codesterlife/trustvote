<template>
  <div id="app">
    <Navbar />
    <div class="container mt-4 mb-5 pb-5">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <Footer />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-success {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.btn-metamask {
  background-color: #F6851B;
  border-color: #F6851B;
  color: white;
}

.btn-metamask:hover {
  background-color: #E2761B;
  border-color: #E2761B;
  color: white;
}

.badge-init {
  background-color: #6c757d;
}

.badge-voting {
  background-color: var(--secondary-color);
}

.badge-closed {
  background-color: var(--dark-color);
}

.card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
  background-color: var(--primary-color);
  color: white;
}

.form-control:focus, .btn:focus {
  box-shadow: 0 0 0 0.25rem rgba(52, 152, 219, 0.25);
}
</style>
