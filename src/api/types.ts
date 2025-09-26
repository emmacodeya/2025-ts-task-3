import type { components, paths } from '../openapi/types/ec-course'

// Products
export type GetProductsParams = Exclude<
  paths['/v2/api/{api_path}/products']['get']['parameters']['query'],
  undefined
>
export type GetProductsResponse = components['schemas']['getProducts']

export type GetAllProductsResponse = components['schemas']['getProductsAll']
