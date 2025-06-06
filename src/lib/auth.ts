// Check if user has purchased a product (simplified version)
export async function userHasPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  // For now, just return false until we set up a purchases system
  console.log('Checking purchase for user:', userId, 'product:', productId)
  return false
}

// Get user's purchased products (simplified version)
export async function getUserPurchasedProducts(userId: string) {
  // For now, return empty array until we set up a purchases system
  console.log('Getting purchased products for user:', userId)
  return []
}