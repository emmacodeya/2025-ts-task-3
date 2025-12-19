<script setup lang="ts">
import 'bootstrap/js/dist/carousel'
import 'swiper/css'

import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import Swiper from 'swiper'
import { Autoplay } from 'swiper/modules'

import Footer from '@/components/Footer.vue'
import Navbar from '@/components/Navbar.vue'

import { apiGetProductDetail, apiGetProducts } from '@/api/products'
import { useCartStore } from '@/stores/cartStore'
import type { Product } from '@/types/product'

// 基本狀態
const route = useRoute()
const cartStore = useCartStore()

const productNum = ref<number>(1)
const productId = computed(() => route.params.id as string)

// 商品資料
const product = ref<Product>({
  category: '',
  content: '',
  description: '',
  id: '',
  imageUrl: '',
  imagesUrl: [],
  is_enabled: 0,
  num: 0,
  origin_price: 0,
  price: 0,
  title: '',
  unit: '',
})

// 推薦商品
const recommend = ref<Product[]>([])

const recommendCategory = computed<string>(() => product.value.category)

const recommendProducts = computed<Product[]>(() =>
  recommend.value.filter((p) => p.id !== productId.value),
)

// API
const getProductDetail = async (): Promise<void> => {
  try {
    const res = await apiGetProductDetail(productId.value)
    product.value = res.data.product
    await getRecommendProducts()
  } catch {
    alert('取得產品資訊失敗')
  }
}

const getRecommendProducts = async (): Promise<void> => {
  if (!recommendCategory.value) return

  try {
    const res = await apiGetProducts({
      category: recommendCategory.value,
    })
    recommend.value = res.data.products
  } catch {
    alert('取得推薦商品失敗')
  }
}

// lifecycle
onMounted(() => {
  getProductDetail()
})

watch(productId, () => {
  productNum.value = 1
  getProductDetail()
})

// Swiper
const swiperContainer = ref<HTMLElement | null>(null)
let swiperInstance: Swiper | null = null

watch(recommendProducts, async (list) => {
  if (!list.length) return

  await nextTick()

  if (swiperContainer.value) {
    swiperInstance?.destroy(true, true)

    swiperInstance = new Swiper(swiperContainer.value, {
      modules: [Autoplay],
      loop: true,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      slidesPerView: 2,
      spaceBetween: 10,
      breakpoints: {
        767: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      },
    })
  }
})

// 加入購物車
const handleAddCartItem = (): void => {
  cartStore.addCartItem({
    product_id: productId.value,
    qty: productNum.value,
  })
}
</script>

<template>
  <Navbar />

  <div class="container">
    <div class="row align-items-center">
      <!-- 左：圖片 -->
      <div class="col-md-7">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white px-0 py-3">
            <li class="breadcrumb-item">
              <RouterLink class="text-muted" to="/">首頁</RouterLink>
            </li>
            <li class="breadcrumb-item">
              <RouterLink class="text-muted" to="/products">產品列表</RouterLink>
            </li>
            <li class="breadcrumb-item active">產品詳細</li>
          </ol>
        </nav>

        <div id="carouselExample" class="carousel slide">
          <div class="carousel-inner">
            <div class="carousel-item active">
              <img :src="product.imageUrl" class="d-block w-100" alt="主圖" />
            </div>
            <div
              v-for="image in product.imagesUrl.filter(Boolean)"
              :key="image"
              class="carousel-item"
            >
              <img :src="image" class="d-block w-100" alt="副圖" />
            </div>
          </div>

          <button class="carousel-control-prev" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button class="carousel-control-next" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
          </button>
        </div>
      </div>

      <!-- 右：資訊 -->
      <div class="col-md-5">
        <h2 class="fw-bold h1">{{ product.title }}</h2>

        <p class="text-end text-muted">
          <del>NT$ {{ product.origin_price.toLocaleString('zh-TW') }}</del>
        </p>
        <p class="h4 fw-bold text-end">NT$ {{ product.price.toLocaleString('zh-TW') }}</p>

        <div class="row">
          <div class="col-6">
            <div class="input-group my-3 bg-light rounded">
              <button
                class="btn btn-outline-dark"
                :disabled="productNum <= 1"
                @click="productNum--"
              >
                −
              </button>
              <input class="form-control text-center bg-light" readonly :value="productNum" />
              <button class="btn btn-outline-dark" @click="productNum++">+</button>
            </div>
          </div>

          <div class="col-6">
            <button class="btn btn-dark w-100 py-2" @click="handleAddCartItem">加入購物車</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 說明 -->
    <div class="row my-5">
      <div class="col-md-4">{{ product.description }}</div>
      <div class="col-md-3 text-muted" style="white-space: pre-wrap">
        {{ product.content }}
      </div>
    </div>

    <!-- 推薦 -->
    <template v-if="recommendProducts.length">
      <h3 class="fw-bold">你可能會喜歡的植栽</h3>

      <div ref="swiperContainer" class="swiper mt-4 mb-5">
        <div class="swiper-wrapper">
          <div v-for="item in recommendProducts" :key="item.id" class="swiper-slide">
            <div class="card border-0">
              <img :src="item.imageUrl" class="card-img-top" style="height: 280px" />
              <div class="card-body p-0">
                <h4 class="mt-3">
                  <RouterLink :to="`/products/${item.id}`">
                    {{ item.title }}
                  </RouterLink>
                </h4>
                <p>
                  NT$ {{ item.price.toLocaleString('zh-TW') }}
                  <del class="text-muted ms-2">
                    NT$ {{ item.origin_price.toLocaleString('zh-TW') }}
                  </del>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <Footer />
</template>

<style lang="scss" scoped></style>
