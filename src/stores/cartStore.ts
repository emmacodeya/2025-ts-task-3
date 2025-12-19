import { defineStore } from 'pinia'
import { ref } from 'vue'

import { apiAddCartItem, apiDeleteCartItem, apiGetCart, apiUpdateCartItem } from '@/api/cart'

import type { CartInfo } from '@/types/cart'

export const useCartStore = defineStore('cart', () => {
  // 購物車資料
  const cart = ref<CartInfo>({
    carts: [],
    total: 0,
    final_total: 0,
  })

  // 狀態
  const isUpdating = ref<boolean>(false)
  const isDeleting = ref<boolean>(false)

  // 取得購物車
  const getCart = async (): Promise<void> => {
    try {
      const res = await apiGetCart()
      cart.value = res.data.data
    } catch {
      alert('取得購物車失敗')
    }
  }

  // 新增商品到購物車
  const addCartItem = async (params: { product_id: string; qty: number }): Promise<void> => {
    try {
      await apiAddCartItem({
        product_id: params.product_id,
        qty: params.qty,
      })
      await getCart()
    } catch {
      alert('加入購物車失敗')
    }
  }

  // 更新購物車商品數量
  const updateCartItem = async (params: {
    id: string
    product_id: string
    qty: number
  }): Promise<void> => {
    try {
      isUpdating.value = true

      await apiUpdateCartItem({
        id: params.id,
        product_id: params.product_id,
        qty: params.qty,
      })

      await getCart()
    } catch {
      alert('更新購物車失敗')
    } finally {
      isUpdating.value = false
    }
  }

  // 刪除購物車商品
  const deleteCartItem = async (cartId: string): Promise<void> => {
    try {
      isDeleting.value = true

      await apiDeleteCartItem(cartId)
      await getCart()
    } catch {
      alert('刪除購物車項目失敗')
    } finally {
      isDeleting.value = false
    }
  }

  return {
    cart,
    isUpdating,
    isDeleting,
    getCart,
    addCartItem,
    updateCartItem,
    deleteCartItem,
  }
})
