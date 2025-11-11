// =====================================================
// Wishlist UI Enhancer
// Adds wishlist heart buttons to product cards
// =====================================================

(function() {
    'use strict';

    // Add heart button to product cards
    function addWishlistButtonsToProducts() {
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            // Skip if already has wishlist button
            if (card.querySelector('.wishlist-btn')) return;

            const productId = card.getAttribute('data-product-id');
            if (!productId) return;

            // Create wishlist button
            const wishlistBtn = document.createElement('button');
            wishlistBtn.className = 'wishlist-btn';
            wishlistBtn.dataset.productId = productId;
            wishlistBtn.innerHTML = '🤍';
            wishlistBtn.title = 'Add to wishlist';
            wishlistBtn.setAttribute('aria-label', 'Add to wishlist');

            // Add click handler
            wishlistBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (window.WishlistManager) {
                    await window.WishlistManager.toggleWishlist(productId, wishlistBtn);
                }
            });

            // Find the best place to insert the button
            const productImage = card.querySelector('.product-image, img');
            if (productImage && productImage.parentElement) {
                const imageContainer = productImage.parentElement;

                // Make sure the container is positioned relatively
                imageContainer.style.position = 'relative';

                // Insert the button
                imageContainer.appendChild(wishlistBtn);
            }
        });

        // Update heart buttons to reflect current wishlist status
        if (window.WishlistManager) {
            window.WishlistManager.updateAllHeartButtons();
        }
    }

    // Run on page load
    function init() {
        addWishlistButtonsToProducts();

        // Re-run when products are loaded dynamically
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('product-card')) {
                            shouldUpdate = true;
                        } else if (node.querySelectorAll) {
                            const products = node.querySelectorAll('.product-card');
                            if (products.length > 0) {
                                shouldUpdate = true;
                            }
                        }
                    }
                });
            });

            if (shouldUpdate) {
                // Slight delay to ensure products are fully rendered
                setTimeout(() => addWishlistButtonsToProducts(), 100);
            }
        });

        // Observe the entire document for product cards being added
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also run periodically to catch any missed additions
        setInterval(() => addWishlistButtonsToProducts(), 2000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
