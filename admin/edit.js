const editButton = productRow.querySelector('.btn-primary');
editButton.addEventListener('click', () => {
    const editProductModal = document.querySelector('#editProductModal');
    const editProductForm = editProductModal.querySelector('.edit-product-form');
    editProductForm.productId.value = product.productId;
    editProductForm.name.value = product.name;
    editProductForm.price.value = product.price;
    editProductForm.stock.value = product.stock;
    editProductForm.category.value = product.category;
    editProductForm.imageUrl.value = product.imageUrl;
    const editProductSubmit = editProductModal.querySelector('.edit-product-submit');
    editProductSubmit.addEventListener('click', async (e) => {
        e.preventDefault();
        const formData = new FormData(editProductForm);
        const tokenCookie = await cookieStore.get('token');

        if (!tokenCookie || !tokenCookie.value) {
            console.error('No token found in cookie store. Please log in.');
            throw new Error('Authentication token not found.');
        }

        const token = tokenCookie.value;
        try {
            const response = await fetch(`http://localhost:5000/admin/edit-product/${product.productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to edit product:', JSON.stringify(errorData, null, 2));
                throw new Error(`Failed to edit product: ${errorData.message || response.statusText}`);
            }
            alert('Product updated successfully!');
            fetchProducts();
            editProductModal.querySelector('.btn-close').click();
        } catch (error) {
            console.error('Error editing product:', error);
            throw error;
        }
    })
    editProductModal.querySelector('.btn-close').click();
    editProductModal.showModal();
    editProductModal.addEventListener('click', (e) => {
        if (e.target === editProductModal) {
            editProductModal.close();
        }
    });
}
);
