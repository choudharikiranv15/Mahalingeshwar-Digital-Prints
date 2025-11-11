// =====================================================
// Wishlist Module
// =====================================================

import { SupabaseService } from './supabase-service.js';
import { addToCart } from './app.js'; // Import addToCart from app.js

export const WishlistManager = {
    wishlistItems: [],

    // Initialize wishlist
    async init() {
        await this.loadWishlist();
        this.updateWishlistCount();
        this.attachEventListeners();
    },

    // Load wishlist from database
    async loadWishlist() {
        try {
            this.wishlistItems = await SupabaseService.getWishlist();
            this.updateWishlistCount();
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    },

    // Update wishlist count badge
    updateWishlistCount() {
        const countElement = document.getElementById('wishlist-count');
        if (countElement) {
            countElement.textContent = this.wishlistItems.length;
            countElement.style.display = this.wishlistItems.length > 0 ? 'flex' : 'none';
        }
    },

    // Check if product is in wishlist
    isInWishlist(productId) {
        return this.wishlistItems.some(item => item.product_id === productId);
    },

    // Toggle product in wishlist
    async toggleWishlist(productId, heartButton) {
        try {
            const isCurrentlyInWishlist = this.isInWishlist(productId);

            if (isCurrentlyInWishlist) {
                // Remove from wishlist
                await SupabaseService.removeFromWishlist(productId);
                this.wishlistItems = this.wishlistItems.filter(item => item.product_id !== productId);

                if (heartButton) {
                    heartButton.classList.remove('active');
                    heartButton.innerHTML = '🤍';
                }

                this.showToast('Removed from wishlist', 'info');
            } else {
                // Add to wishlist
                await SupabaseService.addToWishlist(productId);
                this.wishlistItems.push({ product_id: productId, created_at: new Date().toISOString() });

                if (heartButton) {
                    heartButton.classList.add('active');
                    heartButton.innerHTML = '❤️';
                }

                this.showToast('Added to wishlist!', 'success');
            }

            this.updateWishlistCount();
            this.updateAllHeartButtons();
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            this.showToast('Failed to update wishlist', 'error');
        }
    },

    // Update all heart buttons to reflect wishlist status
    updateAllHeartButtons() {
        const heartButtons = document.querySelectorAll('.wishlist-btn');
        heartButtons.forEach(button => {
            const productId = button.dataset.productId;
            if (this.isInWishlist(productId)) {
                button.classList.add('active');
                button.innerHTML = '❤️';
            } else {
                button.classList.remove('active');
                button.innerHTML = '🤍';
            }
        });
    },

    // Show wishlist modal
    async showWishlistModal() {
        try {
            const products = await SupabaseService.getWishlistProducts();

            const modal = document.getElementById('wishlist-modal');
            const itemsContainer = document.getElementById('wishlist-items');
            const emptyMessage = document.getElementById('wishlist-empty');

            if (products.length === 0) {
                itemsContainer.innerHTML = '';
                itemsContainer.classList.add('hidden');
                emptyMessage.classList.remove('hidden');
            } else {
                emptyMessage.classList.add('hidden');
                itemsContainer.classList.remove('hidden');
                itemsContainer.innerHTML = products.map(product => `
                    <div class="wishlist-item" data-product-id="${product.id}">
                        <div class="wishlist-item-image">
                            ${product.imageUrl ?
                                `<img src="${product.imageUrl}" alt="${product.name}">` :
                                `<div class="product-icon">${product.icon}</div>`
                            }
                        </div>
                        <div class="wishlist-item-details">
                            <h4>${product.name}</h4>
                            <p class="wishlist-item-price">
                                ₹${product.price.toFixed(2)}
                                ${product.originalPrice ?
                                    `<span class="original-price">₹${product.originalPrice.toFixed(2)}</span>` :
                                    ''
                                }
                            </p>
                            <div class="wishlist-item-rating">
                                ${'⭐'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                                <span>(${product.reviews})</span>
                            </div>
                        </div>
                        <div class="wishlist-item-actions">
                            <button class="btn btn--sm btn--primary" onclick="WishlistManager.addToCartFromWishlist('${product.id}')">
                                Add to Cart
                            </button>
                            <button class="btn btn--sm btn--secondary" onclick="WishlistManager.removeFromWishlistUI('${product.id}')">
                                Remove
                            </button>
                        </div>
                    </div>
                `).join('');
            }

            modal.classList.remove('hidden');
        } catch (error) {
            console.error('Error showing wishlist modal:', error);
            this.showToast('Failed to load wishlist', 'error');
        }
    },

    // Hide wishlist modal
    hideWishlistModal() {
        const modal = document.getElementById('wishlist-modal');
        modal.classList.add('hidden');
    },

    // Remove product from wishlist (from modal)
    async removeFromWishlistUI(productId) {
        try {
            await SupabaseService.removeFromWishlist(productId);
            this.wishlistItems = this.wishlistItems.filter(item => item.product_id !== productId);
            this.updateWishlistCount();
            this.updateAllHeartButtons();

            // Remove from UI
            const itemElement = document.querySelector(`.wishlist-item[data-product-id="${productId}"]`);
            if (itemElement) {
                itemElement.remove();
            }

            // Check if wishlist is now empty
            const itemsContainer = document.getElementById('wishlist-items');
            if (itemsContainer.children.length === 0) {
                this.showWishlistModal(); // Refresh to show empty state
            }

            this.showToast('Removed from wishlist', 'info');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            this.showToast('Failed to remove from wishlist', 'error');
        }
    },

    // Add product to cart from wishlist
    async addToCartFromWishlist(productId) {
        try {
            // Get product details
            const product = await SupabaseService.getProductById(productId);
            if (product) {
                // Add to cart
                addToCart(product.id, 1); // Use the imported addToCart function
                this.showToast('Added to cart!', 'success');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showToast('Failed to add to cart', 'error');
        }
    },

    // Add all wishlist items to cart
    async addAllToCart() {
        try {
            const products = await SupabaseService.getWishlistProducts();

            if (products.length === 0) {
                this.showToast('Wishlist is empty', 'info');
                return;
            }

            let addedCount = 0;
            for (const product of products) {
                addToCart(product.id, 1);
                addedCount++;
            }

            this.showToast(`Added ${addedCount} items to cart!`, 'success');
            this.hideWishlistModal();
        } catch (error) {
            console.error('Error adding all to cart:', error);
            this.showToast('Failed to add items to cart', 'error');
        }
    },

    // Clear entire wishlist
    async clearWishlist() {
        if (!confirm('Are you sure you want to clear your entire wishlist?')) {
            return;
        }

        try {
            await SupabaseService.clearWishlist();
            this.wishlistItems = [];
            this.updateWishlistCount();
            this.updateAllHeartButtons();
            this.showWishlistModal(); // Refresh to show empty state
            this.showToast('Wishlist cleared', 'info');
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            this.showToast('Failed to clear wishlist', 'error');
        }
    },

    // Attach event listeners
    attachEventListeners() {
        // Wishlist indicator click
        const wishlistIndicator = document.getElementById('wishlist-indicator');
        if (wishlistIndicator) {
            wishlistIndicator.addEventListener('click', () => this.showWishlistModal());
        }

        // Close wishlist modal
        const closeBtn = document.getElementById('close-wishlist-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideWishlistModal());
        }

        const closeEmptyBtn = document.getElementById('close-empty-wishlist');
        if (closeEmptyBtn) {
            closeEmptyBtn.addEventListener('click', () => this.hideWishlistModal());
        }

        // Wishlist backdrop
        const backdrop = document.getElementById('wishlist-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.hideWishlistModal());
        }

        // Clear wishlist button
        const clearBtn = document.getElementById('clear-wishlist-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearWishlist());
        }

        // Add all to cart button
        const addAllBtn = document.getElementById('wishlist-to-cart-btn');
        if (addAllBtn) {
            addAllBtn.addEventListener('click', () => this.addAllToCart());
        }
    },

    // Show toast notification
    showToast(message, type = 'info') {
        // Use existing toast system if available, otherwise console log
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
};
