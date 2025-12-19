<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { apiCreateOrder, apiProcessPayment } from '@/api/order'
import Navbar from '@/components/Navbar.vue'
import { useCartStore } from '@/stores/cartStore'

// router
const router = useRouter()

// step
const step = ref<1 | 2>(1)

// store
const cartStore = useCartStore()
const { cart } = storeToRefs(cartStore)

// lifecycle
onMounted(() => {
  cartStore.getCart()
})

// order
const orderId = ref<string | null>(null)

// form
const form = ref({
  email: '',
  name: '',
  tel: '',
  address: '',
  message: '',
})

// submit control
const isSubmitted = ref(false)
const isSubmitting = ref(false)

// ===== 驗證 =====
const isEmailValid = computed(() => {
  const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  return emailPattern.test(form.value.email.trim())
})

const isNameValid = computed(() => form.value.name.trim() !== '')

const isPhoneValid = computed(() => {
  const phonePattern = /^09\d{8}$/
  return phonePattern.test(form.value.tel.trim())
})

const isAddressValid = computed(() => form.value.address.trim() !== '')

// ===== 建立訂單 =====
const handleSubmit = async (): Promise<void> => {
  try {
    isSubmitting.value = true

    const { message, ...user } = form.value

    const res = await apiCreateOrder({
      user,
      message,
    })

    orderId.value = res.data.orderId
    step.value = 2
  } catch {
    alert('訂單建立失敗')
  } finally {
    isSubmitting.value = false
  }
}

// ===== 下一步（重點修正）=====
const handleNextStep = (): void => {
  isSubmitted.value = true

  if (!isEmailValid.value || !isNameValid.value || !isPhoneValid.value || !isAddressValid.value) {
    return
  }

  handleSubmit()
}

// ===== 付款 =====
const isProcessingPayment = ref(false)

const handleProcessPayment = async (): Promise<void> => {
  if (!orderId.value) return

  try {
    isProcessingPayment.value = true

    await apiProcessPayment(orderId.value)
    await cartStore.getCart()

    router.push('/checkout-success')
  } catch {
    alert('付款失敗')
  } finally {
    isProcessingPayment.value = false
  }
}
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <Navbar />
      </div>
    </div>

    <template v-if="cart?.carts.length">
      <div class="row justify-content-center">
        <div class="col-md-10">
          <h3 v-if="step === 1" class="fw-bold mb-4 pt-3">輸入結帳資訊</h3>
          <h3 v-else class="fw-bold mb-4 pt-3">選擇付款方式</h3>
        </div>
      </div>

      <div class="row flex-row-reverse justify-content-center pb-5">
        <!-- 訂單資訊 -->
        <div class="col-md-4">
          <div class="border p-4 mb-4">
            <div class="d-flex flex-column gap-2">
              <div v-for="cartItem in cart.carts" :key="cartItem.id" class="d-flex">
                <img
                  :src="cartItem.product.imageUrl"
                  :alt="cartItem.product.title"
                  style="width: 48px; height: 48px; object-fit: cover"
                  class="me-2"
                />
                <div class="w-100">
                  <div class="d-flex justify-content-between">
                    <p class="mb-0 fw-bold">{{ cartItem.product.title }}</p>
                    <p class="mb-0">NT${{ cartItem.final_total.toLocaleString('zh-TW') }}</p>
                  </div>
                  <p class="mb-0 fw-bold">x{{ cartItem.qty }}</p>
                </div>
              </div>
            </div>

            <table class="table mt-4 border-top border-bottom text-muted">
              <tbody>
                <tr>
                  <th class="border-0 px-0 pt-4">小計</th>
                  <td class="text-end border-0 px-0 pt-4">
                    NT${{ cart.total.toLocaleString('zh-TW') }}
                  </td>
                </tr>
                <tr>
                  <th class="border-0 px-0 pt-0 pb-4">付款方式</th>
                  <td class="text-end border-0 px-0 pt-0 pb-4">ApplePay</td>
                </tr>
              </tbody>
            </table>

            <div class="d-flex justify-content-between mt-4">
              <p class="mb-0 h4 fw-bold">總計</p>
              <p class="mb-0 h4 fw-bold">NT${{ cart.final_total.toLocaleString('zh-TW') }}</p>
            </div>
          </div>
        </div>

        <!-- 表單 / 付款 -->
        <div class="col-md-6">
          <form v-if="step === 1">
            <div class="mb-2">
              <label for="email" class="text-muted mb-0">電子信箱</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                id="email"
                placeholder="example@gmail.com"
              />
              <span v-if="!isEmailValid && isSubmitted" class="text-danger small mt-1">
                請輸入正確的電子信箱
              </span>
            </div>

            <div class="mb-2">
              <label for="name" class="text-muted mb-0">姓名</label>
              <input
                v-model="form.name"
                type="text"
                class="form-control"
                id="name"
                placeholder="請輸入姓名"
              />
              <span v-if="!isNameValid && isSubmitted" class="text-danger small"> 請輸入姓名 </span>
            </div>

            <div class="mb-2">
              <label for="tel" class="text-muted mb-0">手機</label>
              <input
                v-model="form.tel"
                type="text"
                class="form-control"
                id="tel"
                placeholder="請輸入手機"
              />
              <span v-if="!isPhoneValid && isSubmitted" class="text-danger small">
                請輸入正確的手機號碼
              </span>
            </div>

            <div class="mb-2">
              <label for="address" class="text-muted mb-0">地址</label>
              <input
                v-model="form.address"
                type="text"
                class="form-control"
                id="address"
                placeholder="請輸入地址"
              />
              <span v-if="!isAddressValid && isSubmitted" class="text-danger small">
                請輸入正確的地址
              </span>
            </div>

            <div class="mb-2">
              <label for="message" class="text-muted mb-0">留言</label>
              <textarea
                v-model="form.message"
                class="form-control"
                rows="3"
                id="message"
                placeholder="有什麼要留言給我們的嗎?"
              ></textarea>
            </div>
          </form>

          <div v-else class="card rounded-0">
            <div class="card-header bg-white border-0 py-3">
              <p class="mb-0">Apple Pay</p>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <template v-if="step === 1">
              <RouterLink to="/cart" class="text-dark">
                <i class="fas fa-chevron-left me-2"></i>返回
              </RouterLink>
              <button
                @click="handleNextStep"
                :disabled="
                  isSubmitting || !isEmailValid || !isNameValid || !isPhoneValid || !isAddressValid
                "
                class="btn btn-dark px-5"
              >
                下一步
              </button>
            </template>

            <template v-else>
              <button @click="step = 1" class="btn btn-link text-dark p-0">
                <i class="fas fa-chevron-left me-2"></i>返回
              </button>
              <button
                @click="handleProcessPayment"
                :disabled="isProcessingPayment"
                class="btn btn-dark px-5"
              >
                結帳
              </button>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
